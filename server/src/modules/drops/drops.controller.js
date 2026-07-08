const dropsService = require('./drops.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

// ADMIN CONTROLLERS
exports.createDrop = asyncHandler(async (req, res) => {
  const drop = await dropsService.createDrop(req.body);
  res.status(201).json({ status: 'success', data: { drop } });
});

exports.attachProducts = asyncHandler(async (req, res) => {
  const result = await dropsService.attachProducts(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: result });
});

// PUBLIC CONTROLLERS
exports.listDrops = asyncHandler(async (req, res) => {
  const drops = await dropsService.listDrops(req.query.status);
  res.status(200).json({ status: 'success', data: { drops } });
});

exports.getDropBySlug = asyncHandler(async (req, res) => {
  const drop = await dropsService.getDropBySlug(req.params.slug);
  res.status(200).json({ status: 'success', data: { drop } });
});
