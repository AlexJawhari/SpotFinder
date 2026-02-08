// Review endpoints for creating and managing user feedback on locations.
const express = require('express');
const { body } = require('express-validator');

const { authenticate } = require('../middleware/auth');
const {
  getReviewsForLocation,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/location/:locationId', getReviewsForLocation);

router.post(
  '/',
  authenticate,
  [
    body('location_id').isUUID(),
    body('overall_rating').isInt({ min: 1, max: 5 }),
    body('wifi_rating').optional().isInt({ min: 1, max: 5 }),
    body('seating_rating').optional().isInt({ min: 1, max: 5 }),
    body('noise_rating').optional().isInt({ min: 1, max: 5 }),
    body('review_text').optional().isString().isLength({ min: 0, max: 2000 }),
  ],
  createReview
);

router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;

