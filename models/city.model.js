const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    locations: [{
        type: String
    }],
    images: [{
        type: String
    }],
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);
