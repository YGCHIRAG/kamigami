const paymentService = require('./payment.service');
const paymentUtils = require('./payment.utils');

exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    // 1. Verify Signature using raw body
    if (!req.rawBody) {
      console.error('[Razorpay] Raw body missing for signature verification');
      return res.status(400).json({ error: 'Payload missing' });
    }

    const isValid = paymentUtils.verifyRazorpaySignature(req.rawBody, signature);
    
    if (!isValid) {
      console.warn('[Razorpay] Invalid signature received');
      return res.status(400).json({ error: 'Unauthorized signature' });
    }

    // 2. Process Webhook
    const result = await paymentService.processRazorpayWebhook(req.body);
    
    console.log(`[Razorpay] Processed event ${req.body.id}: ${result.status}`);

    // Always return 200 to Razorpay
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Razorpay] Error processing webhook:', err);
    // Always return 200 to avoid retry storms, unless you want Razorpay to retry
    return res.status(200).json({ received: true, error_logged: true });
  }
};

exports.handleMockPaymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ status: 'fail', message: 'orderId is required' });
    }
    const result = await paymentService.processMockPaymentSuccess(orderId);
    return res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    console.error('[MockPayment] Error processing mock payment success:', err);
    return res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Internal server error during mock payment'
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ status: 'fail', message: 'Missing required signature verification fields' });
    }
    const result = await paymentService.verifyPaymentSignature(req.user.userId, {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    });
    return res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    console.error('[PaymentVerification] Verification failed:', err);
    return res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Payment verification failed'
    });
  }
};

