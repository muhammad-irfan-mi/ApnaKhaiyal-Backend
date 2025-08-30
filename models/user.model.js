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
    akCode: {
      type: String,
      unique: true,
      required: true,
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
    agencyNotes: { type: String, default: "" },
    healthStrategy: { type: String, default: "" },
    localAddress: { type: String, default: "" },
    status: { type: String, default: "inactive" },
    values: { type: String, default: "" },
    address: { type: String, default: "" },
    publicNavigation: { type: String, default: "" },

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

    media: { type: String, default: "" },
    time: { type: String, default: "" },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
