'use strict';

const _ = require('lodash');
const path = require('path');

module.exports = _.merge(require('./'), {

    // Config Server
    configServer: {
        appName: 'Node App',
        port: process.env.PORT ? process.env.PORT : 8080,
        host: 'http://localhost',
        get urlWeb() {
            return process.env.PORT ? `${this.host}:${this.port}` : `${this.host}`;
        },

        get urlWebApi() {
            return this.urlWeb + '/api/v1';
        },

        get urlImage() {
            return this.host + ':' + this.port + '/upload';
        },
    },

    // database
    mongodb: {
        host: 'localhost',
        port: '27017',
        dbname: 'go-loan',
        username: '',
        password: '',
        get connectionUri() {
            return `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.dbname}`;
        },
    },

    // redis
    redis: {
        config: {},
    },

    // mongodb name collection
    collection: {
        prefix: 'go_loan',
        name: function (collectionName) {
            return this.prefix + '_' + collectionName;
        },
    },

    // dir
    appDir: path.join(__dirname, '..'),
    uploadDir: path.join(__dirname, '..', '/assets/upload'),

    // locale
    i18n: {
        defaultLocale: 'en_US',
    },

    // most likely should change this
    logDir: '/var/log/app',

    // swig
    swig: {
        cache: 'memory',
    },

    // nodemailer
    emailer: {
        service: 'emailService',
        user: 'username',
        pass: 'password',
    },

    sendGrid: {
        apiKeyId: 'your_id',
        apiKeyPass: 'your_pass',
    },

    fcm: {
        key: 'your_key',
    },

    cookie: {
        secret: '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',
    },
});
