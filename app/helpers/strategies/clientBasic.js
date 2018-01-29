/**
 * Created by faerulsalamun on 2/16/16.
 */

'use strict';

const passport = require(`passport`);
const BasicStrategy = require(`passport-http`).BasicStrategy;

// Models
const OAuthClient = require(`../../models/OAuthClient`);

/**
 * This strategy is used to authenticate registered OAuth clients.
 * The authentication data must be delivered using the basic authentication scheme.
 */
passport.use(`clientBasic`, new BasicStrategy((clientId, clientSecret, done) => {
  OAuthClient.findOne({ _id: clientId }, (err, clientApp) => {
    if (err) return done(err);
    if (!clientApp) return done(null, false);
    if (!clientApp.trusted) return done(null, false);

    if (clientApp.secret == clientSecret) return done(null, clientApp);
    else return done(null, false);
  });
}));
