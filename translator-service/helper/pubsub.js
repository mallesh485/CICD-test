const { PubSub } = require("@google-cloud/pubsub");
const pubsub = new PubSub();
// const logger = require("./logger");
// const appConstants = require("./constants");

const callback = (err, messageId) => {
  if (err) {
    // Error handling omitted.
    console.log(err);
  }
  console.log("info", `PubSub message ${messageId} published`);
};

const publish = (data, config) => {
  const topic = pubsub.topic(config.get("topicName"));
  topic.publishJSON(data, callback);
};

const subscribe = () => {
  return pubsub.subscription("translator-bot-operation-subscription");
};

module.exports = { publish, subscribe };
