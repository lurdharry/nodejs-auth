const express = require('express');
const mongoose = require('mongoose');
const UserRouter = require('./routes/userRoutes');
const PostRouter = require('./routes/postRoutes');
const CommentRouter = require('./routes/comment');

// env conection data from .env file
const Mongoconnect = process.env.DB_CONNECT;
const port = process.env.PORT;
// mongo extra
const extra = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

// mongo cluster initialization
mongoose
  .connect(Mongoconnect, extra)
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((err) => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });

const app = express();
// to convert response to json format
app.use(express.json());

//links   routes  to server
app.use(UserRouter);
app.use(PostRouter);
app.use(CommentRouter);

// to check if the server is  running
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
