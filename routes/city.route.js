const express = require('express');
const { addCities, getCities } = require('../controllers/city.controller');
const { upload } = require('../utils/multer');
const router = express.Router();

router.post('/add', upload.array('images', 10), addCities);
router.get('/',  getCities);

module.exports = router;