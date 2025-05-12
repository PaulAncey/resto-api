const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const { menuValidators } = require('../utils/validators');

router.get('/menu', menuController.getMenu);

router.get('/menu/:id', menuController.getMenuItem);

router.post('/menu', authenticateToken, isAdmin, menuValidators.create, menuController.addMenuItem);

router.put('/menu/:id', authenticateToken, isAdmin, menuValidators.update, menuController.updateMenuItem);

router.delete('/menu/:id', authenticateToken, isAdmin, menuController.deleteMenuItem);

module.exports = router;