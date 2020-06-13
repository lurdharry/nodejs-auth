const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const responseHandler = require('../helpers/responsehandler');

/**
 * User registration.
 *
 * @param {String}    firstName
 * @param {String}    lastName
 * @param {String}    email
 * @param {String}    password
 * @param {String}    username
 *
 * @returns {Object}
 */
const register = (req, res) => {
  let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let passwordReg = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
  );
  if (!req.body.firstname) {
    return responseHandler.validationError(
      res,
      'Firstname field cannot be empty',
    );
  }
  if (!req.body.lastname) {
    return responseHandler.validationError(
      res,
      'Lastname field cannot be empty',
    );
  } else if (!req.body.username) {
    return responseHandler.validationError(
      res,
      'Username field cannot be empty',
    );
  } else if (!req.body.password) {
    return responseHandler.validationError(
      res,
      'Password Field cannot be empty',
    );
  } else if (!passwordReg.test(req.body.password)) {
    return responseHandler.validationError(
      res,
      'Password must be equal to or greater than 8 characters, must contain a lowercase letter at least, must contain an uppercase letter, .mustcontain a number, must contain a special character',
    );
  } else if (!req.body.email) {
    return responseHandler.validationError(res, 'Email Field cannot be empty');
  } else if (!emailReg.test(req.body.email)) {
    return responseHandler.validationError(res, 'Email is invalid');
  }
  User.find(
    // check for two conditions before creating new user data
    { $or: [{ email: req.body.email }, { username: req.body.username }] },
    (err, doc) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (doc.length) {
        if (doc[0].email === req.body.email) {
          return responseHandler.validationError(res, 'Email exists already');
        } else if (doc[0].username === req.body.username) {
          return responseHandler.validationError(res, 'Username already exist');
        }
      } else {
        let token = jwt.sign({ email: req.body.email }, process.env.JWT_KEY);
        const user = new User({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
        });
        //save user in db
        user
          .save()
          .then((data) => {
            responseHandler.loginSuccess(
              res,
              'Account created succesfully',
              token,
              data,
            );
          })
          .catch((err) => {
            responseHandler.errorResponse(
              res,
              err.message || 'Some error occurred while saving the User.',
            );
          });
      }
    },
  );
};

const login = (req, res) => {
  let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!req.body.email || !regg.test(req.body.email)) {
    return responseHandler.validationError(res, 'Invalid Email Credentials');
  }
  if (!req.body.password || req.body.password < 8) {
    return responseHandler.validationError(
      res,
      'Your Password must more more than eight',
    );
  }

  //find  users document
  User.findOne({ email: req.body.email }, (err, docs) => {
    if (docs) {
      docs.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch) {
          let token = jwt.sign(
            {
              userId: docs._id.toString(),
              email: req.body.email,
            },
            process.env.JWT_KEY,
            {
              expiresIn: '480h', // expiry time
            },
          );
          // return the JWT token for the future API calls
          responseHandler.loginSuccess(res, 'Login Successful!', token, docs);
        } else {
          return responseHandler.validationError(
            res,
            'Your Paasword is inCorrect',
          );
        }
      });
    } else {
      return responseHandler.validationError(
        res,
        'Your Email is not registered',
      );
    }
  });
};

const removeUser = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return responseHandler.validationError(res, 'Invalid User ID');
  }
  User.findById(req.params.id, function (err, user) {
    if (!user) {
      return responseHandler.errorResponse(res, 'User details not found');
    } else {
      if (user._id.toString() !== req.params.id) {
        return responseHandler.errorResponse(res, 'User id is not correct');
      } else {
        User.findByIdAndRemove(req.params.id, function (err, doc) {
          if (err) {
            return responseHandler.errorResponse(
              res,
              'Unable to delete  User at the moment pls try again',
            );
          } else {
            return responseHandler.successResponse(
              res,
              `${doc.username} acoount deleted successfully`,
            );
          }
        });
      }
    }
  });
};

const updateProfile = (req, res) => {
  if (
    req.body.email ||
    req.body.firstname ||
    req.body.lastname ||
    req.body.username
  ) {
    return res.status(403).send({
      message: 'UnAuthorised user',
    });
  } else if (!req.body.username) {
    return responseHandler.validationError(
      res,
      'Username field can not be empty',
    );
  } else {
    Object.keys(req.body).forEach(function (key, index) {
      User.findOneAndUpdate(
        { username: req.body.username },
        {
          [key]: req.body[key],
        },
        { new: true },
      )
        .then((user) => {
          if (!user) {
            return responseHandler.validationError(
              res,
              `User not found with id ' ${req.body.username}`,
            );
          }
          user.save();
          res.send(user);
        })
        .catch((err) => {
          if (err.kind === 'ObjectId') {
            return responseHandler.validationError(
              res,
              'User not found with id ' + req.body.username,
            );
          }
          return responseHandler.errorResponse(
            res,
            'Error updating user with id ' + req.body.username,
          );
        });
    });
  }
};

module.exports = {
  register: register,
  login: login,
  updateDetails: updateProfile,
  deleteUser: removeUser,
};
