const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const { tableValidators } = require('../utils/validators');

router.get('/tables', authenticateToken, isAdmin, tableController.getTables);


router.post('/tables', authenticateToken, isAdmin, tableValidators.create, tableController.addTable);

router.put('/tables/:id', authenticateToken, isAdmin, tableValidators.update, tableController.updateTable);

router.delete('/tables/:id', authenticateToken, isAdmin, tableController.deleteTable);

module.exports = router;