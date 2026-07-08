const express = require('express');
const paymentController = require('./payment.controller');
const { verifyJWT } = require('../auth/auth.middleware');

const router = express.Router();

// Razorpay Webhook Endpoint
router.post('/razorpay', paymentController.handleRazorpayWebhook);

// Developer Mock Payment Success (Bypasses webhook delays in development)
router.post('/mock-success', paymentController.handleMockPaymentSuccess);

// Verify Signature Checkout Endpoint
router.post('/verify', verifyJWT, paymentController.verifyPayment);

module.exports = router;
