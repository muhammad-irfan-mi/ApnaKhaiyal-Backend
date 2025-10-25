const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require('./config/db');

dotenv.config();
const app = express();
connectDB(process.env.MONGO_URL);

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello from Apna Khaiyal Server');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/town', require('./routes/town.routes'));
app.use('/api/city', require('./routes/city.route'));
app.use('/api/plan', require('./routes/Plan.route'));
app.use('/api/membership', require('./routes/membership.route'));
app.use('/api/property', require('./routes/property.route'));
app.use('/api/news', require('./routes/news.routes'));
app.use('/api/complain', require('./routes/complaint.routes'));
app.use('/api/displayOffer', require('./routes/displayOffer.route'));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/companyAd", require("./routes/companyAd.routes"));


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    console.log("Query params:", socket.handshake.query);

    // Extract userId from handshake query
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);

        // Add user to online list
        socket.broadcast.emit("presence:online", userId);

        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit("presence:list", onlineUserIds);
    }

    socket.on("join", (data) => {
        console.log("User joined:", data);
        if (data.userId) {
            socket.join(data.userId);
        }
    });

    socket.on("sendMessage", (data) => {
        console.log("Message received:", data);
        io.to(data.receiverId).emit("message", data);
    });

    socket.on("deleteMessage", (data) => {
        console.log("Delete message request:", data);
        io.to(data.receiverId).emit("messageDeleted", { messageId: data.messageId });
    });

    socket.on("markAsRead", (data) => {
        console.log("Mark as read:", data);
    });

    socket.on("markAllAsRead", (data) => {
        console.log("Mark all as read:", data);
    });

    socket.on("disconnect", (reason) => {
        console.log("User disconnected:", socket.id, reason);
        if (userId) {
            socket.broadcast.emit("presence:offline", userId);
        }
    });

    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });
});

// Get port from environment or use default
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log("MONGO_URL:", process.env.MONGO_URL);
    console.log(`Server running on port ${PORT}`);
});
