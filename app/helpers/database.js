'use strict';

const fs = require(`fs-extra`);

const debug = require(`debug`)(`app`);
const config = require(`../../config/${process.env.NODE_ENV || ``}`);

const mongoose = require(`mongoose`);
mongoose.Promise = require(`bluebird`);

// mongodb connection
const options = {
  server: { socketOptions: { keepAlive: 1 } },
  user: config.mongodb.username,
  pass: config.mongodb.password,
};

mongoose.connect(config.mongodb.connectionUri, options);

mongoose.connection.on(`connected`, () => {
  debug(`Mongoose default connection open to ${config.mongodb.connectionUri}`);
});

mongoose.connection.on(`error`, (err) => {
  debug(`Mongoose default connection error: ${err}`);
});

mongoose.connection.on(`disconnected`, () => {
  debug(`Mongoose default connection disconnected`);
});

process.on(`SIGINT`, () => {
  mongoose.connection.close(() => {
    debug(`Mongoose default connection disconnected through app termination`);
    process.exit(0);
  });
});

module.exports = mongoose;
