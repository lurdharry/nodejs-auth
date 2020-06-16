const express = require('express');
const userController = require('../controllers/users');
const middleware = require('../middleware/verify');

const router = express.Router();

router.post('/users/register', userController.register);

router.post('/users/login', userController.login);

router.delete('/user/:id', middleware.verifyToken, userController.deleteUser);

router.post(
  '/users/update',
  middleware.verifyToken,
  userController.updateDetails,
);

module.exports = router;
