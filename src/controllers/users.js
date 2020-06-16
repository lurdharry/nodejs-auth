const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const responseHandler = require('../helpers/responsehandler');
//this handle sanitisation of req body from
const { body, validationResult, check } = require('express-validator');

const register = [
  // validate fields
  body('firstname')
    .isLength({ min: 1 })
    .trim()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('Firstname has non-alphanumeric characters'),
  body('lastname')
    .isLength({ min: 1 })
    .trim()
    .withMessage('lastname must be specified')
    .isAlphanumeric()
    .withMessage('lastname has non-alphanumeric characters'),
  body('email')
    .isLength({ min: 1 })
    .trim()
    .withMessage('Email field must be specified')
    .isEmail()
    .withMessage('Email must be a valid email address.'),
  body('username')
    .isLength({ min: 1 })
    .trim()
    .withMessage('username must be specified')
    .isAlphanumeric()
    .withMessage('username has non-alphanumeric characters'),
  body('password')
    .exists()
    .withMessage('Password should not be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be minimum of eight character')
    .matches(
      RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'),
    )
    .withMessage(
      'Password must contain a lowercase letter at least, must contain an uppercase letter, must contain a number, must contain a special character',
    ),

  //santize field
  check('firstname').escape(),
  check('lastname').escape(),
  check('email').escape(),
  check('password').escape(),
  check('username').escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHandler.validationErrorWithData(
          res,
          'Validation error',
          errors.array(),
        );
      } else {
        await User.find(
          // check for two conditions before creating new user data
          { $or: [{ email: req.body.email }, { username: req.body.username }] },
          (err, doc) => {
            if (err) {
              return res.status(500).json(err);
            }
            if (doc.length) {
              if (doc[0].email === req.body.email) {
                return responseHandler.validationError(
                  res,
                  'Email exists already',
                );
              } else if (doc[0].username === req.body.username) {
                return responseHandler.validationError(
                  res,
                  'Username already exist',
                );
              }
            } else {
              let token = jwt.sign(
                { email: req.body.email },
                process.env.JWT_KEY,
              );
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
                  responseHandler.successResponse(
                    res,
                    'Account created succesfully',
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
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

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
          Object.assign(docs, { token: token });

          docs.save();
          // return the JWT token for the future API calls
          responseHandler.loginSuccess(res, 'Login Successful!', docs);
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
  if (!req.body.username) {
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
