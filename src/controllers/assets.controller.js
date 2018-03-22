const { handleControllerError } = require('../helpers');
const {
  validateUriExists,
  validateNameExists,
  validateNotesExists,
} = require('../validators/asset.validators');
// get the adapter - this one saves data in memory
const adapter = require('../data/adapters/memory.adapter');

// after configuring the connection string in the couch.adapter,
// comment out the above adapter and uncomment the below adapter to connect to a couchDB instance
// const adapter = require('../data/adapters/couch.adapter');

// load the adapter into the service. Now calls to the data service will use the adapter.
const service = require('../data/data.service')(adapter);

/*
In general, I consider controller functions to be the point of behavior assembly. Basic
operations (validation, data access, etc) are defined in small functions in other layers
and then the more complex behavior that is needed for the endpoint is assembled here with
calls to those simpler functions. The behavior needed here is quite simple, so not many
calls are made, but the idea is that very little other than calls to other functions should
occur in these functions.

This is also why I do not generally write unit tests for controller functions, but they
can be an excellent point to target for end-to-end (or nearly so)
tests, as 90% of an endpoint's functionality is generally encompassed here.
*/

// fetch an asset from the data store
async function getAsset(req, res) {
  try {
    // This basic behavior pattern is used for all 4 endpoints:
    // input validation
    validateUriExists(req.query.uri);
    // data access
    const result = await service.getAtKey(encodeURIComponent(req.query.uri));
    // response
    res.status(200).json(result);
  } catch (e) {
    // error handling
    handleControllerError(e, res);
  }
}

// save a new asset to the data store
async function postAsset(req, res) {
  try {
    validateUriExists(req.query.uri);
    validateNameExists(req.body.name);
    await service.setAtKey(encodeURIComponent(req.query.uri), req.body);
    res.status(201).send();
  } catch (e) {
    handleControllerError(e, res);
  }
}

// update an existing asset's notes (and optionally name)
async function patchAsset(req, res) {
  try {
    validateUriExists(req.query.uri);
    validateNotesExists(req.body.notes);
    await service.updateAtKey(encodeURIComponent(req.query.uri), req.body);
    res.status(204).send();
  } catch (e) {
    handleControllerError(e, res);
  }
}

// remove an asset from the data store
async function delAsset(req, res) {
  try {
    validateUriExists(req.query.uri);
    await service.delAtKey(encodeURIComponent(req.query.uri));
    res.status(204).send();
  } catch (e) {
    handleControllerError(e, res);
  }
}

module.exports = {
  getAsset,
  postAsset,
  patchAsset,
  delAsset,
};
