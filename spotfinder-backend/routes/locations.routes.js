// Location discovery and CRUD endpoints, including a simple nearby search.
const express = require('express');
const { body, query } = require('express-validator');

const { authenticate } = require('../middleware/auth');
const {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  nearbyLocations,
  incrementViewCount,
} = require('../controllers/locationController');

const router = express.Router();

router.get(
  '/',
  [
    query('category').optional().isString(),
    query('minRating').optional().isFloat({ min: 1, max: 5 }),
    query('amenities').optional().isString(),
  ],
  listLocations
);

router.get('/:id', getLocationById);

router.get(
  '/nearby',
  [
    query('lat').isFloat(),
    query('lng').isFloat(),
    query('radius').isFloat({ min: 0.1, max: 50 }),
  ],
  nearbyLocations
);

router.post(
  '/',
  authenticate,
  [
    body('name').isString().isLength({ min: 2 }),
    body('address').isString().isLength({ min: 5 }),
    body('city').isString().isLength({ min: 2 }),
    body('latitude').isFloat(),
    body('longitude').isFloat(),
    body('category').isString(),
  ],
  createLocation
);

router.put('/:id', authenticate, updateLocation);
router.delete('/:id', authenticate, deleteLocation);
router.post('/:id/view', incrementViewCount);

module.exports = router;

