'use strict';

const express = require(`express`);
const router = express.Router();
const passport = require(`passport`);
const auth = require(`../middlewares/authenticated`);

// Controller
const OAuthController = require(`../controllers/OAuthController`);
const NotificationController = require(`../controllers/NotificationController`);

router.get(`/`, (req, res, next) => {
  res.ok(`Your API Development :)`);
});

// Create Client
router.post(`/oauth/client`, OAuthController.createClientApi);

// FCM
router.post(`/fcm/test`, NotificationController.createDataApi);

// Login || Oauth2
router.post(`/signin`, OAuthController.getTokenDirectPassword);
router.post(`/refreshToken`, OAuthController.getTokenDirectPassword);

module.exports = router;
