const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = (req, res) => {
  let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let passwordReg = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
  );
  if (!req.body.firstname) {
    res.status(400).send({
      message: 'Firstname field cannot be empty',
    });
  }
  if (!req.body.lastname) {
    res.status(400).send({
      message: 'Lastname field cannot be empty',
    });
  } else if (!req.body.username) {
    res.status(400).send({
      message: 'Username field cannot be empty',
    });
  } else if (!req.body.password) {
    res.status(400).send({
      message: 'Password Field cannot be empty',
    });
  } else if (!passwordReg.test(req.body.password)) {
    res.status(400).send({
      message:
        'Password must be equal to or greater than 8 characters, must contain a lowercase letter at least, must contain an uppercase letter, .mustcontain a number, must contain a special character',
    });
  } else if (!req.body.email) {
    res.status(400).send({
      message: 'Email Field cannot be empty',
    });
  } else if (!emailReg.test(req.body.email)) {
    res.status(400).send({
      message: 'Email is invalid',
    });
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
          return res.status(409).send({
            status: 409,
            message: 'Email exists already',
          });
        } else if (doc[0].username === req.body.username) {
          return res.status(409).send({
            status: 409,
            message: 'Username already exist',
          });
        }
      } else {
        let token = jwt.sign({ email: req.body.email }, process.env.JWT_KEY);
        const user = new User({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          token: token,
        });
        //save user in db
        user
          .save()
          .then((data) => {
            res.status(200).send({
              status: 200,
              token: token,
              message: 'Account created succesfully',
              data: data,
            });
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message || 'Some error occurred while saving the User.',
            });
          });
      }
    },
  );
};

// Login
// Login
const login = async (req, res) => {
  let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (
    !req.body.password ||
    req.body.password < 8 ||
    !req.body.email ||
    !regg.test(req.body.email)
  ) {
    return res.status(400).send({
      message: 'Invalid Email Credentials',
    });
  }

  //find  users document
  await User.findOne({ email: req.body.email }, (err, docs) => {
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
          res.status(200).send({
            success: true,
            message: 'Login successful!',
            token: token,
            data: docs,
          });
        } else {
          return res.status(400).send({
            message: 'Invalid Credentials',
          });
        }
      });
    } else {
      return res.status(400).send({
        message: 'Invalid Credentials',
      });
    }
  });
};

module.exports = {
  register: register,
  login: login,
};
