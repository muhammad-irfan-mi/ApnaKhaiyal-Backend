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
        messageType: {
            type: String,
            enum: ['text', 'image', 'audio', 'video'],
            default: 'text'
        },
        fileUrl: {
            type: String,
            default: null
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", messageSchema);

module.exports = Chat;
