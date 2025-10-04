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
            default: ""
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'audio', 'video', 'file'],
            default: 'text'
        },
        fileUrl: {
            type: String,
            default: null
        },
        fileName: {
            type: String,
            default: null
        },
        fileSize: {
            type: Number,
            default: 0
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", messageSchema);

module.exports = Chat;