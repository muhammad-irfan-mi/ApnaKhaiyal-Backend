const mongoose = require('mongoose')

const connectDB = (mongoURL) => {
    mongoose.connect(mongoURL)
    .then(()=> {console.log('MongoDB Connected')})
    .catch(err => console.error('Error connecting to MongoDB:', err));
}

module.exports = connectDB