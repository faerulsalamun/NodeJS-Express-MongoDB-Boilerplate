const mongoose = require(`mongoose`);
const validate = require(`mongoose-validator`);
const validator = validate.validatorjs;
const config = require(`../../config/${process.env.NODE_ENV || ``}`);

const timestamp = require(`./plugins/Timestamp`);

const urlValidator = [
  validate({
    validator: `isURL`,
    arguments: { require_protocol: true },
    message: `URL is not valid`,
  }),
];

// Services
const Utils = require(`../services/Utils`);

const Schema = mongoose.Schema;
const OAuthClientSchema = new Schema({

  secret: {
    type: String,
    default: Utils.uid(32),
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: ``,
  },

    // possible values: ['default_read', 'default_write'] and maybe others
  scope: {
    type: [String],
    default: [`default_read`, `default_write`],
  },

    // if this app allowed to get token with resource owner password flow
  trusted: {
    type: Boolean,
    default: false,
  },

    // this is for Authorization Code Flow, aka Server-Side Flow
  redirectUri: {
    type: String,
    default: ``,

        //validate: urlValidator,
  },

  website: {
    type: String,
    default: ``,
  },

}, { collection: config.collection.name(`oauth_clients`) });

OAuthClientSchema.plugin(timestamp.useTimestamps);

module.exports = mongoose.model(`OAuthClient`, OAuthClientSchema);
