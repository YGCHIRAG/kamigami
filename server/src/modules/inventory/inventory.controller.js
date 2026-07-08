const inventoryService = require('./inventory.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

// ADMIN CONTROLLERS
exports.updateStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.updateStock(req.body, req.user.userId);
  res.status(200).json({
    status: 'success',
    data: { inventory: result }
  });
});

exports.setAbsoluteStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.setAbsoluteStock(req.body, req.user.userId);
  res.status(200).json({
    status: 'success',
    data: { inventory: result }
  });
});

exports.getInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.getInventory(req.params.variantId);
  res.status(200).json({
    status: 'success',
    data: { inventory }
  });
});

// PUBLIC CONTROLLERS
exports.getAvailableStock = asyncHandler(async (req, res) => {
  const stockAvailable = await inventoryService.getAvailableStock(req.params.variantId);
  res.status(200).json({
    status: 'success',
    data: { stockAvailable }
  });
});
