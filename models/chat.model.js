const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: String,
            required: true
        },
        receiverId: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", messageSchema);

module.exports = Chat;
