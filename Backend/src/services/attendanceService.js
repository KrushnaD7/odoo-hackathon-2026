const Attendance = require('../models/Attendance');
const { ATTENDANCE_STATUS } = require('../utils/constants');

const attendanceService = {
  /**
   * Calculate attendance status based on check-in/out times
   */
  calculateStatus(checkInTime, checkOutTime) {
    if (!checkInTime) {
      return ATTENDANCE_STATUS.ABSENT;
    }

    if (!checkOutTime) {
      return ATTENDANCE_STATUS.HALF_DAY;
    }

    // Calculate hours worked
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);

    if (hoursWorked < 4) {
      return ATTENDANCE_STATUS.HALF_DAY;
    }

    return ATTENDANCE_STATUS.PRESENT;
  },

  /**
   * Check in
   */
  async checkIn(userId, date = null) {
    const checkInDate = date || new Date().toISOString().split('T')[0];
    const checkInTime = new Date();

    // Check if already checked in today
    const existing = await Attendance.findByUserAndDate(userId, checkInDate);
    if (existing && existing.check_in_time) {
      const error = new Error('Already checked in for this date');
      error.statusCode = 409;
      error.code = 'ALREADY_CHECKED_IN';
      throw error;
    }

    const status = this.calculateStatus(checkInTime.toISOString(), null);

    const attendance = await Attendance.upsert({
      user_id: userId,
      date: checkInDate,
      check_in_time: checkInTime.toISOString(),
      check_out_time: null,
      status
    });

    return attendance;
  },

  /**
   * Check out
   */
  async checkOut(userId, date = null) {
    const checkOutDate = date || new Date().toISOString().split('T')[0];
    const checkOutTime = new Date();

    // Find today's attendance
    const existing = await Attendance.findByUserAndDate(userId, checkOutDate);
    if (!existing) {
      const error = new Error('No check-in found for this date');
      error.statusCode = 404;
      error.code = 'NO_CHECK_IN';
      throw error;
    }

    if (existing.check_out_time) {
      const error = new Error('Already checked out for this date');
      error.statusCode = 409;
      error.code = 'ALREADY_CHECKED_OUT';
      throw error;
    }

    const status = this.calculateStatus(
      existing.check_in_time,
      checkOutTime.toISOString()
    );

    const attendance = await Attendance.upsert({
      user_id: userId,
      date: checkOutDate,
      check_in_time: existing.check_in_time,
      check_out_time: checkOutTime.toISOString(),
      status
    });

    return attendance;
  },

  /**
   * Get user's attendance
   */
  async getUserAttendance(userId, startDate, endDate, page = 1, limit = 30) {
    const result = await Attendance.findByUserId(
      userId,
      startDate,
      endDate,
      page,
      limit
    );
    return result;
  },

  /**
   * Get all attendance (Admin/HR)
   */
  async getAllAttendance(filters = {}, page = 1, limit = 30) {
    const result = await Attendance.findAll(filters, page, limit);
    return result;
  }
};

module.exports = attendanceService;

