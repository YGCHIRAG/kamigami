const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/google', authController.googleLogin);
router.post('/google-login', authController.googleLogin);

// Protected routes
router.get('/me', authMiddleware.verifyJWT, authController.getMe);

module.exports = router;
