
const express = require(`express`);
const router = express.Router();

const path = require(`path`);

const multipart = require(`../middlewares/multipart`);

router.get(`/`, (req, res, next) => {
  res.ok(`This is just a test`);
});

router.get(`/ok`, (req, res, next) => {
  res.ok(0, `Somebody`, 203);
});

router.get(`/error`, (req, res, next) => {
  const err = new Error(`Hey, you requested it`);
  err.status = 400;
  next(err);
});

router.get(`/headers`, (req, res, next) => {
  res.ok(req.headers);
});

router.post(`/photo`, multipart.do, (req, res, next) => {
  if (req.files) {
    req.keepFile = true;
    const key = Object.keys(req.files);
    const file = req.files[key[0]];
    const filename = path.basename(file.path);
    res.ok({
      url: `http://${req.headers.host}/photos/${filename}`,
    });
  } else {
    const err = new Error(`You no upload file`);
    err.status = 400;
    next(err);
  }
});

module.exports = router;
