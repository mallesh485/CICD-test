module.exports = (req, res, next) => {
  if (!req.headers || !req.headers["x-user-email"]) {
    const err = new Error(
      "Invalid headers! Mandatory header 'x-user-email' missing in the request."
    );
    err.status = 400;
    return next(err);
  }
  return next();
};
