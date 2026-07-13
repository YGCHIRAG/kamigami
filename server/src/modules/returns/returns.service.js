const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

exports.createReturnRequest = async (userId, returnData) => {
  const { orderNumber, email, reason, items } = returnData;

  if (!orderNumber || !reason || !items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Order Number, reason, and items are required', 400);
  }

  // 1. Fetch Order
  const order = await prisma.order.findFirst({
    where: { 
      orderNumber,
      user: {
        email: email ? email.trim().toLowerCase() : undefined
      }
    },
    include: { user: true }
  });

  if (!order) {
    throw new AppError('Order not found with provided credentials', 404);
  }

  // 2. Security validation: if logged in, make sure it matches their userId
  if (userId && order.userId !== userId) {
    throw new AppError('Unauthorized access to this order', 403);
  }

  // 3. Status validation: must be DELIVERED to file returns
  if (order.status !== 'DELIVERED') {
    throw new AppError('Only delivered orders can be returned', 400);
  }

  // 3.5 Duplicate request check
  const existingReturn = await prisma.returnRequest.findFirst({
    where: { orderId: order.id }
  });
  if (existingReturn) {
    throw new AppError('A return request has already been filed for this order', 400);
  }

  // 4. Save Return Request in DB
  return await prisma.returnRequest.create({
    data: {
      orderId: order.id,
      userId: order.userId || userId,
      reason,
      status: 'PENDING',
      items: items // JSON array of items: { sku, quantity, name }
    },
    include: {
      order: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
};

exports.getUserReturnRequests = async (userId) => {
  return await prisma.returnRequest.findMany({
    where: { userId },
    include: {
      order: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

exports.getAllReturnRequests = async () => {
  return await prisma.returnRequest.findMany({
    include: {
      order: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

exports.updateReturnRequestStatus = async (requestId, status) => {
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid return request status', 400);
  }

  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: requestId }
  });

  if (!returnReq) {
    throw new AppError('Return request not found', 404);
  }

  return await prisma.returnRequest.update({
    where: { id: requestId },
    data: { status },
    include: {
      order: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
};

exports.lookupOrderForReturn = async (orderNumber, email) => {
  if (!orderNumber || !email) {
    throw new AppError('Order number and email are required', 400);
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: orderNumber.trim(),
      user: {
        email: email.trim().toLowerCase()
      }
    },
    include: {
      items: true
    }
  });

  if (!order) {
    throw new AppError('No matching completed order found', 404);
  }

  if (order.status !== 'DELIVERED') {
    throw new AppError('Only delivered orders can be returned', 400);
  }

  const existingReturn = await prisma.returnRequest.findFirst({
    where: { orderId: order.id }
  });
  if (existingReturn) {
    throw new AppError('A return request has already been filed for this order', 400);
  }

  return order;
};
