'use strict';

const passport = require(`passport`);

// Models
const User = require(`../models/User`);

// Strategies
require(`./strategies/accessToken`);
require(`./strategies/clientBasic`);
require(`./strategies/clientPassword`);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findOneById(id).exec((err, user) => {
    if (user) {
      delete user.password;
      done(null, user);
    } else {
      done(new Error(`Invalid login data`));
    }
  });
});
