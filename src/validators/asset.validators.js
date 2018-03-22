const { validateObjExists } = require('../helpers');

// as these are just convenience wrappers for validateObjExists, no unit tests are written for them

const validateUriExists = (uri) => {
  validateObjExists(uri, 'uri query parameter is required', 400);
};

const validateNameExists = (name) => {
  validateObjExists(name, 'name property is required', 400);
};

const validateNotesExists = (notes) => {
  validateObjExists(notes, 'notes property is required', 400);
};

module.exports = {
  validateUriExists,
  validateNameExists,
  validateNotesExists,
};
