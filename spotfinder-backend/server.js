// Main Express bootstrapping for the SpotFinder API.
// Wires up security middleware, CORS, JSON parsing, rate limiting, and the feature routes.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const { authenticate } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const locationRoutes = require('./routes/locations.routes');
const reviewRoutes = require('./routes/reviews.routes');
const favoriteRoutes = require('./routes/favorites.routes');
const userRoutes = require('./routes/users.routes');

// Community features routes
const eventRoutes = require('./routes/events');
const postRoutes = require('./routes/posts');
const groupRoutes = require('./routes/groups');
const usersRoutes = require('./routes/users');
const checkInRoutes = require('./routes/checkIns');
const geolocationRoutes = require('./routes/geolocation.routes');

const app = express();

// Required for Render (and other cloud proxies) to correctly identify IP addresses
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Add sensible security headers (XSS, clickjacking, etc.)
app.use(helmet());

// Only allow requests from the frontend we expect.
app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
  })
);

// Parse JSON request bodies with a modest size limit.
app.use(express.json({ limit: '1mb' }));

// Simple global rate limiter as a backstop against abuse.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(globalLimiter);

// Lightweight health check for uptime monitors and sanity checks.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Actual API routes (versioned under /api)
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reviews', reviewRoutes);
// Favorites are always user-specific, so we guard the entire router.
app.use('/api/favorites', authenticate, favoriteRoutes);
app.use('/api/users', userRoutes);

// Community features routes
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/profile', usersRoutes);
app.use('/api/check-ins', checkInRoutes);
app.use('/api/geolocation', geolocationRoutes);
app.use('/api/upload', require('./routes/upload.routes'));

// Fallback when no route matches.
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handler so controllers can `next(err)`.
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SpotFinder backend listening on port ${PORT}`);
});

module.exports = app;

