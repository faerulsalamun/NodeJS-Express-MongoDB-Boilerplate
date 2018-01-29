/**
 * Created by faerulsalamun on 2/16/16.
 */

'use strict';

const mongoose = require(`mongoose`);
const crypto = require(`crypto`);
const moment = require(`moment`);
const _ = require(`lodash`);
const config = require(`../../config/${process.env.NODE_ENV || ``}`);

const timestamp = require(`./plugins/Timestamp`);

const Schema = mongoose.Schema;
const OAuthAccessTokenSchema = new Schema({

  tokenHash: {
    type: String,
    required: true,
  },

    // default 6 months from now
  expirationDate: {
    type: Date,
    default: moment().add(1, `years`).toDate(),
  },

  client: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: `OAuthClient`,
  },

  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: `User`,
  },

  scope: {
    type: String,
  },

}, { collection: config.collection.name(`oauth_access_tokens`) });

OAuthAccessTokenSchema.virtual(`token`)
    .get(function () {
      return this._token;
    })
    .set(function (value) {
      this._token = value;
      this.tokenHash = crypto.createHash(`sha1`).update(this._token).digest(`hex`);
    });

OAuthAccessTokenSchema.methods.updateExpirationDate = function () {
  this.expirationDate = moment().add(1, `years`).toDate();
  return;
};

OAuthAccessTokenSchema.plugin(timestamp.useTimestamps);

module.exports = mongoose.model(`OAuthAccessToken`, OAuthAccessTokenSchema);
