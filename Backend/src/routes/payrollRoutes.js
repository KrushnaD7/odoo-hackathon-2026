const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { updateSalaryValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Employee routes
router.get('/my-salary', payrollController.getMySalary);

// Admin/HR routes
router.get('/', authorize('admin', 'hr'), payrollController.getAllSalaries);
router.get('/:employeeId', authorize('admin', 'hr'), payrollController.getEmployeeSalary);
router.put('/:employeeId', authorize('admin', 'hr'), updateSalaryValidator, payrollController.updateSalary);

module.exports = router;

