const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  applyLeaveValidator,
  leaveIdValidator,
  approveLeaveValidator,
  leaveQueryValidator
} = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/', applyLeaveValidator, leaveController.applyForLeave);
router.get('/my-leaves', leaveQueryValidator, leaveController.getMyLeaves);

// Admin/HR routes - must come after /my-leaves to avoid route conflicts
router.get('/', authorize('admin', 'hr'), leaveQueryValidator, leaveController.getAllLeaves);
router.patch('/:id/approve', authorize('admin', 'hr'), leaveIdValidator, approveLeaveValidator, leaveController.approveLeave);
router.patch('/:id/reject', authorize('admin', 'hr'), leaveIdValidator, approveLeaveValidator, leaveController.rejectLeave);

module.exports = router;

