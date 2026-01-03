const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { employeeIdValidator, updateProfileValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Get employee profile (employees can view own, admin/hr can view any)
router.get('/:id', employeeIdValidator, employeeController.getProfile);

// Update employee profile (employees can update limited fields of own, admin/hr can update any)
router.put('/:id', employeeIdValidator, updateProfileValidator, employeeController.updateProfile);

// List all employees (Admin/HR only)
router.get('/', authorize('admin', 'hr'), employeeController.listEmployees);

module.exports = router;

