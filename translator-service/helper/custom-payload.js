const { translate } = require("./translator");

const list = async (msg, config) => {
  let [translatedText] = await translate(msg.title, config);
  msg.title = translatedText;

  if (msg.subtitle) {
    [translatedText] = await translate(msg.subtitle, config);
    msg.subtitle = translatedText;
  }
  msg.event.languageCode = config.get("targetLanguageCode");
  return msg;
};

const divider = async (msg, config) => {
  return msg;
};

const info = async (msg, config) => {
  let [translatedText] = await translate(msg.title, config);
  msg.title = translatedText;
  if (msg.subtitle) {
    [translatedText] = await translate(msg.subtitle, config);
    msg.subtitle = translatedText;
  }
  return msg;
};

const description = async (msg, config) => {
  let [translatedText] = await translate(msg.title, config);
  msg.title = translatedText;
  // description text<array of string>
  if (msg.text) {
    [translatedText] = await translate(msg.text, config);
    msg.text = translatedText;
  }
  return msg;
};

const image = async (msg, config) => {
  return msg;
};

const button = async (msg, config) => {
  const [translatedText] = await translate(msg.text, config);
  msg.text = translatedText;
  if (msg.event) msg.event.languageCode = config.get("targetLanguageCode");
  return msg;
};

const accordion = async (msg, config) => {
  let [translatedText] = await translate(msg.title, config);
  msg.title = translatedText;
  // change subtitle as welll if present
  if (msg.subtitle) {
    [translatedText] = await translate(msg.subtitle, config);
    msg.subtitle = translatedText;
  }
  // accordion text
  if (msg.text) {
    [translatedText] = await translate(msg.text, config);
    msg.text = translatedText;
  }
  return msg;
};

const chipHandler = async (chip, config) => {
  const [translatedText] = await translate(chip.text, config);
  chip.text = translatedText;
  return chip;
};

const chips = async (msg, config) => {
  msg.options = await Promise.all(
    msg.options.map((chip) => chipHandler(chip, config))
  );
  return msg;
};

module.exports = {
  list,
  divider,
  info,
  description,
  image,
  button,
  accordion,
  chips,
};
