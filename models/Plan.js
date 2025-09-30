const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  tier: {
    type: String,
    enum: ['free', 'medium', 'premium', 'custom'],
    default: 'custom'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  features: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  isListing: {       
    type: Number,
    default: 0
  },
  featureQuota: {    
    type: Number,
    default: 0
  },
  topQuota: {         
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', PlanSchema);
