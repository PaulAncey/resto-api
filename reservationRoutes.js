const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const { reservationValidators } = require('../utils/validators');

router.get('/reservations', authenticateToken, isAdmin, reservationController.getAllReservations);

router.get('/my-reservations', authenticateToken, reservationController.getUserReservations);

router.post('/reservations', authenticateToken, reservationValidators.create, reservationController.createReservation);

router.put('/reservations/:id', authenticateToken, reservationValidators.update, reservationController.updateReservation);

router.delete('/reservations/:id', authenticateToken, reservationController.cancelReservation);

router.patch('/reservations/:id/validate', authenticateToken, isAdmin, reservationController.validateReservation);

module.exports = router;