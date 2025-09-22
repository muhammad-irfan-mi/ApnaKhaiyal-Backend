const express = require("express");
const router = express.Router();

const { upload } = require("../utils/multer");
const { addProperty, getProperty, incrementView, getPropertyById, getPropertyByUser, updatePropertyById, deletePropertyById, updatePropertyStatusByAdmin, getPropertyByAdmin } = require("../controllers/property.controller");

router.get("/", getProperty);
router.get("/by-admin", getPropertyByAdmin);
router.post("/:userId", upload.array("images", 15), addProperty);
router.post('/:id/view', incrementView);
router.get("/:id", getPropertyById);
router.get("/user/:userId", getPropertyByUser);
router.put("/status/:propertyId", updatePropertyStatusByAdmin);
router.put("/:id", upload.array("images", 15), updatePropertyById);
router.delete("/:id", deletePropertyById);


module.exports = router;
