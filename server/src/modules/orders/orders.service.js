const prisma = require('../../db/prisma');
const { redisClient } = require('../../db/redis');
const AppError = require('../../common/errors/AppError');
const ordersUtils = require('./orders.utils');
const Razorpay = require('razorpay');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError('Razorpay keys are not configured on the server.', 500);
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

exports.createCheckoutIntent = async (userId, payload, idempotencyKey) => {
  const { shippingAddressId, billingAddressId, items } = payload;

  // 1. Idempotency Check
  if (idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey }
    });
    if (existingOrder) {
      // In a real scenario, you'd also check if the user is the same
      // Return existing payment intent info
      return {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        paymentIntentId: existingOrder.paymentIntentId,
        totalAmount: parseFloat(existingOrder.totalAmount),
        currency: existingOrder.currency,
        isExisting: true
      };
    }
  }

  // 2. Validate Addresses
  const [shippingAddress, billingAddress] = await Promise.all([
    prisma.address.findUnique({ where: { id: shippingAddressId } }),
    prisma.address.findUnique({ where: { id: billingAddressId } })
  ]);

  if (!shippingAddress || shippingAddress.userId !== userId) throw new AppError('Invalid shipping address', 400);
  if (!billingAddress || billingAddress.userId !== userId) throw new AppError('Invalid billing address', 400);

  // 3. Validate Items and Calculate Prices
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    let variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: {
        product: true,
        inventory: true
      }
    });

    if (!variant) {
      // Fallback: check if the ID refers to a Product ID instead of a Variant ID
      const product = await prisma.product.findUnique({
        where: { id: item.variantId },
        include: {
          variants: {
            include: { inventory: true }
          }
        }
      });
      if (product && product.variants && product.variants.length > 0) {
        // Use the first variant as the fallback default
        const firstVariant = product.variants[0];
        variant = {
          ...firstVariant,
          product: product,
          inventory: firstVariant.inventory
        };
      }
    }

    if (!variant) {
      // Fallback: check if the ID refers to a Product without variants
      const productOnly = await prisma.product.findUnique({
        where: { id: item.variantId },
        // No need for variants include
      });
      if (productOnly) {
        // Create a mock variant using the product's basic info
        variant = {
          id: productOnly.id,
          product: productOnly,
          price: productOnly.basePrice || 0,
          inventory: { stockAvailable: 9999 }, // assume ample stock for dummy products
          sku: productOnly.sku || productOnly.id,
          attributes: {}
        };
      }
    }
    if (!variant) throw new AppError(`Variant ${item.variantId} not found`, 404);

    // Drop Validation
    if (item.isDrop || variant.product.isDrop) {
      const reservationKey = `reservation:${userId}:${item.variantId}`;
      const reservationExists = await redisClient.exists(reservationKey);
      if (!reservationExists) {
        throw new AppError(`No valid reservation found for drop item: ${variant.product.name}`, 409);
      }
    } else {
      // Standard Validation
      if (variant.inventory.stockAvailable < item.quantity) {
        throw new AppError(`Insufficient stock for ${variant.product.name}`, 409);
      }
    }

    const priceAtPurchase = parseFloat(variant.price || variant.product.basePrice);
    subtotal += priceAtPurchase * item.quantity;

    processedItems.push({
      variantId: variant.id,
      sku: variant.sku,
      name: variant.product.name,
      attributes: variant.attributes,
      quantity: item.quantity,
      priceAtPurchase
    });
  }

  // 4. Final Calculations
  const shippingAmount = 0; // Placeholder
  const taxAmount = 0; // Placeholder
  const totalAmount = subtotal + shippingAmount + taxAmount;

  // 5. Generate Order Number and Create Razorpay Order
  const orderNumber = ordersUtils.generateOrderNumber();
  const amountPaise = Math.round(totalAmount * 100);

  if (amountPaise < 100) {
    throw new AppError('Minimum order amount must be at least ₹1.00', 400);
  }

  let rzpOrder;
  try {
    const razorpay = getRazorpayInstance();
    rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: orderNumber
    });
  } catch (err) {
    console.error('[Razorpay] Order creation failed:', err);
    throw new AppError(`Razorpay Order creation failed: ${err.message || 'Unknown error'}`, 502);
  }

  // 6. Database Transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderNumber: orderNumber,
        idempotencyKey,
        paymentIntentId: rzpOrder.id,
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        currency: 'INR',
        status: 'PENDING',
        shippingAddress: shippingAddress, // JSON snapshot
        billingAddress: billingAddress,   // JSON snapshot
        items: {
          create: processedItems.map(item => ({
            variantId: item.variantId,
            sku: item.sku,
            name: item.name,
            attributes: item.attributes,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            taxAtPurchase: 0
          }))
        }
      }
    });

    // 6.5 Reserve Stock in DB for ALL items (with TOCTOU protection)
    for (const item of processedItems) {
      const inv = await tx.inventory.findUnique({
        where: { variantId: item.variantId }
      });
      if (!inv || inv.stockAvailable < item.quantity) {
        throw new AppError(`Insufficient stock for variant ${item.variantId} (available: ${inv?.stockAvailable || 0}, requested: ${item.quantity})`, 409);
      }

      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          stockAvailable: { decrement: item.quantity },
          stockReserved: { increment: item.quantity }
        }
      });
    }

    return newOrder;
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentIntentId: rzpOrder.id,
    totalAmount,
    currency: 'INR'
  };
};

exports.getUserOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true
    }
  });
};

exports.getOrderById = async (userId, orderId) => {
  let order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true
    }
  });

  if (!order || order.userId !== userId) {
    throw new AppError('Order not found', 404);
  }

  // Auto-sync AWB tracking credentials from Shiprocket if missing
  if (!order.awbCode && ['PAID', 'PROCESSING'].includes(order.status)) {
    try {
      const shiprocket = require('../logistics/logistics.provider');
      const srOrderData = await shiprocket.getOrderDetails(order.orderNumber);
      
      // Check if Shiprocket has shipment/AWB assigned
      const srOrdersList = srOrderData?.data || [];
      if (srOrdersList.length > 0) {
        const srOrder = srOrdersList[0];
        if (srOrder && srOrder.shipments && srOrder.shipments.length > 0) {
          const shipment = srOrder.shipments[0];
          const awbCode = shipment.awb_code;
          const courierName = shipment.courier_name;

          if (awbCode) {
            order = await prisma.order.update({
              where: { id: orderId },
              data: {
                awbCode,
                courierName: courierName || 'Express Partner',
                shipmentStatus: 'shipped',
                status: 'SHIPPED',
                trackingUrl: `https://shiprocket.co/tracking/${awbCode}`
              },
              include: { items: true }
            });
            console.log(`[AutoSync] AWB code ${awbCode} automatically fetched and updated for Order #${order.orderNumber}`);
          }
        }
      }
    } catch (err) {
      console.warn(`[AutoSync] Could not auto-sync Shiprocket AWB for Order #${order.orderNumber}:`, err.message);
    }
  }

  return order;
};

exports.cancelOrder = async (userId, orderId, reason = 'User Request') => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Order details
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Unauthorized to cancel this order', 403);
    
    // Check constraints
    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new AppError(`Order cannot be cancelled in status: ${order.status}`, 400);
    }

    // 2. Razorpay Refund (if order status is PAID or PROCESSING)
    if (order.status === 'PAID' || order.status === 'PROCESSING') {
      const payment = await tx.paymentEvent.findFirst({
        where: {
          OR: [
            {
              payload: {
                path: ['payload', 'payment', 'entity', 'order_id'],
                equals: order.paymentIntentId
              }
            },
            {
              payload: {
                path: ['rawBody', 'razorpay_order_id'],
                equals: order.paymentIntentId
              }
            }
          ]
        }
      });

      let paymentId = null;
      if (payment) {
        if (payment.payload?.payload?.payment?.entity?.id) {
          paymentId = payment.payload.payload.payment.entity.id;
        } else if (payment.eventId && payment.eventId.startsWith('pay_')) {
          paymentId = payment.eventId;
        } else if (payment.payload?.rawBody?.razorpay_payment_id) {
          paymentId = payment.payload.rawBody.razorpay_payment_id;
        }
      }

      if (paymentId) {
        try {
          // Convert total to paise (multiply by 100)
          const amountInPaise = Math.round(parseFloat(order.totalAmount) * 100);
          const razorpay = getRazorpayInstance();
          await razorpay.payments.refund(paymentId, { amount: amountInPaise });
          console.log(`[Refund] Successfully refunded order #${order.orderNumber} via Razorpay.`);
        } catch (refundErr) {
          console.error(`[Refund] Failed to issue automated Razorpay refund for payment ${paymentId}:`, refundErr.message);
          // Don't fail the transaction, allow manual refund log
        }
      } else {
        console.error(`[Refund] Could not locate a valid Razorpay Payment ID (pay_xyz) for order #${order.orderNumber}. Skip automatic refund.`);
      }
    }

    // 3. Restore inventory levels based on current order status to prevent corruption
    if (order.status === 'PENDING') {
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            stockAvailable: { increment: item.quantity },
            stockReserved: { decrement: item.quantity }
          }
        });

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            changeAmount: item.quantity,
            reason: 'CANCELLED',
            referenceId: order.id
          }
        });
      }
    } else if (order.status === 'PAID' || order.status === 'PROCESSING') {
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            stockAvailable: { increment: item.quantity },
            stockTotal: { increment: item.quantity }
          }
        });

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            changeAmount: item.quantity,
            reason: 'CANCELLED',
            referenceId: order.id
          }
        });
      }
    }
    // Note: If order.status === 'FAILED', inventory was already restored by handlePaymentFailure, so we do nothing.

    // 4. Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { 
        status: 'CANCELLED',
        shipmentStatus: 'cancelled'
      }
    });

    // 5. Cancel on Shiprocket if order was previously paid/processing
    if (order.status === 'PAID' || order.status === 'PROCESSING' || order.awbCode) {
      try {
        const shiprocket = require('../logistics/logistics.provider');
        // Use Shiprocket's own numeric order ID stored in metadata during shipment creation
        const shiprocketOrderId = order.metadata?.shiprocketOrderId;
        if (shiprocketOrderId) {
          await shiprocket.cancelOrder(shiprocketOrderId);
          console.log(`[Shiprocket] Cancelled Shiprocket order ID ${shiprocketOrderId} (channel: #${order.orderNumber}) successfully.`);
        } else {
          console.warn(`[Shiprocket] No Shiprocket order ID in metadata for #${order.orderNumber} — skipping Shiprocket cancellation.`);
        }
      } catch (shiprocketErr) {
        console.warn(`[Shiprocket] Cancel request sent but skipped (order might not be in Shiprocket dashboard yet):`, shiprocketErr.message);
      }
    }

    return updatedOrder;
  });
};
