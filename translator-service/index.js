const unzipper = require("unzipper");
const fs = require("fs");
const archiver = require("archiver");
const path = require("path");
const { intentTranslator } = require("./helper/intent");
const { entityTranslator } = require("./helper/entity");
const pubsub = require("./helper/pubsub");
const {
  uploadToBucket,
  readStreamFileZip,
} = require("./helper/storage-helper");
const createconfig = require("./config");

/**
 * Map filename to file
 * @param {Array<file>} dir : Contents of the directory
 */
const buildMapper = (dir) => {
  const map = {};
  for (const file of dir.files) {
    let fileName = "";
    if (file.path.startsWith("intents")) {
      fileName = file.path.substring(8);
    } else if (file.path.startsWith("entities")) {
      fileName = file.path.substring(9);
    }
    map[fileName] = file;
  }
  return map;
};

/**
 * Build the directory structure
 * ./package.json
 * ./agent.json
 * ./intents/
 * ./entities/
 * @param {*} root : Output root directory name
 */
const buildDir = async (root) => {
  if (!fs.existsSync(`./agent/`)) {
    fs.mkdirSync("./agent/");
  }
  if (!fs.existsSync(`./agent/${root}`)) {
    fs.mkdirSync(`./agent/${root}`);
  }
  if (!fs.existsSync(`./agent/${root}/intents`)) {
    fs.mkdirSync(`./agent/${root}/intents`);
  }
  if (!fs.existsSync(`./agent/${root}/entities`)) {
    fs.mkdirSync(`./agent/${root}/entities`);
  }
};

/**
 * 1. Unzip Directory
 * 2. Build Output directory structure
 * 3. Process files
 * @returns {Promise} containing the intent data and entity data in JSON format
 */
const main = async (config) => {
  const directory = await unzipper.Open.file(
    path.join(__dirname, `/${config.get("agentName")}.zip`)
  );
  const map = buildMapper(directory);
  if (!config.get("botZipFolderName")) {
    config.set("botZipFolderName", "target");
  }

  await buildDir(config.get("botZipFolderName"));

  return parser(directory, map, config);
};
/**
 * Parse all files in drectory and translate them
 * @param {*} directory: Unzipped Directory
 * @param {*} map: Map file to category[Intent | Entity]
 * @param {*} config: configuration
 */
const parser = async (directory, map, config) => {
  try {
    // console.log(Math.ceil(directory.files.length/2))
    for (const [i, file] of directory.files.entries()) {
      const fileName = file.path;
      if (i === Math.ceil(directory.files.length / 2)) {
        pubsub.publish(
          {
            operationId: config.get("operationId"),
            key: ["progress"],
            value: ["40%"],
            event: "Files Translation In Process!",
          },
          config
        );
      }
      if (fileName.startsWith("intents")) {
        await intentTranslator(file, map, config);
      } else if (fileName.startsWith("entities")) {
        await entityTranslator(file, map, config);
      } else {
        if (config.get("logDetails"))
          console.log(`Creating ${fileName}..........`);
        let contents = await file.buffer();
        contents = JSON.parse(contents.toString());
        if (fileName.includes("agent.json")) {
          contents.supportedLanguages.push(config.get("targetLanguageCode"));
        }
        fs.writeFileSync(
          `./agent/${config.get("botZipFolderName")}/${fileName}`,
          JSON.stringify(contents)
        );
      }
    }
    pubsub.publish(
      {
        operationId: config.get("operationId"),
        key: ["progress"],
        value: ["80%"],
        event: "Translation completed!",
      },
      config
    );
    return;
  } catch (err) {
    pubsub.publish(
      {
        operationId: config.get("operationId"),
        key: ["status"],
        value: ["Failed"],
        event: err,
      },
      config
    );
    return err;
  }
};
/**
 * Generate the output zip for new translated agent
 * @param {string} dir: Translated agent directory name
 * @param {object} config: configurattion
 */
const generateZip = async (dir, config) => {
  const date = new Date().getTime();
  const output = await fs.createWriteStream(`./agent/${dir}-${date}.zip`);
  const archive = await archiver("zip");
  archive.pipe(output);
  archive.directory(`./agent/${dir}/`, "");
  await archive.on("finish", () => {
    uploadToBucket(dir, date, config)
      .then((data) => {
        pubsub.publish(
          {
            operationId: config.get("operationId"),
            key: ["progress", "status", "agentOutputFile"],
            value: ["100%", "Completed", data],
            event: "Translated Zip File Uploaded and Removed from local!",
          },
          config
        );
      })
      .catch((err) => {
        pubsub.publish(
          {
            operationId: config.get("operationId"),
            key: ["status"],
            value: ["Failed"],
            event: err,
          },
          config
        );
      })
      .finally(() => {
        rmdir(path.join(__dirname, `/agent/${dir}`));
        fs.unlinkSync(path.join(__dirname, `/agent/${dir}-${date}.zip`));
      });
  });

  archive.on("error", (err) => {
    throw err;
  });
  archive.finalize();
};

/**
 * Remove Agent's directory
 * @param {String} dir : Exact Directory Path(not relative)
 */
const rmdir = (dir) => {
  var list = fs.readdirSync(dir);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);

    if (filename === "." || filename === "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename);
    } else {
      // rm filename
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
};

const init = async (data) => {
  const config = await createconfig(data);
  // let fileRead = await readStreamFileZip(config)
  readStreamFileZip(config)
    .then(() => {
      main(config)
        .then(() => {
          generateZip(config.get("botZipFolderName"), config);
          fs.unlinkSync(
            path.join(__dirname, `/${config.get("botZipFolderName")}.zip`)
          );
        })
        .catch((err) => {
          pubsub.publish(
            {
              operationId: config.get("operationId"),
              key: ["status"],
              value: ["Failed"],
              event: err,
            },
            config
          );
        });
    })
    .catch((_err) => {
      if (
        fs.existsSync(
          path.join(__dirname, `/agent/${config.get("botZipFolderName")}.zip`)
        )
      ) {
        fs.unlinkSync(
          path.join(__dirname, `/agent/${config.get("botZipFolderName")}.zip`)
        );
      }
    });
};

const options = {
  operationId: process.env.operationId || null,
  path: process.env.zipPath || null,
  srcLanguageCode: process.env.srcLanguageCode || null,
  targetLanguageCode: process.env.targetLanguageCode || null,
  agentName: process.env.agentName || null,
  logDetails: process.env.logDetails || false,
};
init(options);
