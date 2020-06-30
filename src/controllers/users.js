const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const responseHandler = require('../helpers/responsehandler');
//this handle sanitisation of req body from
const { body, validationResult, check } = require('express-validator');

exports.register = [
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

exports.login = (req, res) => {
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
      let tokenPayload = {
        userId: docs._id,
        username: docs.username,
        email: docs.email,
      };
      docs.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch) {
          let token = jwt.sign(tokenPayload, process.env.JWT_KEY, {
            expiresIn: '480h',
          });

          Object.assign(docs, { token: token });
          docs.save();

          responseHandler.loginSuccess(res, 'Login Successful!', docs);
        } else {
          return responseHandler.validationError(
            res,
            'Your Password is inCorrect',
          );
        }
      });
    } else {
      return responseHandler.validationError(
        res,
        'Your Email is not registered',
      );
    }
  }).catch((err) => {
    return responseHandler.validationError(res, 'cannot find data in databse');
  });
};

exports.removeUser = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return responseHandler.validationError(res, 'Invalid User ID');
  }
  User.findByIdAndRemove(req.params.id, function (err, doc) {
    if (err) {
      return responseHandler.errorResponse(
        res,
        'Unable to delete  User at the moment pls try again',
      );
    } else {
      return responseHandler.successResponse(
        res,
        `Acoount deleted successfully`,
      );
    }
  }).catch(() => {
    responseHandler.errorResponse(res, 'details not found');
  });
};

// exports.updateProfile = (req, res) => {
//   if (!req.body.username) {
//     return responseHandler.validationError(
//       res,
//       'Username field can not be empty',
//     );
//   } else {
//     User.find(
//       { $or: [{ email: req.body.email }, { username: req.body.username }] },
//       (err, doc) => {
//         if (err) {
//           res.status(500).send(err);
//         }
//         if (doc.length) {
//           if (doc[0].email === req.body.email) {
//             return responseHandler.validationError(
//               res,
//               'Email already choosen by another user',
//             );
//           } else if (doc[0].username === req.body.username) {
//             return responseHandler.validationError(
//               res,
//               'Username already choosen by another user',
//             );
//           } else {
//             Object.keys(req.body).forEach(function (key, index) {
//               User.findOneAndUpdate(
//                 { uuid: req.user.uuid },
//                 {
//                   [key]: req.body[key],
//                 },
//                 { new: true },
//               )
//                 .then((user) => {
//                   console.log(user);
//                   if (!user) {
//                     return responseHandler.validationError(
//                       res,
//                       `User not found with id ' ${req.body.username}`,
//                     );
//                   }
//                   user.save();
//                   res.send(user);
//                 })
//                 .catch((err) => {
//                   if (err.kind === 'ObjectId') {
//                     return responseHandler.validationError(
//                       res,
//                       'User not found with id ' + req.body.username,
//                     );
//                   }
//                   return responseHandler.errorResponse(
//                     res,
//                     'Error updating user with id ' + req.body.username,
//                   );
//                 });
//             });
//           }
//         }
//       },
//     );
//   }
// };

// if (
//   doc[0].email === req.body.email &&
//   doc[0].username === req.body.username
// ) {
//   const err = {
//     email: 'Email already choosen by another user',
//     username: 'Username already choosen by another user',
//   };
//   return responseHandler.validationErrorWithData(
//     res,
//     'Validation error',
//     err,
//   );
// } else
