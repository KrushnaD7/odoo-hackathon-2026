const attendanceService = require('../services/attendanceService');

const attendanceController = {
  /**
   * Check in
   */
  async checkIn(req, res, next) {
    try {
      const userId = req.user.id;
      const { date } = req.body;

      const attendance = await attendanceService.checkIn(userId, date);

      res.json({
        success: true,
        message: 'Checked in successfully',
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check out
   */
  async checkOut(req, res, next) {
    try {
      const userId = req.user.id;
      const { date } = req.body;

      const attendance = await attendanceService.checkOut(userId, date);

      res.json({
        success: true,
        message: 'Checked out successfully',
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get my attendance
   */
  async getMyAttendance(req, res, next) {
    try {
      const userId = req.user.id;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 30;

      const result = await attendanceService.getUserAttendance(
        userId,
        startDate,
        endDate,
        page,
        limit
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all attendance (Admin/HR)
   */
  async getAllAttendance(req, res, next) {
    try {
      const filters = {
        userId: req.query.employeeId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        status: req.query.status
      };
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 30;

      const result = await attendanceService.getAllAttendance(filters, page, limit);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = attendanceController;

