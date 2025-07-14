const express = require('express');
const { verifyToken } = require('../middleware/verifyToken.service');
const { upload } = require('../utils/multer');
const { getUserById, updateUserById, getAllTownOwners } = require('../controllers/user.controller');

const router = express.Router();

router.get('/getUser/:id', verifyToken, getUserById);
router.patch('/updateUser/:id', upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]), verifyToken, updateUserById);
router.get('/get-all-town-owner/', getAllTownOwners);


module.exports = router;