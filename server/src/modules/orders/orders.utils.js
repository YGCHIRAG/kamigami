const { v4: uuidv4 } = require('uuid');

exports.generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

exports.createSimulatedPaymentIntent = async (amount, currency = 'USD') => {
  // Simulate an external API call to Stripe/Razorpay
  return {
    id: `pi_${uuidv4().replace(/-/g, '')}`,
    client_secret: `src_${uuidv4().replace(/-/g, '')}_secret_${uuidv4().replace(/-/g, '')}`,
    amount,
    currency
  };
};
