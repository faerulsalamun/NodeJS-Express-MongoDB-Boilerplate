/**
 * Created by faerulsalamun on 2/17/16.
 */

'use strict';

const crypto = require(`crypto`);

const passport = require(`passport`);
const BearerStrategy = require(`passport-http-bearer`).Strategy;

// Models
const OAuthAccessToken = require(`../../models/OAuthAccessToken`);
const User = require(`../../models/User`);

/**
 * This strategy is used to authenticate users based on an access token (aka a bearer token).
 */
passport.use(`accessToken`, new BearerStrategy((accessToken, done) => {
  const accessTokenHash = crypto.createHash(`sha1`).update(accessToken).digest(`hex`);
  OAuthAccessToken.findOne({ tokenHash: accessTokenHash }, (err, token) => {
    if (err) return done(err);
    if (!token) return done(null, false);
    if (new Date() > token.expirationDate) {
      OAuthAccessToken.remove({ tokenHash: accessTokenHash }, (err) => {
        done(err);
      });
    } else {
      User.findOne({ _id: token.user }, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);

                // no use of scopes for now
        const info = { scope: `*` };
        done(null, user, info);
      });
    }
  });
}));
