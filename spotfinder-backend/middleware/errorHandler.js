// Central place for sending consistent error responses back to the client.
const errorHandler = (err, req, res, next) => {
  // Logging here is useful in dev and on the server, but we keep the message
  // sent to clients fairly generic so we don't leak internals.
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong' : err.message;

  res.status(status).json({ error: message });
};

module.exports = errorHandler;

