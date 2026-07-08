const returnsService = require('./returns.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.createReturnRequest = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.userId : null;
  const returnReq = await returnsService.createReturnRequest(userId, req.body);
  res.status(201).json({ status: 'success', data: returnReq });
});

exports.getMyReturnRequests = asyncHandler(async (req, res) => {
  const returnRequests = await returnsService.getUserReturnRequests(req.user.userId);
  res.status(200).json({ status: 'success', data: returnRequests });
});

exports.getAdminReturnRequests = asyncHandler(async (req, res) => {
  const returnRequests = await returnsService.getAllReturnRequests();
  res.status(200).json({ status: 'success', data: returnRequests });
});

exports.updateReturnRequest = asyncHandler(async (req, res) => {
  const returnReq = await returnsService.updateReturnRequestStatus(req.params.id, req.body.status);
  res.status(200).json({ status: 'success', data: returnReq });
});

exports.lookupOrder = asyncHandler(async (req, res) => {
  const { orderNumber, email } = req.query;
  const order = await returnsService.lookupOrderForReturn(orderNumber, email);
  res.status(200).json({ status: 'success', data: order });
});
