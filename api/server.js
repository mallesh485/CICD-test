"use strict";

const expressApp = require("./app");
const http = require("http");
const logger = require("./logger");
const config = require("./config")();

expressApp()
    .then(app => {
        const server = http.createServer(app);
        server.listen(config.port, (err) => {
            if (err) {
                logger.log("error", "Server error", null, { "message": err });
            } else {
                logger.log("info", `server running at  ${config.port}`, null);
            }
        });
    });