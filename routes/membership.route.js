const express = require("express");
const { purchasePlan, getAllMemberships, approveMembership } = require("../controllers/membership.controller");
const { upload } = require("../utils/multer");
const router = express.Router();

router.post("/purchase/:userId", upload.single("slip"), purchasePlan);
router.get("/", getAllMemberships);
router.get("/:userId", getAllMemberships);
router.put("/approve/:membershipId", approveMembership);

module.exports = router;
