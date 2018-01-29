/**
 * Created by faerulsalamun on 8/29/16.
 */

'use strict';

const monq = require(`monq`);
const config = require(`../../config/${process.env.NODE_ENV || ``}`);

const client = monq(config.mongodb.connectionUri);

const notificationWorkerQueque = client.queue(`notificationWorker`);

module.exports = {

  notificationWorkerQueque: (name, data, callback) => {
    notificationWorkerQueque.enqueue(`notificationWorker`, data, (err, job) => {
      if (err) callback(err);
      callback(null, job);
    });
  },

  client,

};
