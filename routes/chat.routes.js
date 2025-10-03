const express = require("express");
const { sendMessage, getChatHistory, getReceiversBySender, getSendersByReceiver } = require("../controllers/chat.controller");

const router = express.Router();

router.post("/send", sendMessage);
router.get("/history/:senderId/:receiverId", getChatHistory);
router.get("/receivers/:senderId", getReceiversBySender);
router.get("/senders/:receiverId", getSendersByReceiver);

module.exports = router;
