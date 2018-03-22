const express = require('express');
const assetsRouter = require('./assets.router');

const router = express.Router();

// in anticipation of potential growth of this application, other routers can be added here later
router.use('/assets', assetsRouter);

module.exports = router;
