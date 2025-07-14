const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);