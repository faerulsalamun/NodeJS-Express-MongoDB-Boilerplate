'use strict';

const _ = require(`lodash`);
const moment = require(`moment-timezone`);
const path = require(`path`);

module.exports = {

  hasProperty(objects, props) {
    let has = true;
    for (let i = 0, l = props.length; i < l; i++) {
      if (!objects.hasOwnProperty(props[i])) {
        has = false;
        break;
      }
    }

    return has;
  },

    /**
     * Reverse of hasProperty, nice to craft message of what's missing.
     * @param  object obj   Checked objects.
     * @param  array props  Array of checked object key.
     * @return string       Missing object key name.
     */
  missingProperty(obj, props) {
    for (let i = 0, l = props.length; i < l; i++) {
      if (!obj.hasOwnProperty(props[i])) return props[i];
    }

    return false;
  },

    /*
     function test() {
     var a = [
     {
     a: 'One',
     c: 1,
     },
     {
     a: 'Two',
     c: 4,
     },
     {
     a: 'Three',
     c: 3,
     }
     ]

     console.log(a);
     a.sort(utils.sort_by('c', true));
     console.log(a);
     }
     */

    // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects/979325
    // http://jsfiddle.net/gfullam/sq9U7/
  sortBy(field, reverse, primer) {
    const key = primer ? x => primer(x[field])
            : x => x[field];

    reverse = [-1, 1][+!!reverse];

    return (a, b) => {
      return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    };
  },

  zeroPad(num, numZeros) {
    const n = Math.abs(num);
    const zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
    let zeroString = Math.pow(10, zeros).toString().substr(1);
    if (num < 0) {
      zeroString = `-${zeroString}`;
    }

    return zeroString + n;
  },

  isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n > 0;
  },

  randomString(bits) {
    const chars =
            `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ab`;

    return this.getRandom(bits, chars);
  },

  randomCoupun(bits) {
    const chars =
            `ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKL`;

    return this.getRandom(bits, chars);
  },

  getRandom(bits, chars) {
    let rand;
    let i;
    let randomizedString = ``;

        // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey
        // it gives 53)
    while (bits > 0) {
            // 32-bit integer
      rand = Math.floor(Math.random() * 0x100000000);

            // base 64 means 6 bits per character, so we use the top 30 bits from rand
            // to give 30/6=5 characters.
      for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) {
        randomizedString += chars[0x3F & rand >>> i];
      }
    }

    return randomizedString;
  },

  uuid(len, radix) {
    const CHARS = `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`.split(``);

    const chars = CHARS;
    const uuid = [];
    let i;

    radix = radix || chars.length;

    if (len) {
            // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
            // rfc4122, version 4 form
      let r;

            // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = `-`;
      uuid[14] = `4`;

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join(``);
  },

  uid(len) {
    const buf = [];
    const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;
    const charlen = chars.length;

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    for (let i = 0; i < len; ++i) {
      buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join(``);
  },

  getRandomNumbers(length) {
    const arr = [];
    while (arr.length < length) {
      const randomnumber = Math.ceil(Math.random() * length - 1);
      let found = false;
      for (let i = 0, l = arr.length; i < l; i++) {
        if (arr[i] == randomnumber) {
          found = true;
          break;
        }
      }

      if (!found)arr[arr.length] = randomnumber;
    }

    return arr;
  },

  stringifyWithOrder(json, order) {
    const keys = Object.keys(json);
    const orderKeys = [];
    for (let i = 0, l = order.length; i < l; i++) {
      orderKeys.push(keys[order[i]]);
    }

    return JSON.stringify(json, orderKeys);
  },

  showErrorValidationMongo(err) {
    for (const field in err.errors) {
      return err.errors[field];
    }
  },

  isValidObjectID(str) {
    str = `${str}`;
    const len = str.length;
    let valid = false;

    if (len == 12 || len == 24) {
      valid = /^[0-9a-fA-F]+$/.test(str);
    }

    return valid;
  },

  checkErrorCode(errorData) {
    if (typeof errorData.properties === `undefined`) {
      return 500;
    } else if (typeof errorData.properties.http !== `undefined`) {
      return errorData.properties.http;
    } else if (errorData.properties.type === `required`) {
      return 400;
    } else if (errorData.properties.path === `email`) {
      return 409;
    } else {
      return 400;
    }
  },

  checkNullValue(value) {
    return !!(typeof value !== `undefined` && value !== null && value !== ``);
  },

  getTimeNow() {
    return moment().tz(`Asia/Jakarta`).format(`YYYY-MM-DDTHH:mm:ss`);
  },

  getDifferentTime(timeStart, timeEnd) {
    return moment.duration(timeEnd.diff(timeStart)).asSeconds();
  },

  hasBody(req) {
    return `transfer-encoding` in req.headers || `content-length` in req.headers;
  },

  mime(req) {
    const str = req.headers[`content-type`] || ``;
    return str.split(`;`)[0];
  },

  checkImageExtension(file, ext) {
    const extensions = [`.jpg`, `.jpeg`, `.png`, `.gif`, `jpg`, `jpeg`, `png`, `gif`];
    const extension = (!this.checkNullValue(ext)) ? path.extname(file).toLowerCase() : file;

    if (_.indexOf(extensions, extension) == -1) return false;
    else return true;
  },
};
