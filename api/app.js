"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const winston = require("winston");
const expressWinston = require("express-winston");
const errorHandler = require("./helper/error-handler.js");
const firestoreConnection = require("./helper/firestore-connector.js");
const config = require("./config")();
const helmet = require("helmet");
const logger = require("./logger");
const appConstants = require("./config/constants");
/**
 * Initializes the express application
 */
module.exports = async () => {
    let app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(helmet());

    expressWinston.requestWhitelist.push("body");
    expressWinston.responseWhitelist.push("body");

    expressWinston.bodyBlacklist = config.logger.piiFields;

    app.use(expressWinston.logger({
        transports: [
            new winston.transports.Console()
        ],
        metaField: "apiDetails",
        format: winston.format.combine(
            winston.format.json()
        )
    }));
    const db = await firestoreConnection();
    logger.log("info", "Firestore connection successful", null);
    config.apiVersionSupport.forEach(version => {
        app.use(`/bot-translator/${version}/`, require(`./routes/${version}`)(db, appConstants));
    });
    app.use("/healthcheck", (req,res) => {
        res.status(200).json({message: "ok"});
    });
    app.use(errorHandler);
    return app;
};