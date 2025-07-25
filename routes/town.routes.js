const express = require("express");
const router = express.Router();
const { addTown, getTownById, getAllTowns, getTownsByUser, updatePlotStatusAndDealer, deleteDealerfromPlot } = require("../controllers/town.controller");
const { townUpload } = require("../utils/multer");
const { verifyToken } = require("../middleware/verifyToken.service");

router.post("/:id", townUpload, addTown);
router.get("/all", getAllTowns);
router.get("/by-user/:id", getTownsByUser);
router.get("/:id", getTownById);
router.patch("/plot/:plotNumberId", updatePlotStatusAndDealer);
router.delete("/plot/:plotNumberId", deleteDealerfromPlot);

module.exports = router;
