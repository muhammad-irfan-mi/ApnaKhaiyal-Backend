const Chat = require("../models/chat.model");
const UserModel = require("../models/user.model");

// Save message in DB
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newMessage = new Chat({ senderId, receiverId, message });
        await newMessage.save();

        return res.status(201).json({ success: true, message: "Message saved", data: newMessage });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get chat history between 2 users
const getChatHistory = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        const chats = await Chat.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({ success: true, data: chats });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get all receivers with full user details for a sender
const getReceiversBySender = async (req, res) => {
    try {
        const { senderId } = req.params;

        const receiverIds = await Chat.find({ senderId }).distinct("receiverId");
        const receivers = await UserModel.find({ _id: { $in: receiverIds } }).select("-password");

        return res.status(200).json({ success: true, data: receivers });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { sendMessage, getChatHistory, getReceiversBySender };
