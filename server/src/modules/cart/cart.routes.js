const express = require('express');
const cartController = require('./cart.controller');
const { verifyJWT } = require('../auth/auth.middleware');

const router = express.Router();

// All cart routes require auth
router.use(verifyJWT);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);

module.exports = router;
