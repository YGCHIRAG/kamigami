const express = require('express');
const returnsController = require('./returns.controller');
const { verifyJWT, requireAdmin } = require('../auth/auth.middleware');

const router = express.Router();

router.get('/lookup-order', verifyJWT, returnsController.lookupOrder);
router.post('/', verifyJWT, returnsController.createReturnRequest);
router.get('/me', verifyJWT, returnsController.getMyReturnRequests);
router.get('/admin', verifyJWT, requireAdmin, returnsController.getAdminReturnRequests);
router.put('/admin/:id', verifyJWT, requireAdmin, returnsController.updateReturnRequest);

module.exports = router;
