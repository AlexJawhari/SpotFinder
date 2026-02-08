// User-centric endpoints for fetching a user's locations and reviews.
const express = require('express');

const { getUserLocations, getUserReviews } = require('../controllers/userController');

const router = express.Router();

router.get('/:id/locations', getUserLocations);
router.get('/:id/reviews', getUserReviews);

module.exports = router;

