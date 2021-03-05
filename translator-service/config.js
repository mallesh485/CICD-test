class Config {
  constructor(options) {
    this.options = options;
    this.options.botZipFolderName = this.options.agentName;
    this.options.logDetails = this.options.logDetails || false;
    switch (process.env.NODE_ENV) {
      case "development":
        this.options.topicName = "translator-bot";
        break;
      case "qa":
        this.options.topicName = "translator-bot";
        break;
      case "production":
        this.options.topicName = "translator-bot";
        break;
      default:
        this.options.topicName = "translator-bot";
    }
  }

  get(key) {
    return this.options[key];
  }

  set(key, value) {
    this.options[key] = value;
  }
}

module.exports = (data) => {
  return new Config(data);
};
