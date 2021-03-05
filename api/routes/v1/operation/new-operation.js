const Ajv = require("ajv");
const validator = require("../../../helper/validator");
const storage = require("../../../helper/storage-helper");
const publisher = require("../../../helper/pub-sub-helper");
const config = require("../../../config")();
const logger = require("../../../logger");

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(require("./schemas/new-operation.json"));
/**
 * Creates a new job in db and starts a new container of GKE to process request by passing necessary data
 * @param {*} db - DB object of Firestore.
 * @param {*} constants - Configurable constants for application.
 */
module.exports.newOperation = (db, constants) => {
  return async (req, res, next) => {
    try {
      if (!validate(req.body)) {
        const err = new Error(
          "Error in request body, please check details to find all errors."
        );
        err.status = 400;
        err.details = validate.errors;
        throw err;
      }
      // Validating the request
      const operationValidation = validator.validateNewOperation(
        req,
        constants
      );
      if (!operationValidation.flag) {
        throw operationValidation.error;
      }
      // Validating if name is already taken
      const nameValidation = await validator.validateName(
        db,
        constants,
        req.headers["x-user-email"],
        req.body.name
      );
      if (!nameValidation) {
        const err = new Error(
          "File name already taken. Please select another name."
        );
        err.status = 400;
        throw err;
      }
      // Setting the path for file
      let fileName = null;
      if (req.file) {
        fileName = await storage.uploadToGCS(req.file);
      } else if (req.body.file) {
        fileName = await storage.copyToGCS(req.body.file, req.body.name);
      }
      const date = Math.round(new Date().getTime());
      const filePath = `gs://${config.gcpBucket}/${fileName}`;
      const job = {
        createdBy: req.headers["x-user-email"].toLowerCase().trim(),
        createdAt: date,
        updatedAt: date,
        name: req.body.name.toLowerCase().trim(),
        agentInputFile: filePath.trim(),
        agentOutputFile: "",
        srcLanguageCode: req.body.srcLanguageCode.toLowerCase(),
        targetLanguageCode: req.body.targetLanguageCode.toLowerCase(),
        status: "PENDING",
        progress: "0%",
      };
      const ref = await db.collection(constants.firestore.collection).add(job);
      if (!ref) {
        throw new Error("Error occured while started a process.");
      }
      const topicMsg = {
        operationId: ref.id,
        path: filePath,
        srcLanguageCode: req.body.srcLanguageCode.toLowerCase(),
        targetLanguageCode: req.body.targetLanguageCode.toLowerCase(),
        agentName: req.body.name.toLowerCase().trim(),
      };
      try {
        await publisher.publishMsg(topicMsg, constants);
        logger.log("info", `Message published for operation ${ref.id}`, null);
        return res.status(200).json({
          message: "New job started successfully",
          id: ref.id,
        });
      } catch (error) {
        logger.log(
          "error",
          `Message publish for operation ${ref.id} failed.`,
          null
        );
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
  };
};
