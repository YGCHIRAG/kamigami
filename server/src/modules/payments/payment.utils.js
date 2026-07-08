const crypto = require('crypto');
const config = require('../../config');

exports.verifyRazorpaySignature = (rawBody, signature) => {
  const secret = config.razorpayWebhookSecret || 'razorpay_secret';
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};
