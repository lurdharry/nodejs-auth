const express = require('express');
const mongoose = require('mongoose');
const UserRouter = require('./routes/userRoutes');

// env data
const Mongoconnect = process.env.DB_CONNECT;
const port = process.env.PORT;
// mongo extra
const extra = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

// mongo server
mongoose.connect(Mongoconnect, extra, () =>
  console.log('connected to data base'),
);

const app = express();
// app.use(db);
app.use(express.json());
app.use(UserRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
