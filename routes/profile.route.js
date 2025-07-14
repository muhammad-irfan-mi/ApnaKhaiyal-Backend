const express = require('express');
const router = express.Router();
const upload = require('../utils/multerConfig');
const { createProfile, getAllProfiles, getProfile } = require('../controllers/profile');

router.post(
  '/',
  upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  createProfile
);
router.get('/', getAllProfiles);
router.get('/:id', getProfile);

module.exports = router;