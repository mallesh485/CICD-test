const { PubSub } = require("@google-cloud/pubsub");
const config = require("../config")();

const pubsub = new PubSub({
  projectId: config.firestore.projectId,
  keyFilename: config.firestore.keyFilename,
});
/**
 * Publishes msg to topic to start test runner
 * @param {Object} msg - Object with operation details to be sent to the topic.
 */
module.exports.publishMsg = (msg) => {
  const dataBuffer = Buffer.from(JSON.stringify(msg));
  return pubsub.topic(config.botTranslatorTopic).publish(dataBuffer);
};
