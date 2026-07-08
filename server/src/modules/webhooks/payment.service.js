const prisma = require('../../db/prisma');
const { redisClient } = require('../../db/redis');
const AppError = require('../../common/errors/AppError');

exports.processWebhook = async (eventData) => {
  const { event_type, data, event_id } = eventData;
  const { payment_intent_id, order_id } = data;

  // 1. Idempotency Check
  const existingEvent = await prisma.paymentEvent.findUnique({
    where: { eventId: event_id }
  });
  if (existingEvent) return { status: 'already_processed' };

  // 2. Fetch Order
  const order = await prisma.order.findUnique({
    where: { id: order_id || undefined, paymentIntentId: payment_intent_id },
    include: { items: true }
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'PENDING') return { status: 'order_already_finalized' };

  // 3. Process based on event type
  if (event_type === 'payment.success') {
    return await handlePaymentSuccess(order, eventData);
  } else if (event_type === 'payment.failed' || event_type === 'payment.cancelled') {
    return await handlePaymentFailure(order, eventData);
  }

  return { status: 'event_ignored' };
};

async function handlePaymentSuccess(order, eventData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Update Order Status
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'PAID' }
    });

    // 2. Deduct Inventory for each item
    for (const item of order.items) {
      const inventory = await tx.inventory.findUnique({
        where: { variantId: item.variantId }
      });

      if (!inventory || inventory.stockAvailable < item.quantity) {
        throw new AppError(`Inventory inconsistency for variant ${item.variantId}`, 409);
      }

      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          stockTotal: { decrement: item.quantity },
          stockAvailable: { decrement: item.quantity }
        }
      });

      // Log Inventory Change
      await tx.inventoryLog.create({
        data: {
          variantId: item.variantId,
          changeAmount: -item.quantity,
          reason: 'ORDER_PURCHASE',
          referenceId: order.id
        }
      });
    }

    // 3. Log Payment Event
    await tx.paymentEvent.create({
      data: {
        eventId: eventData.event_id,
        eventType: eventData.event_type,
        provider: 'STRIPE_SIMULATED',
        payload: eventData
      }
    });

    // 4. Redis Cleanup for Drop items
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
}

async function handlePaymentFailure(order, eventData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Update Order Status
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'FAILED' }
    });

    // 2. Log Payment Event
    await tx.paymentEvent.create({
      data: {
        eventId: eventData.event_id,
        eventType: eventData.event_type,
        provider: 'STRIPE_SIMULATED',
        payload: eventData
      }
    });

    // 3. Redis Restore for Drop items
    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });

      if (variant.product.isDrop) {
        // Find the active drop for this product to restore stock
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
