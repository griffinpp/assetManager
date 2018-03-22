const { getErrorWithStatus } = require('../helpers.js');

// prefix asset keys in case other document types end up needing to be stored.
// records will end up clustering around their prefix in the database indexes
// speeding up access in case of bulk fetches later
const DB_PREFIX = 'asset/';

module.exports = (adapter) => {
  // these are the functions a storage adapter should implement
  const {
    getRecord,
    setRecord,
    updateRecord,
    delRecord,
  } = adapter;

  function getDbKey(key) {
    return `${DB_PREFIX}${key}`;
  }

  function stripKeyPrefix(dbKey) {
    // use substring in case the prefix happens to appear elsewhere in the uri
    return dbKey.substring(DB_PREFIX.length, dbKey.length);
  }

  // this is the actual set of functions returned once an adapter is passed into the module
  return {
    // fetch a record by its key
    getAtKey: async (key) => {
      // use getRecord to fetch the requested record
      const record = await getRecord(getDbKey(key));
      // if it exists, return it
      if (record !== null) {
        const {
          uri,
          name,
          notes,
        } = record;
        return {
          uri: stripKeyPrefix(uri),
          name,
          notes,
        };
      }
      // if not, throw an error
      throw getErrorWithStatus('Record not found', 404);
    },
    // save a new record
    setAtKey: async (key, data) => {
      // use getRecord to check for an existing record
      const existing = await getRecord(getDbKey(key));
      // if there is no existing record, use setRecord to save a new record
      if (existing === null) {
        await setRecord(getDbKey(key), data);
      } else {
        // if there is an existing record, throw an error
        throw getErrorWithStatus('Conflicting record', 409);
      }
    },
    // update an existing record - maybe this should only take a string...
    updateAtKey: async (key, data) => {
      // use getRecord to check for an existing record
      const existing = await getRecord(getDbKey(key));
      // if there is an existing record, use updateRecord to update it
      if (existing !== null) {
        await updateRecord(getDbKey(key), existing, data);
      } else {
        // if there in no existing record, throw an error
        throw getErrorWithStatus('Record not found', 404);
      }
    },
    // delete an existing record
    delAtKey: async (key) => {
      // use getRecord to check for an existing record
      const existing = await getRecord(getDbKey(key));
      // if there is an existing record, use delRecord to remove it
      if (existing !== null) {
        await delRecord(getDbKey(key), existing);
      } else {
        // if there is no existing record, throw an error (or maybe we don't care about this).
        throw getErrorWithStatus('Record not found', 404);
      }
    },
  };
};
