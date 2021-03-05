const loadConfig = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      return {
        port: 3000,
        firestore: {
          projectId: process.env.FIRESTORE_PROJECT_ID,
          keyFilename: process.env.FIRESTORE_KEY_FILE_PATH,
        },
        apiVersionSupport: ["v1"],
        logger: {
          piiFields: [],
        },
        gcpBucket: "bot_translator",
        botTranslatorTopic: "translator-bot-operation",
      };
    case "development":
      return {
        port: 3000,
        firestore: {
          projectId: process.env.FIRESTORE_PROJECT_ID,
          keyFilename: process.env.FIRESTORE_KEY_FILE_PATH,
        },
        apiVersionSupport: ["v1"],
        logger: {
          piiFields: [],
        },
        gcpBucket: "bot_translator",
        botTranslatorTopic: "translator-bot-operation",
      };
    case "qa":
      return {
        port: 3000,
        firestore: {
          projectId: process.env.FIRESTORE_PROJECT_ID,
          keyFilename: process.env.FIRESTORE_KEY_FILE_PATH,
        },
        apiVersionSupport: ["v1"],
        logger: {
          piiFields: [],
        },
        gcpBucket: "bot_translator",
        botTranslatorTopic: "translator-bot-operation",
      };
    default:
      return {
        port: 3000,
        firestore: {
          projectId: "qai-bd-qa",
          keyFilename: "../api/keys/serviceAccountKey.json",
        },
        apiVersionSupport: ["v1"],
        logger: {
          piiFields: [],
        },
        gcpBucket: "bot_translator",
        botTranslatorTopic: "translator-bot-operation",
      };
  }
};

module.exports = loadConfig;
