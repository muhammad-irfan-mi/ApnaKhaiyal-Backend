const mongoose = require("mongoose");

const plotNumberSchema = new mongoose.Schema({
  number: String,
  status: { type: String, enum: ["sell", "pending"], default: "pending" },
  dealerName: { type: String, default: "" },
  dealerContact: { type: String, default: "" }
});
const shopNumberSchema = new mongoose.Schema({
  number: String,
  status: { type: String, enum: ["sell", "pending"], default: "pending" },
  dealerName: { type: String, default: "" },
  dealerContact: { type: String, default: "" }
});

const plotSchema = new mongoose.Schema({
  marla: Number,
  quantity: Number,
  plotNumbers: [plotNumberSchema],
});
const shopSchema = new mongoose.Schema({
  marla: Number,
  quantity: Number,
  shopNumbers: [shopNumberSchema],
});

const phaseImageSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  path: String,
});

const phaseSchema = new mongoose.Schema({
  name: String,
  plots: [plotSchema],
  shops: [shopSchema],
  images: [phaseImageSchema],
  video: String,
});

const townSchema = new mongoose.Schema({
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userId: String,
  name: String,
  desc: String,
  area: String,
  location: String,
  address: String,
  city: String,
  noc: String,
  documents: [String],
  phases: [phaseSchema],
});

module.exports = mongoose.model("Town", townSchema);
