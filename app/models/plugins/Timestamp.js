/**
 * Created by faerulsalamun on 2/16/16.
 */

'use strict';

const moment = require(`moment-timezone`);

exports.useTimestamps = (schema, options) => {
  schema.add({
    createdTime: Date,
    updatedTime: Date,
  });

  schema.pre(`save`, function (next) {
    if (!this.createdTime) {
      this.createdTime = this.updatedTime = moment().tz(`Asia/Jakarta`).format(`YYYY-MM-DDTHH:mm:ss`);
    } else {
      this.updatedTime = moment().tz(`Asia/Jakarta`).format(`YYYY-MM-DDTHH:mm:ss`);
    }

    next();
  });
};
