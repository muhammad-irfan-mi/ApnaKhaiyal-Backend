const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const companyAd = mongoose.model("Ad", adSchema);

module.exports = companyAd
