exports.loginSuccess = function (res, msg, data) {
  const resData = {
    status: 'success',
    message: msg,

    data: data,
  };
  return res.status(200).send(resData);
};

exports.successResponse = function (res, msg) {
  const data = {
    status: 'sucsess',
    message: msg,
  };
  return res.status(200).send(data);
};

exports.successResponseWithData = function (res, msg, data) {
  const resdata = {
    status: 'success',
    message: msg,
    data: data,
  };
  return res.status(200).send(resdata);
};

exports.errorResponse = function (res, msg) {
  const data = {
    status: 'error',
    message: msg,
  };
  return res.status(500).send(data);
};

exports.validationError = function (res, msg) {
  const resData = {
    status: 'error',
    message: msg,
  };
  res.status(400).send(resData);
};

exports.validationErrorWithData = function (res, msg, data) {
  var resData = {
    status: 'error',
    message: msg,
    data: data,
  };
  return res.status(400).send(resData);
};
