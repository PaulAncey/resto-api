const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authValidators } = require('../utils/validators');

router.post('/signup', authValidators.signup, authController.signup);

router.post('/login', authValidators.login, authController.login);

router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;