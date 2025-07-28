const mongoose = require('mongoose');

const DisplayOffer = new mongoose.Schema({
  name: String,
  cell: String,
  email: String,
  city: String,
  address: String,
  businessType: String,
 category: {
    type: String,
    enum: ['town', 'marketing', 'property', 'inspection', 'developer', 'map', 'architecture', 'photographer']
  },
  designImageUrl: String,
  paymentSlipUrl: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: Date }
});

module.exports = mongoose.model('DisplayOffer', DisplayOffer);
