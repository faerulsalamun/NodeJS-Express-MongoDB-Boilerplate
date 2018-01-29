/**
 * Created by faerulsalamun on 2/16/16.
 */

'use strict';

const mongoose = require(`mongoose`);
const validate = require(`mongoose-validator`);
const validator = validate.validatorjs;
const uniqueValidator = require(`mongoose-unique-validator`);
const bcrypt = require(`bcryptjs`);
const config = require(`../../config/${process.env.NODE_ENV || ``}`);

const timestamp = require(`./plugins/Timestamp`);

const emailValidator = [
  validate({
    validator: `isEmail`,
    message: `Email is not in valid format`,
    http: 400,
  }),
];

const Schema = mongoose.Schema;
const UserSchema = new Schema({

  id: false,

  email: {
    type: String,
    required: true,
    unique: true,
    validate: emailValidator,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },


  passwordHash: {
    type: String,
    required: [true, `Path \`password\` is required.`],
  },

  state: {
    type: String,
    default: `init`,
    enum: [`init`, `verified`, `removed`, `banned`],
  },

    // possible values: ['user','sales']
  role: {
    type: [String],
    default: [`user`],
  },

}, {
  collection: config.collection.name(`users`),
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

UserSchema.plugin(timestamp.useTimestamps);
UserSchema.plugin(uniqueValidator, { message: `{PATH} already exist.` });

// Password validation
UserSchema.virtual(`password`)
    .get(function () {
      return this._password;
    })
    .set(function (value) {
      this._password = value;

      if (typeof value !== `undefined`) {
        this.passwordHash = bcrypt.hashSync(this._password, 10);
      }
    });

UserSchema.virtual(`passwordConfirmation`)
    .get(function () {
      return this._passwordConfirmation;
    })
    .set(function (value) {
      this._passwordConfirmation = value;
    });

UserSchema.path(`passwordHash`).validate(function (v) {
  if (this._password || this._passwordConfirmation) {
    if (!validator.isLength(this._password, 6)) {
      this.invalidate(`password`,
                `Password minimum length is 6 character`);
    }

    if (this._password !== this._passwordConfirmation) {
      this.invalidate(`passwordConfirmation`, `Password confirmation must match.`);
    }
  }

  if (this.isNew && !this._password) {
    this.invalidate(`password`, `Password is required.`);
  }
}, null);

// Full image profilePicture
UserSchema
    .virtual(`fullPathUserImage`)
    .get(function () {
      return typeof this.userImage !== `undefined` ? config.configServer.urlImage + this.userImage : this.userImage;
    });

UserSchema.methods.passwordMatches = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.passwordHash, (err, isMatch) => {
    if (err) return cb(err);
    return cb(null, isMatch);
  });
};

UserSchema.method(`toJSON`, function () {
  const user = this.toObject();

  delete user.password;
  delete user.passwordConfirmation;
  delete user.passwordHash;
  delete user.id;

  return user;
});

module.exports = mongoose.model(`User`, UserSchema);
