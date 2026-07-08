const express = require('express');
const ordersController = require('./orders.controller');
const { verifyJWT } = require('../auth/auth.middleware');

const router = express.Router();

// Checkout Intent
router.post('/checkout/intent', verifyJWT, ordersController.createCheckoutIntent);

// User Orders
router.get('/orders/me', verifyJWT, ordersController.getMe);
router.get('/orders/:id', verifyJWT, ordersController.getOrder);
router.post('/orders/:id/cancel', verifyJWT, ordersController.cancelOrder);

module.exports = router;
