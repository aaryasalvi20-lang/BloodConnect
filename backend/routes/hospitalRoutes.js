const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All hospital routes require authentication and hospital role
router.use(protect);
router.use(restrictTo('hospital'));

router.get('/inventory', hospitalController.getInventory);
router.post('/inventory', hospitalController.updateInventory);

module.exports = router;
