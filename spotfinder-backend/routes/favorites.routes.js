// Favorites endpoints for saving and managing a user's liked locations.
const express = require('express');

const {
  listFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');

const router = express.Router();

router.get('/', listFavorites);
router.post('/', addFavorite);
router.delete('/:id', removeFavorite);

module.exports = router;

