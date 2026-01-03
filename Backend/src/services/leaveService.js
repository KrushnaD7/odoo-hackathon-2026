const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const { LEAVE_STATUS, ATTENDANCE_STATUS } = require('../utils/constants');

const leaveService = {
  /**
   * Calculate total days excluding weekends
   */
  calculateTotalDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalDays = 0;

    while (start <= end) {
      const dayOfWeek = start.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      start.setDate(start.getDate() + 1);
    }

    return totalDays;
  },

  /**
   * Apply for leave
   */
  async applyForLeave(userId, leaveData) {
    const { leave_type, start_date, end_date, remarks } = leaveData;

    // Validate date range
    if (new Date(end_date) < new Date(start_date)) {
      const error = new Error('End date must be after start date');
      error.statusCode = 400;
      error.code = 'INVALID_DATE_RANGE';
      throw error;
    }

    // Check for overlapping leaves
    const overlapping = await LeaveRequest.findOverlapping(
      userId,
      start_date,
      end_date
    );

    if (overlapping.length > 0) {
      const error = new Error('Leave request overlaps with existing approved/pending leave');
      error.statusCode = 409;
      error.code = 'OVERLAPPING_LEAVE';
      throw error;
    }

    // Calculate total days
    const total_days = this.calculateTotalDays(start_date, end_date);

    if (total_days <= 0) {
      const error = new Error('Leave period must include at least one working day');
      error.statusCode = 400;
      error.code = 'INVALID_LEAVE_PERIOD';
      throw error;
    }

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      user_id: userId,
      leave_type,
      start_date,
      end_date,
      total_days,
      remarks
    });

    return leaveRequest;
  },

  /**
   * Approve leave
   */
  async approveLeave(leaveId, approverId, adminComment = null) {
    const leaveRequest = await LeaveRequest.findById(leaveId);
    
    if (!leaveRequest) {
      const error = new Error('Leave request not found');
      error.statusCode = 404;
      error.code = 'LEAVE_NOT_FOUND';
      throw error;
    }

    if (leaveRequest.status !== LEAVE_STATUS.PENDING) {
      const error = new Error('Leave request is not pending');
      error.statusCode = 400;
      error.code = 'INVALID_STATUS';
      throw error;
    }

    // Update leave request status
    const updated = await LeaveRequest.updateStatus(
      leaveId,
      LEAVE_STATUS.APPROVED,
      approverId,
      adminComment
    );

    // Update attendance records for approved leave dates
    await Attendance.updateStatusForDateRange(
      leaveRequest.user_id,
      leaveRequest.start_date,
      leaveRequest.end_date,
      ATTENDANCE_STATUS.LEAVE
    );

    return updated;
  },

  /**
   * Reject leave
   */
  async rejectLeave(leaveId, approverId, adminComment = null) {
    const leaveRequest = await LeaveRequest.findById(leaveId);
    
    if (!leaveRequest) {
      const error = new Error('Leave request not found');
      error.statusCode = 404;
      error.code = 'LEAVE_NOT_FOUND';
      throw error;
    }

    if (leaveRequest.status !== LEAVE_STATUS.PENDING) {
      const error = new Error('Leave request is not pending');
      error.statusCode = 400;
      error.code = 'INVALID_STATUS';
      throw error;
    }

    const updated = await LeaveRequest.updateStatus(
      leaveId,
      LEAVE_STATUS.REJECTED,
      approverId,
      adminComment
    );

    return updated;
  },

  /**
   * Get user's leaves
   */
  async getUserLeaves(userId, filters = {}, page = 1, limit = 20) {
    const result = await LeaveRequest.findByUserId(userId, filters, page, limit);
    return result;
  },

  /**
   * Get all leaves (Admin/HR)
   */
  async getAllLeaves(filters = {}, page = 1, limit = 20) {
    const result = await LeaveRequest.findAll(filters, page, limit);
    return result;
  },

  /**
   * Get leave by ID
   */
  async getLeaveById(leaveId, userId, userRole) {
    const leaveRequest = await LeaveRequest.findById(leaveId);
    
    if (!leaveRequest) {
      const error = new Error('Leave request not found');
      error.statusCode = 404;
      error.code = 'LEAVE_NOT_FOUND';
      throw error;
    }

    // Employees can only view their own leaves
    if (userRole === 'employee' && leaveRequest.user_id !== userId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    return leaveRequest;
  }
};

module.exports = leaveService;

