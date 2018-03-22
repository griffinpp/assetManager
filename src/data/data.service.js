const { getErrorWithStatus } = require('../helpers.js');

module.exports = (adapter) => {
  // these are the functions a storage adapter should implement
  const {
    getRecord,
    setRecord,
    updateRecord,
    delRecord,
  } = adapter;

  // this is the actual set of functions returned once an adapter is passed into the module
  return {
    // fetch a record by its key
    getAtKey: async (key) => {
      // use getRecord to fetch the requested record
      const record = await getRecord(key);
      // if it exists, return it
      if (record !== null) {
        return record;
      }
      // if not, throw an error
      throw getErrorWithStatus('Record not found', 404);
    },
    // save a new record
    setAtKey: async (key, data) => {
      // use getRecord to check for an existing record
      const existing = await getRecord(key);
      // if there is no existing record, use setRecord to save a new record
      if (existing === null) {
        await setRecord(key, data);
      } else {
        // if there is an existing record, throw an error
        throw getErrorWithStatus('Conflicting record', 409);
      }
    },
    // update an existing record - maybe this should only take a string...
    updateAtKey: async (key, data) => {
      // use getRecord to check for an existing record
      const existing = await getRecord(key);
      // if there is an existing record, use updateRecord to update it
      if (existing !== null) {
        await updateRecord(key, existing, data);
      } else {
        // if there in no existing record, throw an error
        throw getErrorWithStatus('Record not found', 404);
      }
    },
    // delete an existing record
    delAtKey: async (key) => {
      // use getRecord to check for an existing record
      const existing = await getRecord(key);
      // if there is an existing record, use delRecord to remove it
      if (existing !== null) {
        await delRecord(key, existing);
      } else {
        // if there is no existing record, throw an error (or maybe we don't care about this).
        throw getErrorWithStatus('Record not found', 404);
      }
    },
  };
};
