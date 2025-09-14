const express = require("express");
const router = express.Router();

const { upload } = require("../utils/multer");
const { addProperty, getProperty, incrementView, getPropertyById, getPropertyByUser } = require("../controllers/property.controller");

router.post("/:userId", upload.array("images", 15), addProperty);
router.post('/:id/view', incrementView);
router.get("/",  getProperty);
router.get("/:id",  getPropertyById);
router.get("/user/:userId",  getPropertyByUser);

module.exports = router;
