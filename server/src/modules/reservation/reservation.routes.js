const express = require('express');
const reservationController = require('./reservation.controller');
const { verifyJWT } = require('../auth/auth.middleware');

const router = express.Router();

// Reservation is a user action, requires auth
router.post('/:dropId/reserve', verifyJWT, reservationController.reserveStock);

module.exports = router;
