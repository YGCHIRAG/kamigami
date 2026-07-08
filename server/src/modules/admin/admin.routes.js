const express = require('express');
const adminController = require('./admin.controller');
const logisticsController = require('../logistics/logistics.controller');
const { verifyJWT, requireAdmin } = require('../auth/auth.middleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyJWT);
router.use(requireAdmin);

// Product Management
router.get('/products', adminController.listProducts);
router.get('/products/:id', adminController.getProduct);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Category Management
router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Drop Management
router.get('/drops', adminController.listDrops);
router.post('/drops', adminController.createDrop);
router.put('/drops/:id', adminController.updateDrop);
router.delete('/drops/:id', adminController.deleteDrop);
router.post('/drops/:id/products', adminController.attachProducts);
router.post('/drops/:id/attach-collection', adminController.attachCollection);

// Inventory Management
router.get('/inventory/:variantId', adminController.getInventory);
router.get('/inventory/logs/:variantId', adminController.getInventoryLogs);
router.post('/inventory/update', adminController.updateInventory);
router.post('/inventory/set', adminController.setInventory);

// Order Management
router.get('/stats', adminController.getStats);
router.get('/orders', adminController.listOrders);
router.get('/orders/:id', adminController.getOrder);
router.put('/orders/:id/status', adminController.updateOrderStatus);


// Logistics Management
router.post('/logistics/create-shipment', logisticsController.createShipment);
router.put('/logistics/:order_id', logisticsController.updateTracking);

module.exports = router;
