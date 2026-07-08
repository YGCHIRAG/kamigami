const crypto = require('crypto');
const config = require('../../config');

exports.verifySignature = (headers, body) => {
  const signature = headers['provider-signature'];
  const webhookSecret = config.webhookSecret || 'default_secret'; // In production, use env variable

  if (!signature) return false;

  // Simple HMAC verification simulation
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(typeof body === 'string' ? body : JSON.stringify(body))
    .digest('hex');

  return signature === expectedSignature;
};
