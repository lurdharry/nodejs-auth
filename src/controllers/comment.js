const User = require('../models/User');
const Post = require('../models/Post');
const mongoose = require('mongoose');
const responsehandler = require('../helpers/responsehandler');

const Comment = require('../models/comment');

exports.createComment = (req, res) => {
  const newComment = new Comment({
    made_by: req.user.userId,
    content: req.body.content,
  });

  Post.findById({ _id: req.params.postId })
    .then((post) => {
      newComment.save().then((data) => {
        post.comment.push(data._id);
        post.save();
        return responsehandler.successResponseWithData(
          res,
          'Comments Added Succesfully',
          data,
        );
      });
    })
    .catch(() => {
      responsehandler.errorResponse(res, 'Invalid post Id');
    });
};

exports.deleteComment = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return responsehandler.validationError(res, 'Invalid ID');
  }
  Comment.findByIdAndRemove(req.params.id, function (err, doc) {
    if (err) {
      return responsehandler.errorResponse(
        res,
        'Unable to delete  User at the moment pls try again',
      );
    } else {
      return responsehandler.successResponse(
        res,
        ` Comment deleted successfully`,
      );
    }
  }).catch(() => {
    responsehandler.errorResponse(res, 'details not found');
  });
};
