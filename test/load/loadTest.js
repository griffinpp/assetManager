const loadtest = require('loadtest');

const rps = 500;
const cc = 200;

// POST, PUT, and DEL asset all are all tied for most expensive operation,
// since all involve potentially two data service calls.  POST is easiest
// to automate, so we'll use it
const postOptions = {
  url: 'http://localhost:3000',
  concurrent: cc,
  method: 'POST',
  body: '',
  requestsPerSecond: rps,
  maxSeconds: 30,
  requestGenerator: (params, options, client, callback) => {
    const message = '{ "name": "Test Name", "notes": "here\'s a note" }';
    // eslint-disable-next-line
    options.headers['Content-Length'] = message.length;
    // eslint-disable-next-line
    options.headers['Content-Type'] = 'application/json';
    // eslint-disable-next-line
    options.body = message;
    // randomize the asset uid we're POST-ing
    // eslint-disable-next-line
    options.path = `/v1/assets?uri=myorg://users/${Math.floor(Math.random() * 100000000000)}`;
    const request = client(options, callback);
    request.write(message);
    return request;
  },
};
console.log(`
  POST-ing ${rps} assets/second over ${cc} concurrent connections for 30 seconds. Please wait...
`);
loadtest.loadTest(postOptions, (error, results) => {
  if (error) {
    console.error('Got an error: %s', error);
  }
  console.log(JSON.stringify(results, null, 2));
  console.log('Tests run successfully');
});
