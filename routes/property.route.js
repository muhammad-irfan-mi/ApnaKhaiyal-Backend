const express = require("express");
const router = express.Router();

const { upload } = require("../utils/multer");
const { addProperty, getProperty, incrementView, getPropertyById } = require("../controllers/property.controller");

router.post("/", upload.array("images", 10), addProperty);
router.post('/:id/view', incrementView);
router.get("/",  getProperty);
router.get("/:id",  getPropertyById);

module.exports = router;
