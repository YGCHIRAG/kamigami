const express = require('express');
const dropsController = require('./drops.controller');

const router = express.Router();

// Public routes
router.get('/', dropsController.listDrops);
router.get('/:slug', dropsController.getDropBySlug);

module.exports = router;
