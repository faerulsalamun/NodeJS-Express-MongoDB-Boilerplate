/**
 * Created by faerulsalamun on 2/16/16.
 */

'use strict';

const oauth2orize = require(`oauth2orize`);
const passport = require(`passport`);
const debug = require(`debug`)(`app`);
const Promise = require(`bluebird`);
const bcrypt = Promise.promisifyAll(require(`bcryptjs`));
const _ = require(`lodash`);
const i18n = require(`i18n`);
const crypto = require(`crypto`);

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Services
const Async = require(`../services/Async`);
const Utils = require(`../services/Utils`);

// Models
const OAuthAccessToken = require(`../models/OAuthAccessToken`);
const OAuthRefreshToken = require(`../models/OAuthRefreshToken`);
const OAuthClient = require(`../models/OAuthClient`);
const User = require(`../models/User`);

function wrapExchange(genFunction) {
  const coroutine = Promise.coroutine(genFunction);

  return (client, username, password, scope, req, done) => {
    return coroutine(client, username, password, scope, req, done).catch(done);
  };
}

const serverExchange = wrapExchange(function* (client, username, password, scope, req, done) {
  const user = yield User.findOne({ username });

    // Check Username
  if (_.isEmpty(user)) {
    const err = new Error(i18n.__(`INCORRECT_USERNAME_OR_PASSWORD`));
    err.status = 401;
    return done(err);
  }

    // Check Password
  const userPassword = _.isEmpty(user.passwordHash) ? `` : user.passwordHash;

  if (!_.isEmpty(password)) {
    const isValid = yield bcrypt.compareAsync(password, userPassword);

    if (!isValid) {
      const err = new Error(i18n.__(`INCORRECT_USERNAME_OR_PASSWORD`));
      err.status = 401;
      return done(err);
    }
  }

    // Check access token
  const accessToken = yield OAuthAccessToken.findOne({ user: user._id, client: client._id });

    // if access token exists
  if (accessToken) {
        // Check refresh token
    const refreshToken = yield OAuthRefreshToken.findOne({ user: user._id, client: client._id });

    accessToken.token = Utils.uid(128);
    accessToken.updateExpirationDate();
    accessToken.scope = scope ? scope : ``;

    refreshToken.token = Utils.uid(128);

    const saveAccessToken = yield accessToken.save();
    const saveRefreshToken = yield refreshToken.save();

    done(null, saveAccessToken.token, saveRefreshToken.token, {
      expires_in: saveAccessToken.expirationDate,
    });
  } else {
    const accessToken = new OAuthAccessToken({
      token: Utils.uid(128),
      client: client._id,
      user: user._id,
      scope: scope ? scope : ``,
    });

    const refreshToken = new OAuthRefreshToken({
      token: Utils.uid(128),
      client: client._id,
      user: user._id,
    });

    const saveAccessToken = yield accessToken.save();
    const saveRefreshToken = yield refreshToken.save();

    done(null, saveAccessToken.token, saveRefreshToken.token, {
      expires_in: saveAccessToken.expirationDate,
    });
  }
});

// Resource owner password
server.exchange(oauth2orize.exchange.password(serverExchange));

// Refresh Token
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  const refreshTokenHash = crypto.createHash(`sha1`).update(refreshToken).digest(`hex`);

  OAuthRefreshToken.findOne({ tokenHash: refreshTokenHash }, (err, token) => {
    if (err) return done(err);
    if (!token) return done(null, false);
    if (client._id.toString() != token.client.toString()) return done(null, false);

    OAuthAccessToken.findOne({ user: token.user }, (err, accessToken) => {
      if (err) return done(err);
      if (!accessToken) return done(null, false);
      if (client._id.toString() != accessToken.client.toString()) return done(null, false);

            // Refresh Access Token
      accessToken.token = Utils.uid(128);
      accessToken.updateExpirationDate();
      accessToken.scope = scope ? scope : ``;

            // Refresh Token
      token.token = Utils.uid(128);
      token.updateExpirationDate();
      token.scope = scope ? scope : ``;

      token.save((err, resultRefreshToken) => {
        if (err) return done(err);

        accessToken.save((err) => {
          if (err) return done(err);

          done(null, accessToken.token, resultRefreshToken.token, { expires_in: accessToken.expirationDate });
        });
      });
    });
  });
}));

module.exports = {

  token: [
    passport.authenticate([`clientBasic`], { session: false }),
    server.token(),

        // server.errorHandler(),
  ],

  bearer: [
    passport.authenticate(`accessToken`, { session: false }),
  ],

  getTokenDirectPassword: [
    passport.authenticate(`clientPassword`, { session: false }),
    server.token(),

        // server.errorHandler(),
  ],

  createClientApi: Async.route(function* (req, res, next) {
    const clientData = {
      name: req.body.name,
      description: req.body.description,
      trusted: true,
      user: req.body.user,
      secret: Utils.uid(32),
    };

    const client = yield OAuthClient.create(clientData);

    res.ok(client, `Data Client Add`, 201);
  }),

};

