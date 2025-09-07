// middleware/validation.js
// ================================
const { body, param, validationResult } = require('express-validator');

// Validation middleware function
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Project validation rules
const validateProject = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required'),
  body('goal')
    .isFloat({ min: 0.1 })
    .withMessage('Goal must be at least 0.1 ETH'),
  body('daysLeft')
    .isInt({ min: 1 })
    .withMessage('Campaign must run for at least 1 day'),
  body('category')
    .isIn(['Gaming', 'Technology', 'Art', 'Music', 'Film', 'Publishing', 'Fashion', 'Food', 'Sports', 'Education', 'Health', 'Environment', 'Other'])
    .withMessage('Invalid category'),
  body('creator')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Creator name must be between 2 and 50 characters'),
  body('creatorAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address format'),
  handleValidationErrors
];

// Transaction validation rules
const validateTransaction = [
  body('projectId')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('investorAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address format'),
  body('amount')
    .isFloat({ min: 0.001 })
    .withMessage('Minimum investment is 0.001 ETH'),
  body('txHash')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash format'),
  body('blockNumber')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Block number must be a positive integer'),
  body('gasUsed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Gas used must be a positive integer'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('projectId')
    .isMongoId()
    .withMessage('Invalid project ID'),
  handleValidationErrors
];

module.exports = {
  validateProject,
  validateTransaction,
  validateObjectId,
  handleValidationErrors
};