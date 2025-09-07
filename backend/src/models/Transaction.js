const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  investorAddress: {
    type: String,
    required: [true, 'Investor address is required'],
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'],
    lowercase: true
  },
  amount: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: [0.001, 'Minimum investment is 0.001 ETH']
  },
  txHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
    unique: true,
    match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format'],
    lowercase: true
  },
  blockNumber: {
    type: Number,
    min: [0, 'Block number cannot be negative']
  },
  gasUsed: {
    type: Number,
    min: [0, 'Gas used cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ projectId: 1, createdAt: -1 });
transactionSchema.index({ investorAddress: 1 });
transactionSchema.index({ txHash: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', transactionSchema);