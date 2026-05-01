const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register/donor', authController.registerDonor);
router.post('/login/donor', authController.loginDonor);

router.post('/register/hospital', authController.registerHospital);
router.post('/login/hospital', authController.loginHospital);

router.post('/register/camp', authController.registerCamp);
router.post('/login/camp', authController.loginCamp);

// Profile endpoints (Unified)
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
