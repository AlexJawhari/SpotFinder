// Simple JWT-based auth middleware that decorates the request with `req.user`.
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticate, protect: authenticate };

