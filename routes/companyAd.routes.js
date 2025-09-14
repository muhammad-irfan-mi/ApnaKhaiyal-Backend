const express = require("express");
const multer = require("multer");
const { createAd, getAds, deleteExpiredAds } = require("../controllers/companyAd.controller");

const router = express.Router();
const upload = multer();

router.post("/", upload.single("image"), createAd);
router.get("/", getAds);
router.delete("/expired", deleteExpiredAds);

module.exports = router;
