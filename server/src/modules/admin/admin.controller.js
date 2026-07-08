const adminService = require('./admin.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

// PRODUCT MANAGEMENT
exports.listProducts = asyncHandler(async (req, res) => {
  const result = await adminService.listProducts(req.query);
  res.status(200).json({ status: 'success', data: result });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await adminService.getProduct(req.params.id);
  res.status(200).json({ status: 'success', data: { product } });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await adminService.createProduct(req.user.userId, req.body);
  res.status(201).json({ status: 'success', data: { product } });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await adminService.updateProduct(req.user.userId, req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { product } });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await adminService.deleteProduct(req.user.userId, req.params.id);
  res.status(204).json({ status: 'success', data: null });
});

// CATEGORY MANAGEMENT
exports.listCategories = asyncHandler(async (req, res) => {
  const categories = await adminService.listCategories();
  res.status(200).json({ status: 'success', data: { categories } });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await adminService.createCategory(req.user.userId, req.body);
  res.status(201).json({ status: 'success', data: { category } });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await adminService.updateCategory(req.user.userId, req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { category } });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await adminService.deleteCategory(req.user.userId, req.params.id);
  res.status(204).json({ status: 'success', data: null });
});

// DROP MANAGEMENT
exports.listDrops = asyncHandler(async (req, res) => {
  const drops = await adminService.listDrops(req.query.status);
  res.status(200).json({ status: 'success', data: { drops } });
});

exports.createDrop = asyncHandler(async (req, res) => {
  const drop = await adminService.createDrop(req.user.userId, req.body);
  res.status(201).json({ status: 'success', data: { drop } });
});

exports.updateDrop = asyncHandler(async (req, res) => {
  const drop = await adminService.updateDrop(req.user.userId, req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { drop } });
});

exports.deleteDrop = asyncHandler(async (req, res) => {
  await adminService.deleteDrop(req.user.userId, req.params.id);
  res.status(204).json({ status: 'success', data: null });
});

exports.attachProducts = asyncHandler(async (req, res) => {
  const { productAllocations } = req.body;
  const result = await adminService.attachProductsToDrop(req.user.userId, req.params.id, productAllocations);
  res.status(200).json({ status: 'success', data: result });
});

exports.attachCollection = asyncHandler(async (req, res) => {
  const { collectionId, defaultStock } = req.body;
  const result = await adminService.attachCollectionToDrop(req.user.userId, req.params.id, collectionId, defaultStock);
  res.status(200).json({ status: 'success', data: result });
});

// INVENTORY MANAGEMENT
exports.updateInventory = asyncHandler(async (req, res) => {
  const { variantId, changeAmount, reason } = req.body;
  const amount = parseInt(changeAmount);
  
  console.log(`[AdminController] Inventory Update: Variant=${variantId}, Amount=${amount}, Reason=${reason}`);
  
  if (isNaN(amount)) throw new AppError('Invalid adjustment amount', 400);
  
  const result = await adminService.updateInventory(req.user.userId, variantId, amount, reason);
  res.status(200).json({ status: 'success', data: { inventory: result } });
});

exports.setInventory = asyncHandler(async (req, res) => {
  const { variantId, stockTotal } = req.body;
  const total = parseInt(stockTotal);

  console.log(`[AdminController] Inventory Set: Variant=${variantId}, Total=${total}`);

  if (isNaN(total)) throw new AppError('Invalid stock total', 400);

  const result = await adminService.setInventory(req.user.userId, variantId, total);
  res.status(200).json({ status: 'success', data: { inventory: result } });
});

exports.getInventory = asyncHandler(async (req, res) => {
  const inventory = await adminService.getInventory(req.params.variantId);
  res.status(200).json({ status: 'success', data: { inventory } });
});

exports.getInventoryLogs = asyncHandler(async (req, res) => {
  const logs = await adminService.getInventoryLogs(req.params.variantId);
  res.status(200).json({ status: 'success', data: { logs } });
});

// ORDER MANAGEMENT
exports.listOrders = asyncHandler(async (req, res) => {
  const result = await adminService.listOrders(req.query);
  res.status(200).json({ status: 'success', data: result });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await adminService.getOrderDetails(req.params.id);
  res.status(200).json({ status: 'success', data: { order } });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, awbCode, courierName, shippingAddress } = req.body;
  const order = await adminService.updateOrderStatus(
    req.params.id, 
    status, 
    req.user.userId, 
    { awbCode, courierName, shippingAddress }
  );
  res.status(200).json({ status: 'success', data: { order } });
});

exports.getStats = asyncHandler(async (req, res) => {
  const result = await adminService.getStats();
  res.status(200).json({ status: 'success', data: result });
});

