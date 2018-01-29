/**
 * Created by faerulsalamun on 2/18/16.
 */

'use strict';

const Promise = require(`bluebird`);
const fs = Promise.promisifyAll(require(`fs-extra`));
const path = require(`path`);
const config = require(`../../config/${process.env.NODE_ENV || ``}`);
const _ = require(`lodash`);
const formidable = require(`formidable`);
const i18n = require(`i18n`);
const request = require(`request`);
const mime = require(`mime`);

// Services
const Async = require(`../services/Async`);
const Utils = require(`../services/Utils`);

module.exports = {

  base64: Async.make(function* (prefix, dir, base64string) {
    const trimmed = base64string.trim();
    const validationRe = /^data\:image\/(png|jpeg|gif);base64,/;

    if (!validationRe.test(trimmed)) {
      throw error(`Not a valid image type`, 400);
    }

    const patternMatchingResult = trimmed.match(validationRe);
    if (!patternMatchingResult) { // less likely to occur
      throw error(`Not a valid image type`, 400);
    }

    const ext = patternMatchingResult[1] === `jpeg` ? `jpg` : patternMatchingResult[1];
    const newFilename = `${prefix}_${Utils.uid(32)}_${Date.now()}.${ext}`;
    const newBase64String = trimmed.replace(validationRe, ``);
    const newPath = path.join(config.uploadDir, dir, newFilename);

    const dirImage = yield fs.existsSync(path.join(config.uploadDir, dir));

    if (!dirImage) {
      yield fs.mkdir(path.join(config.uploadDir, dir));
    }

    yield fs.writeFileAsync(newPath, newBase64String, `base64`).catch(console.error);

    try {
      const stats = yield fs.statAsync(newPath);
    } catch (ex) {
      console.error(ex);
      return false;
    }

    return `/${dir}/${newFilename}`;
  }),

  multipart: (req, res, next, callback) => {
    if (!fs.existsSync(path.join(config.uploadDir, req.params.path))) { fs.mkdirsSync(path.join(config.uploadDir, req.params.path)); }

    const formUpload = new formidable.IncomingForm({
      keepExtensions: true,
      uploadDir: path.join(config.uploadDir, req.params.path),
      multiples: true,
      maxFieldsSize: 10 * 1024 * 1024,
    });

    const extensions = [`.jpg`, `.jpeg`, `.png`, `.gif`];

    formUpload.on(`fileBegin`, (name, file) => {
      const extension = path.extname(file.name).toLowerCase();
      if (_.indexOf(extensions, extension) == -1) {
        file.path = `/dev/null`;
        form._error(new Error(i18n.__(`EXTENSION_IMAGE_NOT_SUPPORT`)));
      }
    });

    formUpload.parse(req, (err, fields, files) => {
      if (err) return next(err);

      const dataImage = [];

      req.body = fields;
      req.files = files;

      Object.keys(req.files).forEach((key) => {
        const obj = {};
        const dirImage = typeof req.files[key] !== `undefined` ? req.files[key].path.split(`/`).pop(-1) : ``;

        obj[key] = `/${req.params.path}/${dirImage}`;
        dataImage.push(obj);
      });

      return callback(null, dataImage);
    });

    const end = res.end;

    res.end = (chunk, encoding) => {
      res.end = end;
      res.end(chunk, encoding);

            // if we want it, delete it
      if (req.removeFile && req.removeFile === true) {
        if (req.files) {
          for (const file in req.files) {
            const fileData = req.files[file];
            if (fs.existsSync(fileData.path)) { fs.unlinkSync(fileData.path); }
          }
        }
      }
    };
  },

  copyImage: (files, dir, name, callback) => {
    if (!fs.existsSync(path.join(config.uploadDir, dir))) { fs.mkdirsSync(path.join(config.uploadDir, dir)); }

    if (Utils.checkNullValue(files[name])) {
      const ext = files[name].name.split(/[. ]+/).pop();
      const tempPath = files[name].path;
      const newLocation = path.join(config.uploadDir, dir);
      const newFilename = `${dir}_${Utils.uid(32)}_${Date.now()}.${ext}`;

            // Copy
      fs.copy(tempPath, `${newLocation}/${newFilename}`, (err, result) => {
        callback(null, `/${dir}/${newFilename}`);
      });
    } else {
      callback(i18n.__(`IMAGE_NOT_FOUND`));
    }
  },

  copyImagePromise: Async.make(function* (files, dir, name) {
    if (!fs.existsSync(path.join(config.uploadDir, dir))) {
      fs.mkdirsSync(path.join(config.uploadDir, dir));
    }

    if (Utils.checkNullValue(files[name])) {
      const ext = files[name].name.split(/[. ]+/).pop();
      const tempPath = files[name].path;
      const newLocation = path.join(config.uploadDir, dir);
      const newFilename = `${dir}_${Utils.uid(32)}_${Date.now()}.${ext}`;

      if (!Utils.checkImageExtension(newFilename)) {
        return i18n.__(`EXTENSION_IMAGE_NOT_SUPPORT`);
      } else {
                // Copy
        yield fs.copyAsync(tempPath, `${newLocation}/${newFilename}`);

        return `/${dir}/${newFilename}`;
      }
    } else {
      return false;
    }
  }),

  deleteImage: Async.make(function* (nameImage) {
    const imageFound = yield fs.existsSync(path.join(config.uploadDir, nameImage));

    if (!imageFound) {
      return false;
    }

    yield fs.unlinkAsync(path.join(config.uploadDir, nameImage));

    return true;
  }),

  deleteImageCache: (files) => {
    if (files) {
      for (const file in files) {
        const fileData = files[file];
        if (fs.existsSync(fileData.path)) { fs.unlinkSync(fileData.path); }
      }
    }
  },

  downloadImage: Async.make(function* (url, dir) {
    return new Promise((resolve, reject) => {
      request.head(url, (err, res, body) => {
        if (err) {
          resolve(i18n.__(`EXTENSION_IMAGE_NOT_SUPPORT`));
        }

        if (!Utils.checkImageExtension(mime.extension(res.headers[`content-type`]), true)) {
          resolve(i18n.__(`EXTENSION_IMAGE_NOT_SUPPORT`));
        } else {
          const ext = mime.extension(res.headers[`content-type`]);
          const newLocation = path.join(config.uploadDir, dir);
          const newFilename = `${dir}_${Utils.uid(32)}_${Date.now()}.${ext}`;

          request(url).pipe(fs.createWriteStream(`${newLocation}/${newFilename}`)).on(`close`, () => {
            resolve(`/${dir}/${newFilename}`);
          });
        }
      });
    });
  }),
};
