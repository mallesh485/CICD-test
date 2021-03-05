const { Translate } = require("@google-cloud/translate").v2;
const translater = new Translate();

const translate = async (msg, config) => {
  return await translater.translate(msg, {
    from: config.get("srcLanguageCode"),
    to: config.get("targetLanguageCode"),
  });
};

module.exports = { translate };
