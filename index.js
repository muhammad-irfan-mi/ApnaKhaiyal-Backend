const express = require('express')
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require('./config/db')

dotenv.config()
const app = express()
connectDB(process.env.MONGO_URL)

app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    // origin: ['http://localhost:5173'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true
}));

app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.send('Hello from Apna Khaiyal Server')
})

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/user', require('./routes/user.routes'))
app.use('/api/town', require('./routes/town.routes'))
app.use('/api/city', require('./routes/city.route'))
app.use('/api/property', require('./routes/property.route'))
app.use('/api/news', require('./routes/news.routes'))
app.use('/api/complain', require('./routes/complaint.routes'))
app.use('/api/displayOffer', require('./routes/displayOffer.route'))
app.use("/api/chat", require("./routes/chat.routes"));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        console.log("Message:", { senderId, receiverId, message });

        io.to(receiverId).emit("receiveMessage", { senderId, message });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server Started at PORT: ${process.env.PORT}`)
})
