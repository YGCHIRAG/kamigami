const paymentService = require('./payment.service');
const paymentUtils = require('./payment.utils');

exports.handlePaymentWebhook = async (req, res) => {
  try {
    // 1. Verify Signature
    const isValid = paymentUtils.verifySignature(req.headers, req.body);
    if (!isValid) {
      console.warn('[Webhook] Invalid signature received');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Process Webhook
    const result = await paymentService.processWebhook(req.body);
    
    console.log(`[Webhook] Processed event ${req.body.event_id}: ${result.status}`);

    // Always return 200 to provider
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Webhook] Error processing payment webhook:', err);
    // Even on error, we return 200 to avoid retry storm from provider
    // unless it's a transient error where we want a retry (but user asked to return 200)
    return res.status(200).json({ received: true, error_logged: true });
  }
};
