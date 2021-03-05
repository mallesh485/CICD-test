const Firestore = require("@google-cloud/firestore");
const config = require("../config")();
/**
 * Firestore DB Connector
 *
 * @returns {Object} db - Firestore DB connection object
 */
module.exports = async () => {
  const db = new Firestore({
    projectId: config.firestore.projectId,
    keyFilename: config.firestore.keyFilename,
  });
  return db;
};
