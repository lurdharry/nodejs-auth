const mongoose = require('mongoose');
const CommentSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    made_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

CommentSchema.pre('remove', function (next) {
  this.model('Posts').update(
    {},
    { $pull: { comment: this._id } },
    { multi: true },
    next,
  );
});
module.exports = mongoose.model('Comments', CommentSchema);
