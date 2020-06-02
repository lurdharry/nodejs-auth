const express = require('express');
const User = require('../models/User');
const userController = require('../controllers/users');

const router = express.Router();

router.post('/users/register', userController.register);

router.post('users/login', userController.login);

module.exports = router;
