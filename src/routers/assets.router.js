const express = require('express');
const assetsController = require('../controllers/assets.controller');

const router = express.Router();

router.get('/', assetsController.getAsset);
router.post('/', assetsController.postAsset);
router.patch('/', assetsController.patchAsset);
router.delete('/', assetsController.delAsset);

module.exports = router;
