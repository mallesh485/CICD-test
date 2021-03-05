const { v4: uuid } = require("uuid");
const fs = require("fs");
const payloadHelper = require("./custom-payload");
const _ = require("lodash");
const { translate } = require("./translator");

/**
 * Concatenate the training phrases text
 * @param {Object<TrainingPhrase>} obj : Single training phrase object
 * @returns {string}: The entire training phrase
 */
const getPhrase = (obj) => {
  const x = obj.data
    .map((ph) => {
      if (ph.meta) return `[${ph.text}]`;
      else return ph.text;
    })
    .join("");
  return x;
};

/**
 * Get the tagged entities for training phrase in format entityMeta(alias)=value
 * @param {Object<TrainingPhrase>} obj : Single training phrase object
 * @returns {String} EntityName=value pairs joined by "|"
 */
const getEntity = (obj) => {
  return obj.data
    .filter((ph) => ph.meta)
    .map((ph) => {
      return `${ph.meta}(${ph.alias})=${ph.text}`;
    })
    .join("|");
};

/**
 * Tag entities in the translated training phrase
 * @param {String} text : Translated training phrase
 * @param {Array<String>} entities : Array of tagged entities in source language in single training phrase
 */
const tagEntity = (text, entities) => {
  const data = [];
  const parts = text.split("[");
  let idx = 0;
  entities = entities.split("|");
  parts.forEach((p) => {
    if (p.includes("]")) {
      p.split("]").map((pi, i) => {
        if (pi) {
          if (i === 0) {
            const { entityMeta, entityAlias } = new RegExp(
              /(?<entityMeta>.*)\((?<entityAlias>.*)\)=(?<entityValue>.*)/
            ).exec(entities[idx]).groups;

            if (entityMeta.startsWith("@sys")) {
              data.push({
                text: pi,
                alias: entityAlias,
                meta: entityMeta,
                userDefined: true,
              });
            } else {
              data.push({
                text: pi,
                alias: entityAlias,
                meta: entityMeta,
                userDefined: true,
              });
            }
            idx++;
          } else {
            data.push({ text: pi, userDefined: false });
          }
        }
      });
    } else {
      if (p) data.push({ text: p, userDefined: false });
    }
  });
  return data;
};

const translateTextResponse = async (msg, config) => {
  msg.lang = config.get("targetLanguageCode");
  if (!msg.speech) {
    return msg;
  }
  const [speech] = await translate(msg.speech, config);
  msg.speech = speech;
  return msg;
};

const processRichContent = async (richContent, config) => {
  return Promise.all(
    richContent.map((richMessage) => {
      switch (richMessage.type) {
        case "list":
          return payloadHelper.list(richMessage, config);
        case "divider":
          return payloadHelper.divider(richMessage, config);
        case "info":
          return payloadHelper.info(richMessage, config);
        case "description":
          return payloadHelper.description(richMessage, config);
        case "image":
          return payloadHelper.image(richMessage, config);
        case "button":
          return payloadHelper.button(richMessage, config);
        case "accordion":
          return payloadHelper.accordion(richMessage, config);
        case "chips":
          return payloadHelper.chips(richMessage, config);
      }
    })
  );
};
const translateCustomPayload = async (msg, config) => {
  msg.lang = config.get("targetLanguageCode");

  msg.payload.richContent = await Promise.all(
    msg.payload.richContent.map((richContent) => {
      return processRichContent(richContent, config);
    })
  );
  return msg;
};
/**
 * Find the intent wise differences between source and target language
 * Translate and tag traninig phrases for the intent
 * @param {file} file : File data type from unzipper module
 * @param {Object} map : Map of filename : file
 * @returns {Object} return the json object
 */
const intentTranslator = async (file, map, config) => {
  try {
    const fileName = file.path.substring(8); // remove "intents/"
    if (fileName.endsWith(`_usersays_${config.get("srcLanguageCode")}.json`)) {
      const intentName = fileName.substring(0, fileName.indexOf("_usersays"));
      const targetFileName = fileName.replace(
        `_${config.get("srcLanguageCode")}.json`,
        `_${config.get("targetLanguageCode")}.json`
      );
      if (map[targetFileName]) {
        // create source language file
        if (config.get("logDetails"))
          console.log(
            `Creating ${intentName}_usersays_${config.get(
              "srcLanguageCode"
            )}.json ..........`
          );
        fs.writeFileSync(
          `./agent/${config.get(
            "botZipFolderName"
          )}/intents/${intentName}_usersays_${config.get(
            "srcLanguageCode"
          )}.json`,
          await file.buffer()
        );
        // create target language file
        if (config.get("logDetails"))
          console.log(
            `Creating ${intentName}_usersays_${config.get(
              "targetLanguageCode"
            )}.json ..........`
          );
        fs.writeFileSync(
          `./agent/${config.get(
            "botZipFolderName"
          )}/intents/${intentName}_usersays_${config.get(
            "targetLanguageCode"
          )}.json`,
          await map[targetFileName].buffer()
        );
      } else {
        // FILE DOES NOT EXISTS
        const content = await file.buffer();
        const srcTps = JSON.parse(content.toString());
        let i = 0;
        if (config.get("logDetails"))
          console.log(
            `   Translating ${srcTps.length} training phrases.......`
          );
        const targetFileContents = [];
        while (i < srcTps.length) {
          const obj = {
            id: uuid(),
            data: [],
            isTemplate: false,
            count: 0,
            updated: 0,
            lang: config.get("targetLanguageCode"),
          };
          const tp = getPhrase(srcTps[i]);
          const [newTp] = await translate(tp, config);
          const taggedEntities = getEntity(srcTps[i]);
          obj.data = tagEntity(newTp, taggedEntities);
          i++;
          targetFileContents.push(obj);
        }
        // create source language file
        if (config.get("logDetails"))
          console.log(
            `Creating ${intentName}_usersays_${config.get(
              "srcLanguageCode"
            )}.json ..........`
          );
        fs.writeFileSync(
          `./agent/${config.get(
            "botZipFolderName"
          )}/intents/${intentName}_usersays_${config.get(
            "srcLanguageCode"
          )}.json`,
          JSON.stringify(srcTps)
        );
        // create target language file
        if (config.get("logDetails"))
          console.log(
            `Creating ${intentName}_usersays_${config.get(
              "targetLanguageCode"
            )}.json ..........`
          );
        fs.writeFileSync(
          `./agent/${config.get(
            "botZipFolderName"
          )}/intents/${intentName}_usersays_${config.get(
            "targetLanguageCode"
          )}.json`,
          JSON.stringify(targetFileContents)
        );
      }
    } else if (!fileName.includes("_usersays_")) {
      // write intent.json file
      // convert intent responses
      if (config.get("logDetails"))
        console.log(`Creating ${fileName}..........`);

      let fileContent = await file.buffer();
      fileContent = JSON.parse(fileContent);

      const platformSpecificMessages = fileContent.responses[0].messages.filter(
        (msg) => msg.platform
      );
      const filteredMessages = fileContent.responses[0].messages.filter(
        (msg) => msg.lang !== config.get("targetLanguageCode") && !msg.platform
      );

      const translatedResponses = await Promise.all(
        filteredMessages.map((msg) => {
          const obj = _.cloneDeep(msg);
          switch (msg.type) {
            case "0":
              return translateTextResponse(obj, config);
            case "4":
              return translateCustomPayload(obj, config);
            default:
              return Promise.resolve(obj);
          }
        })
      );

      const newContent = Object.assign({}, fileContent);
      newContent.responses[0].messages = [
        ...translatedResponses,
        ...filteredMessages,
        ...platformSpecificMessages,
      ];
      fs.writeFileSync(
        `./agent/${config.get("botZipFolderName")}/intents/${fileName}`,
        JSON.stringify(newContent)
      );
    } else if (fileName) {
      if (config.get("logDetails"))
        console.log(`Creating ${fileName}..........`);
      fs.writeFileSync(
        `./agent/${config.get("botZipFolderName")}/intents/${fileName}`,
        await file.buffer()
      );
    }

    return;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { intentTranslator };
