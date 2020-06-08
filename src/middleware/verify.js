const jwt = require('jsonwebtoken');
const User = require('../models/User');

const checkToken = async (req, res, next) => {
  console.log(req.headers);
  // get token from header
  let token =
    req.header('Authorization') || req.header('x-access-token') || null;
  //check if there is token
  if (token) {
    // trim token
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
      jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        // if verication return error
        if (err) {
          return res.status(401).send({
            message: 'Token is invalid',
          });
        }
        // if verification return succes
        else {
          req.decoded = decoded;
          next();
        }
      });
    }
    //if token doesnot start with bearer
    else {
      return res.status(401).send({
        message: 'Token is invalid',
      });
    }
  }
  //if there is no token
  else {
    return res.status(400).send({
      message: 'Token is invalid',
    });
  }
};
module.exports = {
  verifyToken: checkToken,
};
