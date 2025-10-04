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

        const lastChats = await Chat.aggregate([
            { $match: { senderId } },
            { $sort: { createdAt: -1 } },
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

// Get all senders who messaged a user
const getSendersByReceiver = async (req, res) => {
    try {
        const { receiverId } = req.params;

        const lastChats = await Chat.aggregate([
            { $match: { receiverId } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$senderId",
                    lastMessageAt: { $first: "$createdAt" }
                }
            },
            { $sort: { lastMessageAt: -1 } }
        ]);

        const senderIds = lastChats.map(c => c._id);
        const senders = await UserModel.find({ _id: { $in: senderIds } }).select("-password");

        const orderedSenders = senderIds.map(id => senders.find(u => u._id.toString() === id.toString()));

        return res.status(200).json({ success: true, data: orderedSenders });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { sendMessage, getChatHistory, getReceiversBySender, getSendersByReceiver };












// const express = require("express");
// const router = express.Router();
// const Chat = require("../models/chat.model");
// const { uploadFileToS3, deleteFileFromS3 } = require("../services/s3.service");


// // Send message
// const sendMessage = async (req, res) => {
//     try {
//         const { senderId, receiverId, message, messageType = 'text', fileUrl = null } = req.body;

//         if (!senderId || !receiverId) {
//             return res.status(400).json({ error: "Sender and receiver IDs are required" });
//         }

//         if (messageType === 'text' && !message) {
//             return res.status(400).json({ error: "Message is required for text messages" });
//         }

//         const newMessage = new Chat({
//             senderId,
//             receiverId,
//             message: message || "",
//             messageType,
//             fileUrl
//         });
//         await newMessage.save();

//         return res.status(201).json({ success: true, message: "Message saved", data: newMessage });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Upload file
// const uploadFile = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No file provided" });
//         }

//         const file = req.file;
//         const fileExtension = file.originalname.split('.').pop();
//         const fileName = `chat/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

//         const uploadResult = await uploadFileToS3({
//             fileBuffer: file.buffer,
//             fileName,
//             mimeType: file.mimetype,
//         });

//         if (!uploadResult) {
//             return res.status(500).json({ error: "Failed to upload file to S3" });
//         }

//         return res.status(200).json({
//             success: true,
//             data: {
//                 fileUrl: uploadResult.Location,
//                 fileName: file.originalname,
//                 fileSize: file.size,
//                 mimeType: file.mimetype
//             }
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Delete message
// const deleteMessage = async (req, res) => {
//     try {
//         const { messageId } = req.params;

//         const message = await Chat.findById(messageId);
//         if (!message) {
//             return res.status(404).json({ error: "Message not found" });
//         }

//         // If message has a file, delete it from S3
//         if (message.fileUrl) {
//             try {
//                 const key = message.fileUrl.split('/').pop();
//                 await deleteFileFromS3(`chat/${key}`);
//             } catch (s3Error) {
//                 console.error("Error deleting file from S3:", s3Error);
//             }
//         }

//         // Soft delete the message
//         message.isDeleted = true;
//         message.message = "This message was deleted";
//         message.fileUrl = null;
//         await message.save();

//         return res.status(200).json({ success: true, message: "Message deleted successfully" });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Get message history
// const getMessageHistory = async (req, res) => {
//     try {
//         const { senderId, receiverId } = req.params;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const messages = await Chat.find({
//             $or: [
//                 { senderId, receiverId },
//                 { senderId: receiverId, receiverId: senderId }
//             ],
//             isDeleted: false
//         })
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limit);

//         return res.status(200).json({ success: true, data: messages.reverse() });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Get unread message count
// const getUnreadCount = async (req, res) => {
//     try {
//         const { senderId, receiverId } = req.params;

//         const count = await Chat.countDocuments({
//             senderId: receiverId,
//             receiverId: senderId,
//             isRead: false,
//             isDeleted: false
//         });

//         return res.status(200).json({ success: true, count });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Mark message as read
// const markAsRead = async (req, res) => {
//     try {
//         const { messageId } = req.body;

//         await Chat.findByIdAndUpdate(messageId, { isRead: true });

//         return res.status(200).json({ success: true, message: "Message marked as read" });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Mark all messages as read
// const markAllAsRead = async (req, res) => {
//     try {
//         const { senderId, receiverId } = req.body;

//         await Chat.updateMany(
//             {
//                 senderId,
//                 receiverId,
//                 isRead: false
//             },
//             { isRead: true }
//         );

//         return res.status(200).json({ success: true, message: "All messages marked as read" });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Get receivers (people who sent messages to the user)
// const getReceivers = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         const receivers = await Chat.aggregate([
//             {
//                 $match: {
//                     receiverId: userId,
//                     isDeleted: false
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$senderId"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "user"
//                 }
//             },
//             {
//                 $unwind: "$user"
//             },
//             {
//                 $project: {
//                     _id: "$user._id",
//                     userName: "$user.userName",
//                     name: "$user.name",
//                     userEmail: "$user.userEmail"
//                 }
//             }
//         ]);

//         return res.status(200).json({ success: true, data: receivers });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Get senders (people the user sent messages to)
// const getSenders = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         const senders = await Chat.aggregate([
//             {
//                 $match: {
//                     senderId: userId,
//                     isDeleted: false
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$receiverId"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "user"
//                 }
//             },
//             {
//                 $unwind: "$user"
//             },
//             {
//                 $project: {
//                     _id: "$user._id",
//                     userName: "$user.userName",
//                     name: "$user.name",
//                     userEmail: "$user.userEmail"
//                 }
//             }
//         ]);

//         return res.status(200).json({ success: true, data: senders });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };


// module.exports = {
//     sendMessage,
//     uploadFile,
//     deleteMessage,
//     getMessageHistory,
//     getUnreadCount,
//     markAsRead,
//     markAllAsRead,
//     getReceivers,
//     getSenders,
// };