const express = require('express');
const { upload } = require('../utils/multer');
const { addNews, getAllNews, getNewsById } = require('../controllers/news.controller');
const router = express.Router();

router.post('/', upload.single('image'), addNews);
router.get('/', getAllNews);
router.get('/:id', getNewsById );

module.exports = router;
