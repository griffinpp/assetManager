const NodeCache = require('node-cache');

const cache = new NodeCache();

function getRecord(key) {
  const record = cache.get(key);
  if (record === undefined) {
    return null;
  }
  const {
    name,
    notes,
  } = record;
  return {
    uri: key,
    name,
    notes,
  };
}

function setRecord(key, { name, notes }) {
  const record = {
    name,
    notes,
  };
  cache.set(key, record);
}

function updateRecord(key, existingRecord, { name, notes }) {
  const eName = existingRecord.name;
  const eNotes = existingRecord.notes;
  const record = {
    name: name === undefined ? eName : name,
    notes: notes === undefined ? eNotes : notes,
  };
  cache.set(key, record);
}

// don't actually need the existing record for anything here,
// so we'll leave it out of the function definition
function delRecord(key) {
  cache.del(key);
}

module.exports = {
  getRecord,
  setRecord,
  updateRecord,
  delRecord,
};
