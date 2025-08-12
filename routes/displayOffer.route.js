const express = require('express');
const multer = require('multer');
const { createDisplayOffer, updateDisplayOffer, getDisplayOffer } = require('../controllers/displayOffer.controller');
const { upload } = require('../utils/multer');
const router = express.Router();


router.post('/', upload.fields([{ name: 'design' }, { name: 'slip' }]), createDisplayOffer);
router.put('/:id', updateDisplayOffer);
router.get('/', getDisplayOffer);

module.exports = router;
