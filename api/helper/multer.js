const Multer = require("multer");
/**
 * Initialises Multer object with memory limit
 */
module.exports = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
