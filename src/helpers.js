const getErrorWithStatus = (msg, status = 500) => {
  const e = new Error(msg);
  e.status = status;
  return e;
};

const handleControllerError = (e, res) => {
  // log the error to the console
  console.log('STATUS', e.status);
  console.log(e.stack);
  const code = e.status || 500;
  res.status(code).json({ code, message: e.message });
};

const validateObjExists = (obj, errorMsg, errorStatus = 500) => {
  if (obj === null || obj === undefined) {
    throw getErrorWithStatus(errorMsg, errorStatus);
  }
};

module.exports = {
  validateObjExists,
  getErrorWithStatus,
  handleControllerError,
};
