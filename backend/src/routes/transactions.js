// ================================
// routes/transactions.js
// ================================
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Project = require('../models/ProjectDetails');
const { validateTransaction, validateObjectId } = require('../middleware/validation');

// POST /api/transactions/add - Add a new transaction
router.post('/add', validateTransaction, async (req, res) => {
  try {
    const { projectId, investorAddress, amount, txHash, blockNumber, gasUsed } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ txHash: txHash.toLowerCase() });
    if (existingTransaction) {
      return res.status(409).json({
        success: false,
        message: 'Transaction already recorded'
      });
    }

    // Create new transaction
    const transaction = new Transaction({
      projectId,
      investorAddress: investorAddress.toLowerCase(),
      amount,
      txHash: txHash.toLowerCase(),
      blockNumber,
      gasUsed,
      status: 'confirmed'
    });

    const savedTransaction = await transaction.save();

    // Update project statistics
    const isNewBacker = await Transaction.countDocuments({
      projectId,
      investorAddress: investorAddress.toLowerCase()
    }) === 1;

    await Project.findByIdAndUpdate(projectId, {
      $inc: {
        raised: amount,
        backers: isNewBacker ? 1 : 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: savedTransaction
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Transaction hash already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to record transaction',
      error: error.message
    });
  }
});

// GET /api/transactions/:projectId - Get transactions for a specific project
router.get('/:projectId', validateObjectId, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = '-createdAt',
      status 
    } = req.query;

    // Build filter
    const filter = { projectId: req.params.projectId };
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('projectId', 'title creator')
      .lean();

    // Get total count
    const total = await Transaction.countDocuments(filter);

    // Get transaction statistics
    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          uniqueInvestors: { $addToSet: '$investorAddress' }
        }
      },
      {
        $project: {
          totalAmount: 1,
          totalTransactions: 1,
          uniqueInvestors: { $size: '$uniqueInvestors' }
        }
      }
    ]);

    res.json({
      success: true,
      data: transactions,
      stats: stats[0] || {
        totalAmount: 0,
        totalTransactions: 0,
        uniqueInvestors: 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// GET /api/transactions/investor/:address - Get transactions by investor address
router.get('/investor/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address format'
      });
    }

    const filter = { investorAddress: address.toLowerCase() };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('projectId', 'title creator image status')
      .lean();

    const total = await Transaction.countDocuments(filter);

    // Get investor statistics
    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          projectsSupported: { $addToSet: '$projectId' }
        }
      },
      {
        $project: {
          totalInvested: 1,
          totalTransactions: 1,
          projectsSupported: { $size: '$projectsSupported' }
        }
      }
    ]);

    res.json({
      success: true,
      data: transactions,
      stats: stats[0] || {
        totalInvested: 0,
        totalTransactions: 0,
        projectsSupported: 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching investor transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investor transactions',
      error: error.message
    });
  }
});

// GET /api/transactions/stats/overview - Get transaction statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          uniqueInvestors: { $addToSet: '$investorAddress' },
          averageInvestment: { $avg: '$amount' }
        }
      },
      {
        $project: {
          totalTransactions: 1,
          totalVolume: 1,
          uniqueInvestors: { $size: '$uniqueInvestors' },
          averageInvestment: { $round: ['$averageInvestment', 4] }
        }
      }
    ]);

    // Get daily transaction volume for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyVolume = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          volume: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTransactions: 0,
          totalVolume: 0,
          uniqueInvestors: 0,
          averageInvestment: 0
        },
        dailyVolume
      }
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics',
      error: error.message
    });
  }
});

module.exports = router;