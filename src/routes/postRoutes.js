const express = require('express');
const router = express.Router();

const middleware = require('../middleware/verify');
const postControler = require('../controllers/post');

router.post('/post/create', middleware.verifyToken, postControler.createPost);
router.delete(
  '/post/delete/:id',
  middleware.verifyToken,
  postControler.deletePost,
);

module.exports = router;
