const router = require("express").Router();
const multer = require("../../helper/multer");
const userEmailMiddleware = require("../../middleware/user-email-header");
/**
 * Sets routes for application
 * @param {Object} req - Request object with request details.
 * @param {*} constants - Configurable constants for application.
 * @return {*} router
 */
module.exports = (db, constants) => {
  router.get(
    "/operation",
    userEmailMiddleware,
    require("./operation/list-operations").listOperations(db, constants)
  );

  router.post(
    "/operation",
    userEmailMiddleware,
    multer.single("file"),
    require("./operation/new-operation").newOperation(db, constants)
  );

  router.get(
    "/operation/:operationId/download",
    userEmailMiddleware,
    require("./operation/download-zip").downloadZip(db, constants)
  );

  return router;
};
