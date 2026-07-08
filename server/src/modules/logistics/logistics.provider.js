const axios = require('axios');
const config = require('../../config');

let cachedToken = null;
let tokenExpiry = null;
 
class ShiprocketProvider {
  constructor() {
    this.baseUrl = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
  }

  async authenticate() {
    // Basic in-memory token caching
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }
 
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: this.email,
        password: this.password
      });

      cachedToken = response.data.token;
      // Shiprocket tokens usually last 10 days, we'll refresh every 24 hours to be safe
      tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      
      return cachedToken;
    } catch (err) {
      console.error('[Shiprocket] Auth failed:', err.response?.data || err.message);
      throw new Error('Logistics authentication failed');
    }
  }

  async createOrder(orderData) {
    const token = await this.authenticate();
    
    try {
      const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('[Shiprocket] Order creation failed:', err.response?.data || err.message);
      throw err;
    }
  }

  async cancelOrder(orderId) {
    const token = await this.authenticate();
    try {
      const response = await axios.post(`${this.baseUrl}/orders/cancel`, {
        ids: [orderId]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('[Shiprocket] Order cancellation failed:', err.response?.data || err.message);
      throw err;
    }
  }

  async assignAWB(shipmentId) {
    const token = await this.authenticate();
    
    try {
      const response = await axios.post(`${this.baseUrl}/courier/assign/awb`, {
        shipment_id: shipmentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('[Shiprocket] AWB assignment failed:', err.response?.data || err.message);
      throw err;
    }
  }

  async trackAWB(awbCode) {
    const token = await this.authenticate();
    
    try {
      const response = await axios.get(`${this.baseUrl}/courier/track/awb/${awbCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('[Shiprocket] Tracking failed:', err.response?.data || err.message);
      throw err;
    }
  }

  async getOrderDetails(orderNumber) {
    const token = await this.authenticate();
    try {
      const response = await axios.get(`${this.baseUrl}/orders`, {
        params: { 
          filter_by: 'channel_order_id', 
          filter_value: orderNumber 
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('[Shiprocket] Fetch order details failed:', err.response?.data || err.message);
      throw err;
    }
  }

  async getServiceability(pickupPostcode, deliveryPostcode) {
    const token = await this.authenticate();
    
    try {
      const response = await axios.get(`${this.baseUrl}/courier/serviceability`, {
        params: {
          pickup_postcode: pickupPostcode,
          delivery_postcode: deliveryPostcode,
          weight: 0.5,
          cod: 0
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('[Shiprocket] Serviceability check failed:', err.response?.data || err.message);
      throw err;
    }
  }
}

module.exports = new ShiprocketProvider();
