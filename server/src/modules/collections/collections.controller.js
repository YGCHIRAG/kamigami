const collectionsService = require('./collections.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

// ADMIN CONTROLLERS
exports.createCollection = asyncHandler(async (req, res) => {
  const collection = await collectionsService.createCollection(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: { collection } });
});

exports.updateCollection = asyncHandler(async (req, res) => {
  const collection = await collectionsService.updateCollection(req.user.id, req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { collection } });
});

exports.deleteCollection = asyncHandler(async (req, res) => {
  await collectionsService.deleteCollection(req.user.id, req.params.id);
  res.status(200).json({ status: 'success', message: 'Collection deleted successfully' });
});

exports.addProductsToCollection = asyncHandler(async (req, res) => {
  const result = await collectionsService.addProductsToCollection(req.params.id, req.body.product_ids);
  res.status(200).json({ status: 'success', message: `Added ${result.count} products to collection` });
});

exports.reorderProducts = asyncHandler(async (req, res) => {
  await collectionsService.reorderProducts(req.params.id, req.body.items);
  res.status(200).json({ status: 'success', message: 'Products reordered successfully' });
});

exports.removeProductFromCollection = asyncHandler(async (req, res) => {
  await collectionsService.removeProductFromCollection(req.params.id, req.params.productId);
  res.status(200).json({ status: 'success', message: 'Product removed from collection' });
});

// PUBLIC CONTROLLERS
exports.listCollections = asyncHandler(async (req, res) => {
  const result = await collectionsService.listCollections(req.query);
  res.status(200).json({ status: 'success', data: result });
});

exports.getCollectionBySlug = asyncHandler(async (req, res) => {
  const collection = await collectionsService.getCollectionBySlug(req.params.slug, req.query);
  res.status(200).json({ status: 'success', data: { collection } });
});
