const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);

// Protected routes
router.post('/', protect, eventController.createEvent);
router.put('/:id', protect, eventController.updateEvent);
router.delete('/:id', protect, eventController.deleteEvent);

// RSVP routes
router.post('/:id/rsvp', protect, eventController.rsvpEvent);
router.delete('/:id/rsvp', protect, eventController.removeRsvp);

// Comments
router.post('/:id/comments', protect, eventController.addComment);

// User's events
router.get('/user/my-events', protect, eventController.getUserEvents);

module.exports = router;
