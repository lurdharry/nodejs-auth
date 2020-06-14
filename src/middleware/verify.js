const jwt = require('jsonwebtoken');
const User = require('../models/User');
const responseHanlder = require('../helpers/responsehandler');

// const checkToken = (req, res, next) => {
//   // let token = req.headers['x-access-token'];
//   const token = req.header('Authorization').split(' ')[1];

//   if (!token) {
//     return res.status(403).send({ message: 'No token provided!' });
//   }

//   jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: 'Unauthorized!' });
//     }
//     req.decoded = decoded;
//     next();
//   });
// };

const checkToken = async (req, res, next) => {
  let rawtoken =
    req.header('Authorization') || req.header('x-access-token') || null;
  //check if there is token
  if (rawtoken) {
    // trim token
    if (rawtoken.startsWith('Bearer ')) {
      var token = rawtoken.split(' ')[1];
      User.find({ token: token }, function (err, doc) {
        if (doc) {
          if (doc[0].token === token) {
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
        } else {
          return responseHanlder.errorResponse(
            res,
            'You are not Authenticated',
          );
        }
      });
    }
    //if token doesnot start with bearer
    else {
      return responseHanlder.errorResponse(res, 'Token is invalid');
    }
  }
  //if there is no token
  else {
    return responseHanlder.errorResponse(res, 'Token is invalid');
  }
};
module.exports = {
  verifyToken: checkToken,
};
