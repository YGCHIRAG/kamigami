const ordersService = require('./orders.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.createCheckoutIntent = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotency_key;

  const result = await ordersService.createCheckoutIntent(userId, req.body, idempotencyKey);

  res.status(201).json({
    status: 'success',
    data: result
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const orders = await ordersService.getUserOrders(userId);

  res.status(200).json({
    status: 'success',
    data: orders
  });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const order = await ordersService.getOrderById(userId, req.params.id);

  res.status(200).json({
    status: 'success',
    data: order
  });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { reason } = req.body || {};
  const result = await ordersService.cancelOrder(userId, req.params.id, reason);

  res.status(200).json({
    status: 'success',
    data: result
  });
});
