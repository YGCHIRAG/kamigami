const express = require('express');
const collectionsController = require('./collections.controller');
const { verifyJWT, requireAdmin } = require('../auth/auth.middleware');

const router = express.Router();

// PUBLIC ROUTES
router.get('/collections', collectionsController.listCollections);
router.get('/collections/:slug', collectionsController.getCollectionBySlug);

// ADMIN ROUTES (Protected)
router.post('/admin/collections', verifyJWT, requireAdmin, collectionsController.createCollection);
router.put('/admin/collections/:id', verifyJWT, requireAdmin, collectionsController.updateCollection);
router.delete('/admin/collections/:id', verifyJWT, requireAdmin, collectionsController.deleteCollection);

// Collection-Product Management
router.post('/admin/collections/:id/products', verifyJWT, requireAdmin, collectionsController.addProductsToCollection);
router.put('/admin/collections/:id/products', verifyJWT, requireAdmin, collectionsController.reorderProducts);
router.delete('/admin/collections/:id/products/:productId', verifyJWT, requireAdmin, collectionsController.removeProductFromCollection);

module.exports = router;
