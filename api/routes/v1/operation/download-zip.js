const fs = require("fs");
const storage = require("../../../helper/storage-helper");
const config = require("../../../config")();

/**
 * Export Zip file
 * @param {*} db - DB object of Firestore.
 * @param {*} constants - Configurable constants for application.
 */
module.exports.downloadZip = (db, constants) => {
  return async (req, res, next) => {
    try {
      // get zip location
      const operationDoc = await db
        .collection(constants.firestore.collection)
        .doc(req.params.operationId)
        .get();

      if (!operationDoc.data()) {
        const err = new Error("No data found for the specified id.");
        err.status = 400;
        throw err;
      }
      const operationDetails = operationDoc.data();
      const agentZipPath = operationDetails.agentOutputFile;
      // check if it is empty
      if (!agentZipPath) {
        const err = new Error(
          `The bot translation operation is a long running process. Please check again if the operation is completed`
        );
        err.status = 400;
        err.data = {
          operationStatus: operationDetails.status,
          operationProgress: operationDetails.progress,
        };
        throw err;
      }

      // extract folder name and filename from path
      const filePath = agentZipPath.match(
        new RegExp(`gs://${config.gcpBucket}/(.*)$`)
      )[1];
      // create a agents directory if doesnt exists already
      if (!fs.existsSync(`./agents/`)) {
        fs.mkdirSync("./agents/");
      }
      // read the zip file
      await storage.readBucketObject(filePath);
      // send the zip file as response
      return res.download(`./agents/${filePath}`, () => {
        fs.unlink(`./agents/${filePath}`, () => {});
      });
    } catch (error) {
      return next(error);
    }
  };
};
