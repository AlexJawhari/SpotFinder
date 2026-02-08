const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const { protect } = require('../middleware/auth');

// All check-in routes require authentication
router.post('/', protect, checkInController.checkIn);
router.put('/:id/checkout', protect, checkInController.checkOut);
router.get('/location/:locationId', checkInController.getLocationCheckIns);
router.get('/user/history', protect, checkInController.getUserCheckIns);
router.get('/trending', checkInController.getTrendingLocations);

module.exports = router;
