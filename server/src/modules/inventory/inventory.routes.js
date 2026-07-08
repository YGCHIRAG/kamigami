const express = require('express');
const inventoryController = require('./inventory.controller');

const router = express.Router();

// Public route
router.get('/:variantId', inventoryController.getAvailableStock);

module.exports = router;
