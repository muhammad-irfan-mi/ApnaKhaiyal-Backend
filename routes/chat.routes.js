const express = require("express");
const { sendMessage, getChatHistory } = require("../controllers/chat.controller");
const { getReceiversBySender } = require("../controllers/chat.controller");

const router = express.Router();

router.post("/send", sendMessage);
router.get("/history/:senderId/:receiverId", getChatHistory);
router.get("/receivers/:senderId", getReceiversBySender);

module.exports = router;
