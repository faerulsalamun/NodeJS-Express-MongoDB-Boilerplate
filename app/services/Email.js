'use strict';

const debug = require(`debug`)(`app`);
const config = require(`../../config/${process.env.NODE_ENV || ``}`);

const path = require(`path`);
const fs = require(`fs`);

const nodemailer = require(`nodemailer`);
const sgTransport = require(`nodemailer-sendgrid-transport`);
const htmlToText = require(`nodemailer-html-to-text`).htmlToText;

const fromEmail = `Info Cetun <no-reply@node.com>`;

const options = {
  auth: {
    api_key: config.sendGrid.apiKeyPass,
  },
};

// setup transporter
const transporter = nodemailer.createTransport(sgTransport(options));
transporter.use(`compile`, htmlToText());

// supported email templates
const emailTypes = {

  emailVerification: {
    file: `email_verification.html`,
    subject: `Your app email verification`,
    replacer(body, data) {
      const emailBody = body.replace(`{USERNAME}`, data.username).replace(`{VERIFICATIONLINK}`, data.verificationLink).replace(`{VERIFICATIONLINK}`, data.verificationLink);
      return emailBody;
    },
  },

  emailLoginWithSocialMedia: {
    file: `email_login_social_media.html`,
    subject: `Your app email your password`,
    replacer(body, data) {
      const emailBody = body.replace(`{USERNAME}`, data.username).replace(`{PASSWORD}`, data.password);
      return emailBody;
    },
  },
};

module.exports = {

  send(type, data, cb) {
        // only process supported type
    const emailTypeData = emailTypes[type];

    if (emailTypeData) {
      const filePath = `${__dirname}/emails/${emailTypeData.file}`;
      fs.readFile(filePath, (err, emailBodyMd) => {
        if (err) {
          console.error(err);
        } else {
          let emailBody = emailBodyMd.toString();
          emailBody = emailTypeData.replacer(emailBody, data);

          const mailOptions = {
            from: (typeof data.fromEmail !== `undefined`) ? data.fromEmail : fromEmail,
            to: data.email,
            subject: emailTypeData.subject,
            html: emailBody,
          };

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              debug(err);
              cb(err);
            } else {
              debug(`Email with type ${type} is sent: ${info.response}`, JSON.stringify(data));
              cb(null, info);
            }
          });
        }
      });
    } else {
      debug(`Email with type ${type} is not supported`);
    }
  },

};
