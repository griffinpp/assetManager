const PouchDB = require('pouchdb');

const connectionString = 'http://localhost:5984/assets';
const db = new PouchDB(connectionString);

async function getRecord(key) {
  try {
    const record = await db.get(key);
    const {
      name,
      notes,
    } = record;
    return {
      uri: key,
      name,
      notes,
    };
  } catch (e) {
    // if the db returned a 404, it means the record doesn't exist, return null (as this is
    // the convention the data service expects)
    if (e.status === 404) {
      return null;
    }
    // any other error, bubble out
    throw e;
  }
}

async function setRecord(key, { name, notes }) {
  // build the object we want to save
  const record = {
    _id: key,
    name,
    notes,
  };
  // save it to the db
  await db.put(record);
}

async function updateRecord(key, existingRecord, { name, notes }) {
  const eName = existingRecord.name;
  const eNotes = existingRecord.notes;
  const clone = {
    _id: key,
    // eslint-disable-next-line no-underscore-dangle
    _rev: existingRecord._rev,
    // if no new name was passed, use the existing name
    name: name === undefined ? eName : name,
    // if no new notes were passed, use the existing notes
    notes: notes === undefined ? eNotes : notes,
  };
  // save the updates
  await db.put(clone);
}

// eslint-disable-next-line object-curly-newline
async function delRecord(key, { _id, _rev, name, notes }) {
  // since a delete in couch is just an update that sets the
  // _deleted flag, that is all we are doing here
  const clone = {
    _id,
    _rev,
    name,
    notes,
    _deleted: true,
  };
  await db.put(clone);
}

module.exports = {
  getRecord,
  setRecord,
  updateRecord,
  delRecord,
};
