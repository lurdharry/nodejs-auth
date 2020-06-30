const jwt = require('jsonwebtoken');
const User = require('../models/User');
const responseHanlder = require('../helpers/responsehandler');

const checkToken = async (req, res, next) => {
  let rawtoken =
    req.header('Authorization') || req.header('x-access-token') || null;

  if (rawtoken) {
    if (rawtoken.startsWith('Bearer ')) {
      var token = rawtoken.split(' ')[1];
      jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
          return responseHanlder.errorResponse(res, 'Token is invalid');
        } else {
          req.user = decoded;
          next();
        }
      });
    } else {
      return responseHanlder.errorResponse(res, 'Token is invalid');
    }
  } else {
    return responseHanlder.errorResponse(res, 'Token is not supplied');
  }
};
module.exports = {
  verifyToken: checkToken,
};
