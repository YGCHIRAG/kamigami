const express = require('express');
const usersController = require('./users.controller');
const { verifyJWT } = require('../auth/auth.middleware');

const router = express.Router();

// All routes here are protected
router.use(verifyJWT);

router.get('/me', usersController.getMe);
router.put('/me', usersController.updateMe);

router.get('/me/addresses', usersController.getAddresses);
router.post('/me/addresses', usersController.addAddress);
router.put('/me/addresses/:id', usersController.updateAddress);
router.delete('/me/addresses/:id', usersController.deleteAddress);

module.exports = router;
