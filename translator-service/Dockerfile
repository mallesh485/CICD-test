FROM node

WORKDIR /code

COPY ./package*.json ./

# RUN npm install & npm install -g pm2

RUN npm install

COPY .  .

EXPOSE 3000

CMD node index.js

# CMD pm2-runtime ecosystem.config.js 