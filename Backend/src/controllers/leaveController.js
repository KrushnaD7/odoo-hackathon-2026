const leaveService = require('../services/leaveService');

const leaveController = {
  /**
   * Apply for leave
   */
  async applyForLeave(req, res, next) {
    try {
      const userId = req.user.id;
      const leaveData = req.body;

      const leaveRequest = await leaveService.applyForLeave(userId, leaveData);

      res.status(201).json({
        success: true,
        message: 'Leave request submitted successfully',
        data: leaveRequest
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get my leaves
   */
  async getMyLeaves(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;

      const result = await leaveService.getUserLeaves(userId, filters, page, limit);

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
   * Get all leaves (Admin/HR)
   */
  async getAllLeaves(req, res, next) {
    try {
      const filters = {
        userId: req.query.employeeId,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;

      const result = await leaveService.getAllLeaves(filters, page, limit);

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
   * Approve leave
   */
  async approveLeave(req, res, next) {
    try {
      const { id } = req.params;
      const approverId = req.user.id;
      const { admin_comment } = req.body;

      const leaveRequest = await leaveService.approveLeave(id, approverId, admin_comment);

      res.json({
        success: true,
        message: 'Leave request approved',
        data: leaveRequest
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reject leave
   */
  async rejectLeave(req, res, next) {
    try {
      const { id } = req.params;
      const approverId = req.user.id;
      const { admin_comment } = req.body;

      const leaveRequest = await leaveService.rejectLeave(id, approverId, admin_comment);

      res.json({
        success: true,
        message: 'Leave request rejected',
        data: leaveRequest
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = leaveController;

