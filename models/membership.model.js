const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, enum: ["free", "medium", "premium"], required: true },
  firstName: String,
  companyName: String,
  address: String,
  phone: String,
  email: String,
  slipUrl: String,
  planKey: { type: String, unique: true, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

const Membership = mongoose.model("Membership", membershipSchema);
module.exports = Membership;
