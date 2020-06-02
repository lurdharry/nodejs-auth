const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({
      //   status: status(201),
      message: 'Account created succesfully',
      user,
      token,
    });
  } catch (error) {
    //   res.status(400).send({
    //       status:res.status(400),
    //   })
    res.status(400).send(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = User.findByCredentials(email, password);
    if (!user) {
      throw new Error({ error: 'Invalid login Credentials' });
    }
    const token = await generateAuthToken();
    res.status(201).send(user, token);
  } catch (err) {
    res.status(401).send(err);
  }
};
