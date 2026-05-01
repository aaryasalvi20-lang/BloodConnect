const express = require('express');
const router = express.Router();
const campController = require('../controllers/campController');
const { protect } = require('../middleware/authMiddleware');

router.post('/events', protect, campController.createEvent);
router.get('/events', protect, campController.getEvents);
router.get('/events/my', protect, campController.getMyEvents);
router.put('/events/:id/status', protect, campController.updateEventStatus);
router.get('/registrations', protect, campController.getAllRegistrations);
router.post('/events/:event_id/register', protect, campController.registerForEvent);
router.get('/events/:event_id/registrations', protect, campController.getEventRegistrations);

router.post('/collaborations', protect, campController.requestCollaboration);
router.get('/collaborations', protect, campController.getCollaborations);
router.put('/collaborations/:id/status', protect, campController.updateCollaborationStatus);

module.exports = router;
