// const mongoose = require('mongoose');

// const citySchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     locations: [{
//         type: String
//     }],
//     images: [{
//         type: String
//     }],
// }, { timestamps: true });

// module.exports = mongoose.model('City', citySchema);




const mongoose = require("mongoose");
const { Schema } = mongoose;

const CitySchema = new Schema({
    name: { type: String, required: true },
    locations: [{ type: String }],
    images: [{ type: String }],
});

const ProvinceSchema = new Schema({
    name: { type: String, required: true, unique: true },
    cities: [CitySchema],
}, { timestamps: true });

module.exports = mongoose.model("Province", ProvinceSchema);

