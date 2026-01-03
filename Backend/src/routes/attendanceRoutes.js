const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { checkInValidator, attendanceQueryValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/check-in', checkInValidator, attendanceController.checkIn);
router.post('/check-out', checkInValidator, attendanceController.checkOut);
router.get('/my-attendance', attendanceQueryValidator, attendanceController.getMyAttendance);

// Admin/HR routes
router.get('/', authorize('admin', 'hr'), attendanceQueryValidator, attendanceController.getAllAttendance);

module.exports = router;

