const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, default: "" },
    password: { type: String, default: "" },
    roles: {
      type: String,
      enum: ["LOCAL SERVICES", "TOWN OWNER", "PROPERTY AGENT", "MARKETING AGENCIES", "INDIVIDUAL ACCOUNT"],
      default: "INDIVIDUAL ACCOUNT"
    },
    localServices: {
      type: [String],
      enum: [
        "Home Inspection",
        "Home Developers",
        "Map officer",
        "Architecture Engineers",
        "Property Photographers"
      ],
      default: []
    },
    bannerUrl: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    agencyName: { type: String, default: "" },
    akCode: {
      type: String,
      unique: true,
      required: true,
    },
    slogan: { type: String, default: "" },
    agencyEmail: { type: String, default: "" },
    agencyPhone: { type: Number, default: "" },
    agencyWebsite: { type: String, default: "" },
    address: { type: String, default: "" },
    profileDesc: { type: String, default: "" },

    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      linkedIn: { type: String, default: "" },
      pinterest: { type: String, default: "" },
      reddit: { type: String, default: "" },
      tiktok: { type: String, default: "" }
    },

    status: { type: String, default: "inactive" },
    values: { type: String, default: "" },
    publicNavigation: { type: String, default: "" },
    media: { type: String, default: "" },
    time: { type: String, default: "" },
    totalListings: { type: Number, default: 0 },
    publishedListings: { type: Number, default: 0 },
    pendingListings: { type: Number, default: 0 },

    listingQuota: { type: Number, default: 0 },
    featureQuota: { type: Number, default: 0 },
    topQuota: { type: Number, default: 0 },
    isFreePlan: { type: Boolean, default: false },
    planExpiry: { type: Date, default: null }
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
