const express = require('express');
const paymentController = require('./payment.controller');

const router = express.Router();

// Webhook endpoint (No JWT, signature based security)
router.post('/payment', paymentController.handlePaymentWebhook);

module.exports = router;
