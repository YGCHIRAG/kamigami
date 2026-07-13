const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

exports.processRazorpayWebhook = async (payload) => {
  const { event: eventType, payload: eventPayload, account_id } = payload;
  const eventId = payload.id;

  // 1. Idempotency Check
  const existingEvent = await prisma.paymentEvent.findUnique({
    where: { eventId }
  });
  if (existingEvent) return { status: 'already_processed' };

  // 2. Extract Data
  // Note: For payment.captured, order_id is in payload.payment.entity.order_id
  const paymentEntity = eventPayload?.payment?.entity;
  if (!paymentEntity) {
    return { status: 'ignored_event' };
  }
  const razorpayOrderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;

  // Find order by paymentIntentId (which we store as razorpay_order_id)
  const order = await prisma.order.findFirst({
    where: { paymentIntentId: razorpayOrderId },
    include: { items: true }
  });

  if (!order) {
    // We still log the event even if order not found for auditing
    await prisma.paymentEvent.create({
      data: {
        eventId,
        eventType,
        provider: 'razorpay',
        payload
      }
    });
    throw new AppError('Order not found', 404);
  }

  // 3. Process Event
  if (eventType === 'payment.captured') {
    if (order.status === 'PAID' && order.awbCode) return { status: 'already_paid' };
    
    if (order.status !== 'PAID') {
      await handlePaymentSuccess(order, payload);
    }

    const logisticsService = require('../logistics/logistics.service');
    
    // Concurrency Lock: Try to update order shipmentStatus to 'booking' to ensure single shipment registration
    const lockResult = await prisma.order.updateMany({
      where: {
        id: order.id,
        status: 'PAID',
        awbCode: null,
        OR: [
          { shipmentStatus: { in: ['pending', 'failed'] } },
          { shipmentStatus: null }
        ]
      },
      data: {
        shipmentStatus: 'booking'
      }
    });

    if (lockResult.count > 0) {
      try {
        await logisticsService.createShipment(null, order.id);
        console.log(`[Webhook] Shiprocket order created successfully for order #${order.orderNumber}`);
      } catch (shipmentErr) {
        console.error(`[Webhook] Shiprocket dispatch failed for order #${order.orderNumber}:`, shipmentErr.message);
        await compensateFailedShipment(order, paymentId);
      }
    }

    return { status: 'processed_success' };
  } else if (eventType === 'payment.failed') {
    if (order.status === 'FAILED') return { status: 'already_failed' };
    return await handlePaymentFailure(order, payload);
  }

  return { status: 'ignored_event' };
};

async function handlePaymentSuccess(order, payload) {
  const { redisClient } = require('../../db/redis');
  const lockKey = `lock:payment:${order.id}`;

  // Set NX with a 10s expiry to prevent concurrent attempts
  const acquired = await redisClient.set(lockKey, 'locked', {
    NX: true,
    EX: 10
  });

  if (!acquired) {
    throw new AppError('Payment processing already in progress. Please retry.', 409);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Re-verify status inside transaction
      const currentOrder = await tx.order.findUnique({
        where: { id: order.id }
      });
      if (currentOrder.status === 'PAID') {
        return { status: 'already_paid' };
      }

      // A. Update Order
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID' }
      });

      // B. Deduct Inventory
      for (const item of order.items) {
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId }
        });

        if (!inventory) throw new AppError(`Inventory not found for variant ${item.variantId}`, 409);

        // Validate constraints
        if (inventory.stockReserved < item.quantity || inventory.stockTotal < item.quantity) {
          console.error(`[Razorpay] Inventory inconsistency for variant ${item.variantId}. Reserved: ${inventory.stockReserved}, Total: ${inventory.stockTotal}, Required: ${item.quantity}`);
          throw new AppError('Inventory inconsistency detected during capture', 409);
        }

        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            stockReserved: { decrement: item.quantity },
            stockTotal: { decrement: item.quantity }
          }
        });

        // C. Insert Inventory Logs
        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            changeAmount: -item.quantity,
            reason: 'PURCHASE',
            referenceId: order.id
          }
        });
      }

      // D. Log Payment Event (Idempotency)
      await tx.paymentEvent.create({
        data: {
          eventId: payload.id,
          eventType: payload.event,
          provider: 'razorpay',
          payload
        }
      });

      // E. Redis Cleanup for Drops
      for (const item of order.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        });
        if (variant.product.isDrop) {
          const reservationKey = `reservation:${order.userId}:${item.variantId}`;
          await redisClient.del(reservationKey);
        }
      }

      return { status: 'processed_success' };
    });
  } finally {
    await redisClient.del(lockKey);
  }
}

async function handlePaymentFailure(order, payload) {
  return await prisma.$transaction(async (tx) => {
    // Update Order
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'FAILED' }
    });

    // Restore Reserved Stock (Optional but recommended)
    for (const item of order.items) {
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          stockReserved: { decrement: item.quantity },
          stockAvailable: { increment: item.quantity }
        }
      });
    }

    // Log Payment Event
    await tx.paymentEvent.create({
      data: {
        eventId: payload.id,
        eventType: payload.event,
        provider: 'razorpay',
        payload
      }
    });

    // Redis Restore for Drops
    const { redisClient } = require('../../db/redis');
    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });
      if (variant.product.isDrop) {
        const activeDrop = await tx.drop.findFirst({
          where: {
            status: 'ACTIVE',
            dropProducts: { some: { productId: variant.productId } }
          }
        });
        if (activeDrop) {
          const stockKey = `drop:${activeDrop.id}:variant:${item.variantId}:stock`;
          await redisClient.incrBy(stockKey, item.quantity);
        }
        const reservationKey = `reservation:${order.userId}:${item.variantId}`;
        await redisClient.del(reservationKey);
      }
    }

    return { status: 'processed_failure' };
  });
}

exports.processMockPaymentSuccess = async (orderId) => {
  const logisticsService = require('../logistics/logistics.service');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  if (!order) throw new AppError('Order not found', 404);
  if (order.status === 'PAID') return { status: 'already_paid', order };

  // 1. Process payment success in DB
  const mockPayload = { id: `mock_evt_${Date.now()}`, event: 'payment.captured' };
  await handlePaymentSuccess(order, mockPayload);

  // 2. Trigger automatic Shiprocket shipping integration
  try {
    const shipmentResult = await logisticsService.createShipment(null, orderId);
    console.log('[MockPayment] Shiprocket order created successfully!');
    return { status: 'processed_success', order: shipmentResult };
  } catch (shipmentErr) {
    console.error('[MockPayment] Shiprocket dispatch failed:', shipmentErr.message);
    throw new AppError(`Logistics dispatch failed: ${shipmentErr.message || 'Courier partner rejected details'}`, 422);
  }
  
};

exports.verifyPaymentSignature = async (userId, data) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;
  const crypto = require('crypto');
  const logisticsService = require('../logistics/logistics.service');

  // 1. Verify HMAC Signature
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new AppError('Razorpay Key Secret is not configured on the server', 500);
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new AppError('Payment signature verification failed. Invalid transaction.', 400);
  }

  // 2. Fetch the corresponding order
  const order = await prisma.order.findFirst({
    where: { paymentIntentId: razorpay_order_id },
    include: { items: true }
  });

  if (!order) {
    throw new AppError('Order associated with this payment intent not found', 404);
  }

  // Security check: Verify order belongs to the user
  if (order.userId !== userId) {
    throw new AppError('Unauthorized access to verify this order payment', 403);
  }

  // If already paid, return early if AWB is already present or status is SHIPPED/DELIVERED
  if (order.status === 'SHIPPED' || order.status === 'DELIVERED' || (order.status === 'PAID' && order.awbCode)) {
    return { status: 'already_paid', order };
  }

  if (order.status !== 'PAID') {
    // 3. Mark payment as success in database and deduct inventory
    const mockPayload = {
      id: razorpay_payment_id,
      event: 'payment.captured',
      rawBody: data
    };

    console.log('[PaymentVerify] Step 1: Running DB payment success transaction...');
    await handlePaymentSuccess(order, mockPayload);
    console.log('[PaymentVerify] Step 2: DB transaction committed. Order marked PAID.');
  }

  // Concurrency Lock: Try to update order shipmentStatus to 'booking' to ensure single shipment registration
  const lockResult = await prisma.order.updateMany({
    where: {
      id: order.id,
      status: 'PAID',
      awbCode: null,
      OR: [
        { shipmentStatus: { in: ['pending', 'failed'] } },
        { shipmentStatus: null }
      ]
    },
    data: {
      shipmentStatus: 'booking'
    }
  });

  if (lockResult.count === 0) {
    console.log('[PaymentVerify] Concurrency lock could not be acquired. Reloading order details...');
    const reloadedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    return { status: 'verification_success', order: reloadedOrder };
  }

  // 4. Trigger Shiprocket order dispatch — if this fails, compensate fully
  try {
    console.log('[PaymentVerify] Step 3: Dispatching Shiprocket order creation...');
    const shipmentResult = await logisticsService.createShipment(null, order.id);
    console.log('[PaymentVerify] Step 4: Shiprocket order registered! AWB:', shipmentResult?.awbCode);
  } catch (shipmentErr) {
    console.error('[PaymentVerify] ❌ Shiprocket dispatch failed:', shipmentErr.message);
    await compensateFailedShipment(order, razorpay_payment_id);

    throw new AppError(
      `Payment captured but shipment booking failed: ${shipmentErr.message}. Your payment has been refunded.`,
      422
    );
  }

  // 5. Fetch the updated order with AWB details
  const updatedOrder = await prisma.order.findUnique({
    where: { id: order.id }
  });

  return { status: 'verification_success', order: updatedOrder };
};

async function compensateFailedShipment(order, paymentId) {
  console.log(`[PaymentVerify] ⚠️  Initiating compensation: reverting order status and issuing Razorpay refund for payment: ${paymentId}...`);

  // Compensation Step A: Mark order as FAILED and restore inventory
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'FAILED', shipmentStatus: 'failed' }
    });
    for (const item of order.items) {
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          stockAvailable: { increment: item.quantity },
          stockTotal: { increment: item.quantity }
        }
      });
    }
  });
  console.log('[PaymentVerify] ✅ Inventory restored, order marked FAILED.');

  // Compensation Step A.1: If order was created in Shiprocket before crashing, cancel it there
  try {
    const shiprocket = require('../logistics/logistics.provider');
    const updatedOrderDetails = await prisma.order.findUnique({
      where: { id: order.id }
    });
    const shiprocketOrderId = updatedOrderDetails?.metadata?.shiprocketOrderId;
    if (shiprocketOrderId) {
      console.log(`[PaymentVerify] 📡 Requesting Shiprocket cancellation for Shiprocket Order ID: ${shiprocketOrderId}...`);
      await shiprocket.cancelOrder(shiprocketOrderId);
      console.log(`[PaymentVerify] ✅ Shiprocket order ${shiprocketOrderId} successfully cancelled.`);
    } else {
      console.warn('[PaymentVerify] ⚠️  Shiprocket order ID not found in metadata — order may not have been created in Shiprocket yet.');
    }
  } catch (cancelErr) {
    console.error('[PaymentVerify] ⚠️ Shiprocket order cancellation failed or order was not created:', cancelErr.message);
  }

  // Compensation Step B: Issue Razorpay refund
  if (paymentId) {
    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      const amountInPaise = Math.round(parseFloat(order.totalAmount) * 100);
      await razorpay.payments.refund(paymentId, { amount: amountInPaise });
      console.log('[PaymentVerify] ✅ Razorpay refund issued for payment:', paymentId);
    } catch (refundErr) {
      console.error('[PaymentVerify] ❌ Razorpay refund failed (manual action required):', refundErr.message);
    }
  }
}

