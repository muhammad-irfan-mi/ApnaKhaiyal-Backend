const express = require('express');
const { upload } = require('../utils/multer');
const { addCity, updateCity, getCity, deleteCity } = require('../controllers/city.controller');
const router = express.Router();

// Add a new city or update existing city
router.post('/add', upload.array('images', 10), addCity);

// Update city details
router.put('/update', updateCity);

// Get all provinces and cities
router.get('/', getCity);

// Delete city
router.delete('/', deleteCity);

module.exports = router;
