const multer = require('multer');

const storage = multer.memoryStorage();
const limits = {
  fileSize: 5 * 1024 * 1024 
};

module.exports = multer({ storage, limits });