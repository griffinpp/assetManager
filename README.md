# assetManager

## Running the server

### Install dependencies
Ensure you have LTS (8.10.x) Node.js or better installed on the machine where you intend to run assetManager. After cloning the repository,

    npm install

to install dependencies

### Starting the server
Run

    npm run start

to start the server with an in-memory data store.

### Testing

#### Unit Tests
Unit tests can be run with

    npm run test

#### Load Tests

A load test can be run by starting the server as described above, then in a separate terminal

    npm run loadTest
   
By default, the load test will attempt to make 500 `POST` requests (the most expensive) per second over 200 concurrent connections for 30 seconds. If you wish to change the requests per second or number of concurrent connections, these values are defined at the top of the `/test/load/loadTest.js` file. Alter the numbers as desired, save the file, and run the command again to see the results.

##### Example output: in-memory adapter

Example output from my local machine while using the in-memory data store:

      POST-ing 500 assets/second over 200 concurrent connections for 30 seconds. Please wait...
    {
      "totalRequests": 14577,
      "totalErrors": 0,
      "totalTimeSeconds": 30.001442498,
      "rps": 486,
      "meanLatencyMs": 1.1,
      "maxLatencyMs": 31,
      "minLatencyMs": 0,
      "percentiles": {
        "50": 1,
        "90": 1,
        "95": 1,
        "99": 2
      },
      "errorCodes": {}
    }
    Tests run successfully

14.5k write requests in 30 seconds with no errors and an average response time of 1 ms under load.

##### Example output: CouchDB adapter

Example output from my local machine while using the included CouchDB adapter connected to a single CouchDB instance on the same machine:

      POST-ing 250 assets/second over 200 concurrent connections for 30 seconds. Please wait...
    {
      "totalRequests": 6164,
      "totalErrors": 0,
      "totalTimeSeconds": 30.002880514,
      "rps": 205,
      "meanLatencyMs": 120.6,
      "maxLatencyMs": 14050,
      "minLatencyMs": 3,
      "percentiles": {
        "50": 4,
        "90": 8,
        "95": 17,
        "99": 3666
      },
      "errorCodes": {}
    }
    Tests run successfully

Tuned down a bit, naturally, but still serving over 6000 write requests in 30 seconds with no errors and an average response time of 120ms under load.

## API Documentation

### Design Considerations

As the URI for each asset is itself a URL, and to maximize consistency (e.g. it would be confusing to have a query string parameter on a GET enpoint and a body property with the same information on a POST endpoint) a query string parameter is used on *all* endpoints and considered part of an asset resource’s identifier in terms of the REST API.

As the API may need to expand to include other resources in the future, all asset-related endpoints are prefixed with `/assets` to allow room for this growth.

As a new version of this API may need to come online alongside this version in the future, the entire API has been versioned by prefixing all endpoints with `/v1`. 

### Endpoints

#### `GET /v1/assets?uri=:uri`

**Description** - Returns a single asset

**URL parameters**

* uri - <string>(required) - example: 'myorg://users/tswift'

*Data params* - none

**Success Response**

example:

200 OK

    {
      uri: <string>,
      name: <string>,
      notes: [<string>, [null]]
    }

**Error Response**

example:

404 Not Found

    {
      code: 404,
      message: 'Record not found'
    }

#### `POST /v1/assets?uri=:uri`

**Description** - Creates a new asset

**URL parameters**

* uri - <string>(required) - example: 'myorg://users/tswift'

**Data params**

    {
      name: <string>(required),
      notes: <string>(optional)
    }

**Success Response**

example:

201 Created

**Error Response**

example:

409 Conflict

    {
      code: 409,
      message: 'Conflicting record'
    }

#### `PATCH /v1/assets?uri=:uri`

**Description** - Adds a note to an existing asset

**URL parameters**

* uri - <string>(required) - example: 'myorg://users/tswift'

**Data params**

    {
      notes: <string>(required)
    }

**Success Response**

example:

204 No Content

**Error Response**

example:

404 Not Found

    {
      code: 404,
      message: 'Record not found'
    }

#### `DELETE /v1/assets?uri=:uri`

**Description** - Deletes an existing asset

**URL parameters**

* uri - <string>(required) - example: 'myorg://users/tswift'

**Data params** - none

**Success Response**

example:

204 No Content

**Error Response**

example:

404 Not Found

    {
      code: 404,
      message: 'Record not found'
    }

## Database Considerations

### Schema Design

The asset's uri (in this case, a url), is used as the key in each data store.  a prefix of `/asset` is added to the uri in the actual data store in case additional document types need to be added to the application later

#### In-Memory store
Document shape currently in use in the memory store is: 

    {
      name: <string>,
      notes: <string>(optional),
    }

and the document is stored with the encoded uri as the key.

#### Couch DB
In the couch db adapter, the document shape is:

    {
      _id: <string>,
      name: <string>,
      notes: <string>(optional),
    }

where `_id` is the key field used by CouchDB to identify a document.  the encoded uri is stored here.

### Which db to use

#### Schema approach considerations

Given that we currently have only one object type to put into storage, schema management is not currently much of a consideration for which db to use (i.e. an rdbms, a key/value store, a document store, or any other type of db would be able to handle our schema needs).  The only real conclusion in this area is that an RDBMS would almost certainly be overkill for what is being done.

#### Speed considerations

A key/value db of some sort (e.g. Redis, Memcached) would almost certainly be able to serve requests the fastest, as these almost universally run in memory. However, these generally do not have advantageous replication models (generally they have master/slave models, meaning that only one server can handle writes).  A NoSQL document store/schemaless db (e.g. MongoDB, CouchDB) would probably be the next fastest possibility, as these are generally written for performance and have their own internal indexing and caching schemes to keep things moving very quickly.  An RDBMS (e.g. MSSQL, Postgres) would be the last consideration, and as the slowest of these, should probably be the last considered.

#### Replication/synchronization/consistency considerations

These vary by the particular database, but most key/value dbs operate on a master/slave model of synchronization (i.e. write to one master, copy to all slaves), which means that we would have to write our own synchronization model in case of network segmentation. Likewise most rdbms do not support a strong synchronization model and would require a relatively high level of custom work to synchronize in case of network segmentation.

Given the requirement for uninterrupted service during network segmentation and the potential for complex problems arising out of attempting to write our own solution, I feel that relatively more weight should be given to a db solution that can handle this requirement out of the box, especially if it can demonstrate the needed performance and support for other requirements.

#### Overall conclusion

The possibilities for databases are growing by the day. With more time, other possibilities could certainly be considered, and this recommendation is made with the hope that additional input would be forthcoming. That said, CouchDB is a document store db that I *do* have some experience with that has been designed to have peer-peer replication with eventual consistency. This means that each physical site could have its own server or cluster of servers running, synchronizing in both directions to all other locations.  If connectivity to other locations is lost, the local server can continue to handle requests, and once connectivity is restored, CouchDB can be (very easily) set up to automatically synchronize both ways so that all dbs are quickly back in agreement about the data set.  Each db can also act as a backup to all others in case of a server going down.

This takes a large amount of work, both maintenance and coding, off of the development team while providing the replication and redundancy needed for this project.

In addition, while CouchDB’s indexing model and ability to create views can slow performance significantly if misused, this project's requirements should require only the default index and no views, so it should be able to run at maximum speed.

### Proposed Overall Architecture

At each physical site:

* At least one node server, running this application, preferably behind a load balancer (see below), and connected to:
* At least one CouchDb 2.0 server as a one-machine cluster, replicating both ways with the others in a circular arrangement (e.g. if there are 4 db servers, A, B, C and D, A replicates to D and B, B replicates to A and C, C replicates to B and D, and D replicates to C and A).

#### Advantages

* CouchDB handles replication automatically
* Additional physical sites can be easily set up without downtime by starting their servers and enabling replication to their db
* Network segmentation does not cause downtime, as the local servers can continue to serve requests while connection to the rest of the network is unavailable.
* CouchDB will automatically continue to replicate once network segmentation ends.  Service will continue uninterrupted.
* horizontal scaling can be handled without downtime by setting up additional node servers behind the load balancer, or on the data side by adding additional Couch machines to the local clusters

#### Disadvantages

* CouchDB will automatically resolve conflicts in order to maintain data consistency. For example: record id 1 = 'abc', site A edits 1 = 'def', site B edits 1 = 'ghi'. During two-way replication, Couch will detect the conflict and pick a winner so that both databases are consistent, so either site A or site B may not see the information they expected. Since CouchDB versions documents, the "loser" record is not lost, merely saved as a previous version.


### Other considerations/Next steps

* In production, this application would be best run using `cluster`: https://nodejs.org/api/cluster.html.  This way, things could be set up so that there would be one instance of the application running on each available core of the server's cpu, all listening on the same port, speeding things up even further
* Things like the connection string in the couch adapter should be moved into an environment file that has values that get loaded into `process.env`.  In this way, developers can have local settings in their environment file, and servers can explicitly load environment variables on startup.
* A more rigorous documentation strategy, such as JSDoc, could be implemented.  In general, I consider unit tests to be the best documentation (since they actually get maintained along with the code), but different projects have different needs.
