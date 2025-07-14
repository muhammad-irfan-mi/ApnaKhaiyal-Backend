const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, 
});

// Define all expected fields
const townUpload = upload.fields([
  { name: 'locationMap', maxCount: 1 },
  { name: 'nocRegistry', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
  ...Array.from({ length: 10 }, (_, i) => ({ name: `phaseImages${i}`, maxCount: 20 })),
  ...Array.from({ length: 10 }, (_, i) => ({ name: `phaseVideo${i}`, maxCount: 1 })),
]);

module.exports = { upload, townUpload };
