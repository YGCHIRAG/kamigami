const express = require('express');
const settingsController = require('./settings.controller');
const { verifyJWT, requireAdmin } = require('../auth/auth.middleware');

const router = express.Router();

// Public route to retrieve site settings (storefront reading)
router.get('/:key', settingsController.getSetting);

// Protected admin routes to modify site settings (CMS editing)
router.post('/:key', verifyJWT, requireAdmin, settingsController.saveSetting);

module.exports = router;
