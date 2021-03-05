const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const fs = require("fs");
const path = require("path");
const pubsub = require("./pubsub");

const readStreamFileZip = async (config) => {
  const tmp = config.get("path").split(/gs:\/\/(.*)\/(.*)/);
  const bucket = storage.bucket(tmp[1]);
  const remoteFile = bucket.file(tmp[2]);
  return new Promise((resolve, reject) => {
    remoteFile
      .createReadStream()
      .on("error", function (err) {
        pubsub.publish(
          {
            operationId: config.get("operationId"),
            key: ["status"],
            value: ["Failed to read data from bucket"],
            event: err,
          },
          config
        );
        reject(err);
      })
      .on("response", function (chunk) {
        // Server connected and responded with the specified status and headers.
      })
      .on("end", function () {
        if (config.get("logDetails"))
          console.log("info", "Successfully read file from bucket");
      })
      .pipe(
        fs.createWriteStream(
          path.join(__dirname, "..", `/${config.get("agentName")}.zip`)
        )
      )
      .on("error", (err) => {
        pubsub.publish(
          {
            operationId: config.get("operationId"),
            key: ["status"],
            value: ["Failed"],
            event: err,
          },
          config
        );
        reject(err);
      })
      .on("close", () => {
        pubsub.publish(
          {
            operationId: config.get("operationId"),
            key: ["progress"],
            value: ["5%"],
            event: "Agent Unzipped",
          },
          config
        );
        resolve(true);
      });
  });
};

const uploadToBucket = async (dir, date, config) => {
  const bucketName = "bot_translator";
  const filename = `${dir}-${date}.zip`;
  await upload(bucketName, path.join(__dirname, "..", `/agent/${filename}`));
  return `gs://${bucketName}/${filename}`;
};

const upload = async (bucketName, filename) => {
  return await storage.bucket(bucketName).upload(filename, {
    gzip: true,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });
};
module.exports = { uploadToBucket, readStreamFileZip };
