/**
 * Created by faerulsalamun on 8/30/16.
 */

'use strict';

const gcm = require(`node-gcm`);
const config = require(`../../config/${process.env.NODE_ENV || ``}`);

// Services
const Async = require(`../services/Async`);

// Controllers
const WorkerController = require(`../controllers/WorkerController`);

module.exports = {

  createDataApi: Async.route(function* (req, res, next) {
    const data = {};
    data.message = req.body.message || ``;
    data.token = [req.body.token];

    WorkerController.notificationWorkerQueque(`testNotification`, data, (err, result) => {
      res.ok(`Notification send :)`);
    });
  }),

};
