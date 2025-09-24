const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
    isSold: {
        type: Boolean,
        default: false
    },
    userId: String,
    adType: String,
    category: String,
    title: String,
    description: String,
    pricingOption: String,
    priceType: String,
    price: mongoose.Schema.Types.Mixed,
    tags: [String],
    features: [String],
    videoURL: String,
    contact: {
        province: String,
        city: String,
        location: String,
        zip: String,
        address: String,
        phone: String,
        whatsapp: String,
        email: String,
        website: String,
    },
    lat: Number,
    lng: Number,
    images: [String],
    views: {
        type: Number,
        default: 0,
    },
    viewedBy: [String],
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    expiresAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("property", adSchema);
