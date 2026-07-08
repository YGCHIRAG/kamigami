const logisticsService = require('./logistics.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

// ADMIN CONTROLLERS
exports.createShipment = asyncHandler(async (req, res) => {
  const { order_id } = req.body;
  const order = await logisticsService.createShipment(req.user.userId, order_id);
  res.status(201).json({ status: 'success', data: { order } });
});

exports.updateTracking = asyncHandler(async (req, res) => {
  const order = await logisticsService.updateTrackingManual(req.user.userId, req.params.order_id, req.body);
  res.status(200).json({ status: 'success', data: { order } });
});

// USER CONTROLLERS
exports.getTrackingInfo = asyncHandler(async (req, res) => {
  // If admin, don't pass userId to allow viewing any order
  const userId = (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN') ? null : req.user.userId;
  const tracking = await logisticsService.getTrackingInfo(req.params.order_id, userId);
  res.status(200).json({ status: 'success', data: tracking });
});

exports.getETA = asyncHandler(async (req, res) => {
  const { delivery_postcode } = req.query;
  if (!delivery_postcode) {
    return res.status(400).json({ status: 'fail', message: 'delivery_postcode is required' });
  }
  const result = await logisticsService.getETA(delivery_postcode);
  res.status(200).json({ status: 'success', data: result });
});
