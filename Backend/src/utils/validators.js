const { body, param, query, validationResult } = require('express-validator');

// Helper to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  next();
};

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength: min 8 chars, at least one uppercase, one lowercase, one number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Auth validators
const signupValidator = [
  body('employee_id')
    .trim()
    .notEmpty().withMessage('Employee ID is required')
    .isLength({ min: 3, max: 50 }).withMessage('Employee ID must be between 3 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .matches(emailRegex).withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(passwordRegex).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['employee', 'hr', 'admin']).withMessage('Invalid role'),
  handleValidationErrors
];

const signinValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Employee validators
const employeeIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid employee ID format'),
  handleValidationErrors
];

const updateProfileValidator = [
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
  handleValidationErrors
];

// Attendance validators
const checkInValidator = [
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),
  handleValidationErrors
];

const attendanceQueryValidator = [
  query('employeeId')
    .optional()
    .isUUID().withMessage('Invalid employee ID format'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Leave validators
const applyLeaveValidator = [
  body('leave_type')
    .notEmpty().withMessage('Leave type is required')
    .isIn(['paid', 'sick', 'unpaid']).withMessage('Invalid leave type'),
  body('start_date')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format. Use YYYY-MM-DD'),
  body('end_date')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format. Use YYYY-MM-DD'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks must be less than 500 characters'),
  handleValidationErrors
];

const leaveIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid leave request ID format'),
  handleValidationErrors
];

const approveLeaveValidator = [
  body('admin_comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Admin comment must be less than 500 characters'),
  handleValidationErrors
];

const leaveQueryValidator = [
  query('employeeId')
    .optional()
    .isUUID().withMessage('Invalid employee ID format'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  handleValidationErrors
];

// Payroll validators
const updateSalaryValidator = [
  body('base_salary')
    .notEmpty().withMessage('Base salary is required')
    .isFloat({ min: 0 }).withMessage('Base salary must be a positive number'),
  body('allowances')
    .optional()
    .isObject().withMessage('Allowances must be an object'),
  body('deductions')
    .optional()
    .isObject().withMessage('Deductions must be an object'),
  body('effective_from')
    .optional()
    .isISO8601().withMessage('Invalid effective date format'),
  handleValidationErrors
];

// Document validators
const documentValidator = [
  body('document_type')
    .trim()
    .notEmpty().withMessage('Document type is required')
    .isLength({ max: 100 }).withMessage('Document type must be less than 100 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  signupValidator,
  signinValidator,
  employeeIdValidator,
  updateProfileValidator,
  checkInValidator,
  attendanceQueryValidator,
  applyLeaveValidator,
  leaveIdValidator,
  approveLeaveValidator,
  leaveQueryValidator,
  updateSalaryValidator,
  documentValidator
};

