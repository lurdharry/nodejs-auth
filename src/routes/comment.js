const express = require('express');
const commentController = require('../controllers/comment');
const middleware = require('../middleware/verify');

const router = express.Router();

router.post(
  '/:postId/comment',
  middleware.verifyToken,
  commentController.createComment,
);
router.delete(
  '/comment/:id',
  middleware.verifyToken,
  commentController.deleteComment,
);
module.exports = router;
