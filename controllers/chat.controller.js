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

        // Get latest message timestamp for each receiver
        const lastChats = await Chat.aggregate([
            { $match: { senderId } },
            { $sort: { createdAt: -1 } }, // newest first
            {
                $group: {
                    _id: "$receiverId",
                    lastMessageAt: { $first: "$createdAt" }
                }
            },
            { $sort: { lastMessageAt: -1 } } 
        ]);

        const receiverIds = lastChats.map(c => c._id);

        const receivers = await UserModel.find({ _id: { $in: receiverIds } })
            .select("-password");

        const orderedReceivers = receiverIds.map(id => receivers.find(u => u._id.toString() === id.toString()));

        return res.status(200).json({ success: true, data: orderedReceivers });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


module.exports = { sendMessage, getChatHistory, getReceiversBySender };
