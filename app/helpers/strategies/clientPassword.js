/**
 * Created by faerulsalamun on 2/16/16.
 */

'use strict';

const passport = require(`passport`);
const ClientPasswordStrategy = require(`passport-oauth2-client-password`).Strategy;

// Models
const OAuthClient = require(`../../models/OAuthClient`);

passport.use(`clientPassword`, new ClientPasswordStrategy(
    (clientId, clientSecret, done) => {
      OAuthClient.findOne({ _id: clientId }, (err, clientApp) => {
        if (err) return done(err);
        if (!clientApp) return done(null, false);
        if (!clientApp.trusted) return done(null, false);

        if (clientApp.secret == clientSecret) return done(null, clientApp);
        else return done(null, false);
      });
    }
));
