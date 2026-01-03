const employeeService = require('../services/employeeService');

const employeeController = {
  /**
   * Get employee profile
   */
  async getProfile(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const profile = await employeeService.getProfile(id, userId, userRole);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update employee profile
   */
  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const updatedProfile = await employeeService.updateProfile(
        id,
        updateData,
        userId,
        userRole
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * List all employees
   */
  async listEmployees(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const filters = {
        department: req.query.department,
        status: req.query.status
      };

      const result = await employeeService.listEmployees(filters, page, limit);

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

module.exports = employeeController;

