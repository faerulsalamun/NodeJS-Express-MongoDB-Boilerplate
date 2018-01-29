/**
 * Created by faerulsalamun on 4/22/16.
 */

'use strict';

const config = require(`../../config/${process.env.NODE_ENV || ``}`);
const _ = require(`lodash`);
const async = require(`async`);

const gcm = require(`node-gcm`);
const mongoose = require(`mongoose`);
const workerQueue = require(`../controllers/WorkerController`);
const Utils = require(`../services/Utils`);

const minPriority = parseInt(process.env.MINPRIORITY) || 0;

const worker = workerQueue.client.worker([`notificationWorker`]);
const ObjectID = require(`mongodb`).ObjectID;

// Model
const User = require(`../models/User`);

worker.register({
  notificationWorker: (params, callback) => {
    try {
      callback(null);
    } catch (err) {
      callback(err);
    }
  },
});

worker.on(`dequeued`, (data) => {
  const registrationTokens = data.params.token;

  const message = new gcm.Message();

  message.addData(`message`, data.params.message);

  const sender = new gcm.Sender(config.fcm.key);

  sender.sendNoRetry(message, { registrationTokens }, (err, response) => {
    if (err) console.error(err);
    else console.log(response);
  });
});

worker.on(`failed`, (data) => {
  console.log(`Failed:`);
});

worker.on(`complete`, (data) => {
  console.log(`Complete:`);
});

worker.on(`error`, (err) => {
  console.log(`Error:`);
  worker.stop();
});

// Init db and start worker
const connect = () => {
  console.log(`connect`);

  const options = {
    server: { socketOptions: { keepAlive: 1 } },

        //user: config.mongodb.username,
        //pass: config.mongodb.password
  };

  mongoose.connect(config.mongodb.connectionUri, options);
};

connect();

mongoose.connection.on(`connected`, (err) => {
  console.log(`Notification worker started. minPriority: ${minPriority}`);
  worker.start();
});

// ups
process.on(`uncaughtException`, (err) => {
  console.error(`uncaughtException`, err.stack);
  process.exit(1);
});
