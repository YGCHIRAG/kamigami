const crypto = require('crypto');
const config = require('../../config');

exports.verifyRazorpaySignature = (rawBody, signature) => {
  const secret = config.razorpayWebhookSecret;
  if (!secret) {
    throw new Error('Razorpay Webhook Secret is not configured on the server');
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};
