const express = require('express');
const { upload } = require('../utils/multer');
const { addNews, getAllNews, getNewsById, likeNews, addComment, getCommentByPost } = require('../controllers/news.controller');
const router = express.Router();

router.post('/', upload.single('image'), addNews);
router.post("/:newsId/like", likeNews);
router.post("/:newsId/comment", addComment);
router.get("/:newsId/comment", getCommentByPost);
router.get('/', getAllNews);
router.get('/:id', getNewsById);

module.exports = router;