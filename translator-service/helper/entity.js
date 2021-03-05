const { translate } = require("./translator");
const fs = require("fs");

const translateSynonyms = async (synonyms, config) => {
  const [translatedSynonyms] = await translate(synonyms, config);

  return translatedSynonyms;
};
const entityTranslator = async (file, map, config) => {
  const fileName = file.path.substring(9); // remove "entities/"
  if (fileName.endsWith(`_entries_${config.get("srcLanguageCode")}.json`)) {
    const entityName = fileName.substring(0, fileName.indexOf("_entries"));
    const targetFileName = fileName.replace(
      `_${config.get("srcLanguageCode")}.json`,
      `_${config.get("targetLanguageCode")}.json`
    );
    if (map[targetFileName]) {
      // FIND THE DIFFERENCES
      map[targetFileName].parsed = true;
      // create source language file
      if (config.get("logDetails"))
        console.log(
          `Creating ${entityName}_entries_${config.get(
            "srcLanguageCode"
          )}.json ..........`
        );
      fs.writeFileSync(
        `./agent/${config.get(
          "botZipFolderName"
        )}/entities/${entityName}_entries_${config.get(
          "srcLanguageCode"
        )}.json`,
        await file.buffer()
      );
      // create target language file
      if (config.get("logDetails"))
        console.log(
          `Creating ${entityName}_entries_${config.get(
            "targetLanguageCode"
          )}.json ..........`
        );
      fs.writeFileSync(
        `./agent/${config.get(
          "botZipFolderName"
        )}/entities/${entityName}_entries_${config.get(
          "targetLanguageCode"
        )}.json`,
        await map[targetFileName].buffer()
      );
    } else {
      const content = await file.buffer();
      const srcEntity = JSON.parse(content.toString());
      let i = 0;
      const targetFileContents = [];
      while (i < srcEntity.length) {
        const obj = {
          value: srcEntity[i].value,
          synonyms: srcEntity[i].value.startsWith("@sys")
            ? srcEntity[i].synonyms
            : await translateSynonyms(srcEntity[i].synonyms, config),
        };
        i++;
        targetFileContents.push(obj);
      }
      // create source language file
      if (config.get("logDetails"))
        console.log(
          `Creating ${entityName}_entries_${config.get(
            "srcLanguageCode"
          )}.json ..........`
        );
      fs.writeFileSync(
        `./agent/${config.get(
          "botZipFolderName"
        )}/entities/${entityName}_entries_${config.get(
          "srcLanguageCode"
        )}.json`,
        JSON.stringify(srcEntity)
      );
      // create target language file
      if (config.get("logDetails"))
        console.log(
          `Creating ${entityName}_entries_${config.get(
            "targetLanguageCode"
          )}.json ..........`
        );
      fs.writeFileSync(
        `./agent/${config.get(
          "botZipFolderName"
        )}/entities/${entityName}_entries_${config.get(
          "targetLanguageCode"
        )}.json`,
        JSON.stringify(targetFileContents)
      );
    }
  } else if (!fileName.includes("_entries_")) {
    // write entity.json file
    if (config.get("logDetails")) console.log(`Creating ${fileName}..........`);
    fs.writeFileSync(
      `./agent/${config.get("botZipFolderName")}/entities/${fileName}`,
      await file.buffer()
    );
  } else {
    if (config.get("logDetails")) console.log(`Creating ${fileName}..........`);
    fs.writeFileSync(
      `./agent/${config.get("botZipFolderName")}/entities/${fileName}`,
      await file.buffer()
    );
  }
};

module.exports = { entityTranslator };
