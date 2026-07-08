const productsService = require('./products.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

// ADMIN CONTROLLERS (Auth handled in admin module, but services kept here)
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productsService.createProduct(req.body);
  res.status(201).json({ status: 'success', data: { product } });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productsService.updateProduct(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { product } });
});

// PUBLIC CONTROLLERS
exports.listProducts = asyncHandler(async (req, res) => {
  const result = await productsService.listProducts(req.query);
  res.status(200).json({ status: 'success', data: result });
});

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productsService.getProductBySlug(req.params.slug);
  res.status(200).json({ status: 'success', data: { product } });
});

exports.getVariants = asyncHandler(async (req, res) => {
  const variants = await productsService.getVariantsByProductId(req.params.id);
  res.status(200).json({ status: 'success', data: { variants } });
});
