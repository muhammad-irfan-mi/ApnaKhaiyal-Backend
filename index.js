const express = require('express')
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser');
const cors = require('cors')

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
app.use('/api/displayOffer', require('./routes/displayOffer.route'))



app.listen(process.env.PORT, () => {
    console.log(`Server Started at PORT: ${process.env.PORT}`)
})
