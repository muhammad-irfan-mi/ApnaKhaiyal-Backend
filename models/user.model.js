// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     phoneNumber: {
//       type: String,
//     },
//     password: {
//       type: String,
//     },
//     roles: {
//       type: String,
//       enum: ["LOCAL SERVICES", "TOWN OWNER", "PROPERTY AGENT", "MARKETING AGENCIES", "INDIVIDUAL ACCOUNT"],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );


// const UserModel = mongoose.model('User', userSchema);

// module.exports = UserModel;


// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Basic User Info
    name: String,
    email: { type: String, required: true, unique: true },
    phoneNumber: String,
    password: String,
    roles: {
      type: String,
      enum: ["LOCAL SERVICES", "TOWN OWNER", "PROPERTY AGENT", "MARKETING AGENCIES", "INDIVIDUAL ACCOUNT"],
    },

    // Profile Info (Merged)
    bannerUrl: String,
    logoUrl: String,
    alwaysOpen: Boolean,
    openingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    agencyNotes: String,
    healthStrategy: String,
    localAddress: String,
    status: String,
    values: String,
    address: String,
    publicNavigation: String,
    socialMedia: {
      twitter: String,
      instagram: String,
      linkedIn: String,
      phoenix: String
    },
    media: String,
    time: String,
    faith: String,
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
