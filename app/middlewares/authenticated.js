'use strict';

const passport = require(`passport`);
const _ = require(`lodash`);

exports.isAuthenticated = (role) => {
  return (req, res, next) => {
        // if (!req.isAuthenticated()) {
        //    req.session.returnTo = req.url;
        //    res.redirect('/signin');
        //    return;
        // }

    if (role && _.intersection(role, req.user.role).length === 0) {
      const err = new Error(`Forbidden`);
      err.status = 403;
      return next(err);
    }

    next();
  };
};

exports.isAuthenticatedApi = () => {
  return (req, res, next) => {
    passport.authenticate([`accessToken`], { session: false }, (err, user) => {
      if (err) return next(err);

      if (!user) return res.ok(null, `Unauthorized`, 401);

      req.user = user;

      return next();
    })(req, res, next);
  };
};

exports.isAuthenticatedApiBasic = () => {
  return (req, res, next) => {
    passport.authenticate([`clientBasic`], { session: false }, (err, user) => {
      if (err) return next(err);

      if (!user) return res.ok(null, `Unauthorized`, 401);

      req.user = user;

      return next();
    })(req, res, next);
  };
};

exports.isAuthenticatedMulti = () => {
  return (req, res, next) => {
    passport.authenticate([`clientBasic`, `accessToken`], { session: false }, (err, user) => {
      if (err) return next(err);

      if (!user) return res.ok(null, `Unauthorized`, 401);

      req.user = user;

      return next();
    })(req, res, next);
  };
};
