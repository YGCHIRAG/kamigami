const express = require('express');
const productsController = require('./products.controller');

const router = express.Router();

// Public routes
router.get('/', productsController.listProducts);
router.get('/:slug', productsController.getProductBySlug);
router.get('/:id/variants', productsController.getVariants);

module.exports = router;
