'use strict';

// node modules
const path = require(`path`);
const debug = require(`debug`)(`app`);

const moment = require(`moment-timezone`);
const express = require(`express`);
const swig = require(`swig`);
const logger = require(`morgan`);
const cookieParser = require(`cookie-parser`);
const bodyParser = require(`body-parser`);
const session = require(`express-session`);
const passport = require(`passport`);
const flash = require(`connect-flash`);
const i18n = require(`i18n`);
const RedisStore = require(`connect-redis`)(session);
const cors = require(`cors`);
const config = require(`./config/${process.env.NODE_ENV || ``}`);
const schedule = require(`node-schedule`);
const request = require(`request`);

// Passport Config
require(`./app/helpers/passport`);

// Reload database
require(`./app/helpers/database`);

// i18n
i18n.configure({
  locales: [`en_US`, `id`],
  directory: `${__dirname}/app/locales`,
  cookie: config.cookie.secret,
  defaultLocale: `en_US`,
});

// express setup
const app = express();

// view engine setup
swig.setDefaults(config.swig);
app.engine(`swig`, swig.renderFile);
app.set(`views`, `${__dirname}/app/views`);
app.set(`view engine`, `swig`);
app.use(cors());
app.disable(`x-powered-by`);
if (process.env.NODE_ENV === `development`) {
  app.use(logger(`dev`));
}
app.use(bodyParser.json({ limit: `20mb` }));
app.use(bodyParser.urlencoded({ extended: false, limit: `20mb` }));
app.use(cookieParser());

// initialize
app.use(session({
  name: `node.sess`,
  resave: false,
  saveUninitialized: false,
  secret: config.cookie.secret,
  autoReconnect: true,
  maxAge: new Date(Date.now() + 3600000),
  store: new RedisStore(config.redis.config),
}));

app.use(express.static(`${__dirname}/assets`));
app.use(express.static(`${__dirname}/bower_components`));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(i18n.init);

// routes
require(`./app/routes`)(app);

const port = config.port;
const server = app.listen(port, () => {
  console.log(`NodeApp server listening on port ${port} with env ${process.env.NODE_ENV}`);
  debug(`NodeApp server listening on port ${port} with env ${process.env.NODE_ENV}`);
});

// ups
process.on(`uncaughtException`, (err) => {
  debug(`uncaughtException`, err.stack);
  process.exit();
});

module.exports = app;
