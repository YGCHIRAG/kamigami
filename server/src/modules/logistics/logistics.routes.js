const express = require('express');
const logisticsController = require('./logistics.controller');
const { verifyJWT, requireAdmin } = require('../auth/auth.middleware');

const router = express.Router();

// USER ROUTES (Protected)
router.get('/serviceability/eta', verifyJWT, logisticsController.getETA);
router.get('/:order_id', verifyJWT, logisticsController.getTrackingInfo);

// ADMIN ROUTES (Protected + Admin Role)
// Note: These are mounted under /admin/logistics in the main router, 
// or I can define them here and mount at /logistics. 
// User asked for /api/v1/admin/logistics/create-shipment
router.post('/admin/create-shipment', verifyJWT, requireAdmin, logisticsController.createShipment);
router.put('/admin/:order_id', verifyJWT, requireAdmin, logisticsController.updateTracking);

module.exports = router;
