// models/Project.js
// ================================
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  fullDescription: {
    type: String,
    trim: true,
    maxlength: [5000, 'Full description cannot exceed 5000 characters']
  },
  image: {
    type: String,
    required: [true, 'Project image is required'],
    trim: true
  },
  goal: {
    type: Number,
    required: [true, 'Funding goal is required'],
    min: [0.1, 'Goal must be at least 0.1 ETH']
  },
  raised: {
    type: Number,
    default: 0,
    min: [0, 'Raised amount cannot be negative']
  },
  backers: {
    type: Number,
    default: 0,
    min: [0, 'Number of backers cannot be negative']
  },
  daysLeft: {
    type: Number,
    required: [true, 'Campaign duration is required'],
    min: [1, 'Campaign must run for at least 1 day']
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: [
      'Gaming', 'Technology', 'Art', 'Music', 'Film',
      'Publishing', 'Fashion', 'Food', 'Sports',
      'Education', 'Health', 'Environment', 'Other'
    ],
    trim: true
  },
  creator: {
    type: String,
    required: [true, 'Creator name is required'],
    trim: true,
    maxlength: [50, 'Creator name cannot exceed 50 characters']
  },
  status: {
    type: String,
    enum: ['active', 'funded', 'expired'],
    default: 'active'
  },
  walletAddress: {
    type: String,
    trim: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format']
  },
  contractAddress: {
    type: String,
    trim: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address format']
  },
  updates: [{
    date: { type: Date, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true }
  }],
  rewards: [{
    amount: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for frontend `id`
projectSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Virtual for funding progress percentage
projectSchema.virtual('progressPercentage').get(function () {
  return Math.min((this.raised / this.goal) * 100, 100);
});

// Virtual for checking if goal is reached
projectSchema.virtual('isGoalReached').get(function () {
  return this.raised >= this.goal;
});

// Indexes for performance
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ category: 1 });
projectSchema.index({ creator: 1 });

module.exports = mongoose.model('Project', projectSchema);
