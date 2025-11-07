// const Chat = require("../models/chat.model");
// const UserModel = require("../models/user.model");

// // Save message in DB
// const sendMessage = async (req, res) => {
//     try {
//         const { senderId, receiverId, message } = req.body;

//         if (!senderId || !receiverId || !message) {
//             return res.status(400).json({ error: "All fields are required" });
//         }

//         const newMessage = new Chat({ senderId, receiverId, message });
//         await newMessage.save();

//         return res.status(201).json({ success: true, message: "Message saved", data: newMessage });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Get chat history between 2 users
// const getChatHistory = async (req, res) => {
//     try {
//         const { senderId, receiverId } = req.params;

//         const chats = await Chat.find({
//             $or: [
//                 { senderId, receiverId },
//                 { senderId: receiverId, receiverId: senderId }
//             ]
//         }).sort({ createdAt: 1 });

//         return res.status(200).json({ success: true, data: chats });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Get all receivers with full user details for a sender
// const getReceiversBySender = async (req, res) => {
//     try {
//         const { senderId } = req.params;

//         const lastChats = await Chat.aggregate([
//             { $match: { senderId } },
//             { $sort: { createdAt: -1 } },
//             {
//                 $group: {
//                     _id: "$receiverId",
//                     lastMessageAt: { $first: "$createdAt" }
//                 }
//             },
//             { $sort: { lastMessageAt: -1 } }
//         ]);

//         const receiverIds = lastChats.map(c => c._id);

//         const receivers = await UserModel.find({ _id: { $in: receiverIds } })
//             .select("-password");

//         const orderedReceivers = receiverIds.map(id => receivers.find(u => u._id.toString() === id.toString()));

//         return res.status(200).json({ success: true, data: orderedReceivers });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Get all senders who messaged a user
// const getSendersByReceiver = async (req, res) => {
//     try {
//         const { receiverId } = req.params;

//         const lastChats = await Chat.aggregate([
//             { $match: { receiverId } },
//             { $sort: { createdAt: -1 } },
//             {
//                 $group: {
//                     _id: "$senderId",
//                     lastMessageAt: { $first: "$createdAt" }
//                 }
//             },
//             { $sort: { lastMessageAt: -1 } }
//         ]);

//         const senderIds = lastChats.map(c => c._id);
//         const senders = await UserModel.find({ _id: { $in: senderIds } }).select("-password");

//         const orderedSenders = senderIds.map(id => senders.find(u => u._id.toString() === id.toString()));

//         return res.status(200).json({ success: true, data: orderedSenders });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// module.exports = { sendMessage, getChatHistory, getReceiversBySender, getSendersByReceiver };






















const Chat = require("../models/chat.model");
const UserModel = require("../models/user.model");
const { uploadFileToS3 } = require("../services/s3.service");

const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message, messageType = 'text' } = req.body;

        console.log("Received message data:", {
            senderId,
            receiverId,
            message,
            messageType,
            file: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                buffer: req.file.buffer ? `Buffer with ${req.file.buffer.length} bytes` : 'No buffer'
            } : 'No file'
        });

        if (!senderId || !receiverId) {
            return res.status(400).json({ error: "Sender and receiver IDs are required" });
        }

        if (messageType === 'text' && !message) {
            return res.status(400).json({ error: "Message text is required for text messages" });
        }

        let fileUrl = null;
        let fileName = null;
        let fileSize = 0;
        let mimeType = null;

        // Handle file upload if present
        if (req.file && messageType !== 'text') {
            const file = req.file;

            console.log("Processing file upload:", {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            });

            // Generate file name exactly like property function
            const timestamp = Date.now();
            const ext = file.originalname.split(".").pop();
            const fileNameS3 = `chat/${senderId}/${receiverId}/${timestamp}.${ext}`;

            try {
                // Upload to S3 using same function as property
                fileUrl = await uploadFileToS3({
                    fileBuffer: file.buffer,
                    fileName: fileNameS3,
                    mimeType: file.mimetype,
                });

                console.log("File uploaded to S3:", fileUrl);

                fileName = file.originalname;
                fileSize = file.size;
                mimeType = file.mimetype;

            } catch (uploadError) {
                console.error("S3 upload error:", uploadError);
                return res.status(500).json({ error: "Failed to upload file to S3" });
            }
        }

        const newMessage = new Chat({
            senderId,
            receiverId,
            message: message || '',
            messageType,
            fileUrl,
            fileName,
            fileSize,
            mimeType
        });

        await newMessage.save();

        console.log("Message saved to DB:", newMessage);

        return res.status(201).json({
            success: true,
            message: "Message saved",
            data: newMessage
        });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Get chat history between 2 users
const getChatHistory = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const chats = await Chat.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'userName name userEmail')
            .populate('receiverId', 'userName name userEmail');

        // Reverse to get chronological order for frontend
        const sortedChats = chats.reverse();

        return res.status(200).json({
            success: true,
            data: sortedChats,
            pagination: {
                page,
                limit,
                hasMore: chats.length === limit
            }
        });
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
                    lastMessage: { $first: "$$ROOT" },
                    lastMessageAt: { $first: "$createdAt" }
                }
            },
            { $sort: { lastMessageAt: -1 } }
        ]);

        const receiverIds = lastChats.map(c => c._id);
        const receivers = await UserModel.find({ _id: { $in: receiverIds } })
            .select("-password");

        // Create last message map
        const lastMsgMap = {};
        lastChats.forEach(chat => {
            lastMsgMap[chat._id.toString()] = chat.lastMessage;
        });

        const orderedReceivers = receiverIds.map(id => {
            const receiver = receivers.find(u => u._id.toString() === id.toString());
            return {
                ...receiver.toObject(),
                lastMessage: lastMsgMap[id.toString()]
            };
        });

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
                    lastMessage: { $first: "$$ROOT" },
                    lastMessageAt: { $first: "$createdAt" }
                }
            },
            { $sort: { lastMessageAt: -1 } }
        ]);

        const senderIds = lastChats.map(c => c._id);
        const senders = await UserModel.find({ _id: { $in: senderIds } }).select("-password");

        // Create last message map
        const lastMsgMap = {};
        lastChats.forEach(chat => {
            lastMsgMap[chat._id.toString()] = chat.lastMessage;
        });

        const orderedSenders = senderIds.map(id => {
            const sender = senders.find(u => u._id.toString() === id.toString());
            return {
                ...sender.toObject(),
                lastMessage: lastMsgMap[id.toString()]
            };
        });

        return res.status(200).json({ success: true, data: orderedSenders });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { sendMessage, getChatHistory, getReceiversBySender, getSendersByReceiver };