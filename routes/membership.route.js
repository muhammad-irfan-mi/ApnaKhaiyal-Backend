const express = require("express");
const { purchasePlan, getAllMemberships, approveMembership, getMembershipByUser } = require("../controllers/membership.controller");
const { upload } = require("../utils/multer");
const router = express.Router();

router.post("/purchase/:userId", upload.single("slip"), purchasePlan);
router.get("/", getAllMemberships);
router.get("/:userId", getMembershipByUser);
router.put("/approve/:membershipId", approveMembership);

module.exports = router;
