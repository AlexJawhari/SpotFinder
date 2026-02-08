// Auth routes for registration, login and basic profile management.
const express = require('express');
const { body } = require('express-validator');

const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .matches(/[a-z]/)
      .matches(/[A-Z]/)
      .matches(/[0-9]/),
    body('username').trim().isLength({ min: 3, max: 30 }).isAlphanumeric(),
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 })],
  login
);

router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

module.exports = router;

