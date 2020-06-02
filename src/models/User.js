const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error({ error: 'Invalid Email address' });
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

// hash the password before using the model
userSchema.pre('save', function (next) {
  const user = this;
  // do nothing if password is not modified
  if (!user.isModified('password')) return next();
  // gen salt then hash if password is modified or if it is new
  bcrypt.genSalt('SALT_WORK_FACTOR', function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.generateAuthToken = async function () {
  //generate auth token
  var user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // search for a user by email and pasword
  const user = await user.findOne({ email });
  if (!user) {
    throw new Error({ error: 'Invalid login credentials' });
  }
  const ispasswordmatch = await bcrypt.compare(password, user.password);
  if (!ispasswordmatch) {
    throw new Error({ error: 'Invalid login credentials' });
  }

  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
