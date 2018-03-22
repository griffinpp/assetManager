// external modules
const express = require('express');
const bodyParser = require('body-parser');
// local files
const v1router = require('./routers/v1.router');

const app = express();

// parse the raw JSON body of requests into a body object on the request
app.use(bodyParser.json({ limit: '50mb' }));

// load up the v1 router
app.use('/v1', v1router);

// set the port that we want the application to run on, default to port 3000
const port = process.env.PORT || 3000;

// start the server
app.listen(port, () => {
  console.info(`Asset Manager listening for requests on port ${port}. Ctrl-C to quit.`);
});
