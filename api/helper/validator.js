const logger = require("../logger");

const validateName = async (db, constants, username, name) => {
  try {
    const documents = await db
      .collection(constants.firestore.collection)
      .where("createdBy", "==", username.toLowerCase().trim())
      .where("name", "==", name.toLowerCase().trim())
      .get();
    const data = [];
    documents.forEach((doc) => {
      data.push(doc.id);
    });
    if (data.length <= 0) {
      return true;
    }
    return false;
  } catch (err) {
    logger.log("error", "Error in validating name", null, err);
    return false;
  }
};

const validateNewOperation = (req, constants) => {
  const err = new Error();
  err.status = 400;
  const response = {
    flag: true,
    error: null,
  };
  try {
    if (
      !req.body ||
      !req.body.name.replace(/[!@#$%^&*(),.?":{}|<>~`1234567890]/g, "").trim()
    ) {
      err.message =
        "Required parameter 'platforms' or 'name' are either missing or invalid in request body";
      response.error = err;
      response.flag = false;
      return response;
    }

    if (
      !req.headers ||
      !req.headers["x-user-email"] ||
      !constants.email.domain.includes(
        req.headers["x-user-email"].substr(
          req.headers["x-user-email"].indexOf("@"),
          req.headers["x-user-email"].length - 1
        )
      )
    ) {
      err.message =
        "Invalid email. Specified 'email domain' does not have permission to start a process.";
      response.error = err;
      response.flag = false;
      return response;
    }

    if (req.file && req.body.file) {
      err.message =
        "Invalid request. Cant upload a file and process storage url simultaneously.";
      response.error = err;
      response.flag = false;
      return response;
    }
    if (!req.file && !req.body.file) {
      err.message =
        "Need atleast a storage path for Agent zip or upload an Agent zip file.";
      response.error = err;
      response.flag = false;
      return response;
    }

    if (req.body.srcLanguageCode === req.body.targetLanguageCode) {
      err.message = "The source and target languages need to be different";
      response.error = err;
      response.flag = false;
      return response;
    }
  } catch (error) {
    response.error = error;
    response.flag = false;
  }
  return response;
};

module.exports = {
  validateName,
  validateNewOperation,
};
