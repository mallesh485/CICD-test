const { Storage } = require("@google-cloud/storage");
const axios = require("axios");
const config = require("../config")();

const storage = new Storage({
  projectId: config.firestore.projectId,
  keyFilename: config.firestore.keyFilename,
});
const bucket = storage.bucket(config.gcpBucket);

/**
 * Uploads the zip file to GCS and returns its path
 * @param {*} fileUpload Multer file object that will have agent zip file.
 */
const uploadToGCS = (fileUpload) => {
  return new Promise((resolve, reject) => {
    if (!fileUpload) {
      const err = new Error("Please upload the agent zip file.");
      err.status = 400;
      reject(err);
    }

    if (
      fileUpload.originalname.substr(
        fileUpload.originalname.lastIndexOf("."),
        fileUpload.originalname.length - 1
      ) !== ".zip"
    ) {
      const err = new Error("Invalid file format, only .zip file expected.");
      err.status = 400;
      reject(err);
    }

    const gcsname = `${Date.now()}-${fileUpload.originalname}`;
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    stream.on("error", (err) => {
      reject(err);
    });

    stream.on("finish", () => {
      resolve(gcsname);
    });

    stream.end(fileUpload.buffer);
  });
};

/**
 * Downloads the zip and streams file to GCS and returns its path
 * @param {*} filePath Downloadable link of zip file
 * @param {*} name Name to be given to file
 */
const copyToGCS = (filePath, name) => {
  return new Promise((resolve, reject) => {
    const fileName = Date.now() + name;
    const file = bucket.file(fileName);
    axios({
      method: "get",
      url: filePath,
      responseType: "stream",
    })
      .then((response) => {
        if (
          response.status === 200 &&
          response.headers["content-type"] === "application/zip"
        ) {
          response.data
            .pipe(
              file.createWriteStream({
                metadata: {
                  contentType: "application/zip",
                  metadata: {
                    custom: "metadata",
                  },
                },
              })
            )
            .on("error", (err) => {
              reject(err);
            })
            .on("finish", () => {
              resolve(fileName);
            });
        } else {
          const err = new Error(
            "Verify the link, link is either not public or not accessible."
          );
          err.status = 400;
          throw err;
        }
      })
      .catch((error) => {
        if (error.response && error.response.status >= 400) {
          const err = new Error(
            "Verify the link, link is either not public or not accessible."
          );
          err.status = 400;
          reject(err);
        }
        reject(error);
      });
  });
};

const readBucketObject = async (filePath) => {
  await storage
    .bucket(config.gcpBucket)
    .file(filePath)
    .download({
      destination: `./agents/${filePath}`,
    });
};

module.exports = {
  uploadToGCS,
  copyToGCS,
  readBucketObject,
};
