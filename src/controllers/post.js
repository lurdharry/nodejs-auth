const User = require('../models/User');
const responsehandler = require('../helpers/responsehandler');
const uuid = require('uuid');
const Post = require('../models/Post');

exports.createPost = (req, res) => {
  User.findOne({ email: req.user.email }, (err, user) => {
    if (err) {
      return responsehandler.validationError(res, 'User not registered');
    } else {
      const post = new Post({
        id: uuid.v4(),
        author: user._id,
        content: req.body.content,
      });
      post
        .save()
        .then((data) => {
          return responsehandler.successResponseWithData(
            res,
            'Post Created Succesfully',
            data,
          );
        })
        .catch((err) => {
          responsehandler.errorResponse(
            res,
            'Some error occurred while saving the User.',
          );
        });
    }
  });
};

exports.deletePost = (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return responsehandler.validationError(res, 'Invalid ID');
  }
  Post.findByIdAndDelete(id, function (err, doc) {
    if (err) {
      return responsehandler.errorResponse(res, 'Unable to delete Post');
    } else {
      return responsehandler.successResponse(res, 'Post deleted successfully');
    }
  });
};
