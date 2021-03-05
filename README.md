# Bot Translator

A tool that translates dialoglfow agent from source language code to target language code.
Built to speed up virtual agent development process

# Why we built this?

1. To keep track of changes in multilingual bots 
2. To support auto entity tagging in training phrases
3. Auto translate training phrases ( no excel sheet, no extensions required)
4. Reduce the time for first iteration of bot to few minutes
5. Auto translate text responses and custom payload responses

# Dependencies

1. PubSub 
      - API
         - topic: `tanslator-bot-operation`
            Publish new operation to start a Kubernetes job
         - subscription:  
            CF subscribes to it to start a new job
      - Translator Service
         - topic: `translator-bot`
            Publish results and events to store in database
         - subscription: 
            CF subscribes to it to update the database accordingly
2. Cloud Storage 
   Bucket Name - `bot_translator`
3. Firestore
   Collection Name - `bot-translator`

# Setup Guide

## API 

```
$ cd api
$ npm install
$ export FIRESTORE_KEY_FILE_PATH=/path/to/key (or add file to keys folder)
$ export FIRESTORE_PROJECT_ID=<project_id>
$ export NODE_ENV=<developemt | production | qa>
$ npm start
```

[API Specs](https://docs.google.com/document/d/1WTr2qmpMaDlbgFKPRR6DIyhjSfBtzM9XxSR8ZeBLv0E/edit?usp=sharing)

## Translator Service

### Before you begin

- Create or select a project.
- Enable the Cloud Translation API for that project.
- Create a service account.
- Download a private key as JSON.
- Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of the JSON file that contains your service account key
- Export the dialogflow agent
  
### Before running the script

- Change `config.js` 
- Provide the **absolute path** to the downloaded dialogflow zip file
- Change the `srcLanguageCode`
- Change the `targetLanguageCode`
- If required, change the output zip folder name `botZipFolderName`

```
$ cd translator-service
$ npm install
$ export operationId=<unique operation id>
$ export zipPath=<gcs object url>
$ export NODE_ENV=<developemt | production | qa>
$ export srcLanguageCode=<existing supported language>
$ export targetLanguageCode=<language to support>
$ export agentName=<agent name>
$ export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key
$ npm start
```

### After running the script

- Go to Dialogflow agent > Settings > Languages
- Ensure that the target language code is added as well
- Go to Settings > Export
- Import the generated zip folder

# Benefits

1. Easy to use translator

# Limitations

1. When running the script second time, training phrases of only new intents are handled. The changes in existing intent training phrases need to be handled by developer 
   - Inprogress, will be solved soon
2. Ensure that proper language codes are entered which are supported. For example. the for chinese bot the code on website is `zh-CN` but it should be provided in lowercase in `config.js` file.
   - Invalid language codes need to be still handled
3. Converts to only one target language at a time. 
   - Multiple language translation not supported yet
4. Only default responses and custom payload is handled
   - Platform specific responses handling is part of future scope
