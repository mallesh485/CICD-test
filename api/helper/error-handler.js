const errorHandler = (err, req, res, next) => {
  const env = process.env.NODE_ENV || "development";

  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    status,
    details: env === "development" ? err.details : undefined,
    stackTrace: env === "development" ? err.stack : undefined,
    message: env === "development" ? err.message : "Internal server error.",
    ...err.data,
  });
  return undefined;
};

module.exports = errorHandler;
