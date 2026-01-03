const payrollService = require('../services/payrollService');

const payrollController = {
  /**
   * Get my salary
   */
  async getMySalary(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      const salary = await payrollService.getEmployeeSalary(userId, userId, userRole);

      res.json({
        success: true,
        data: salary
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get employee salary (Admin/HR)
   */
  async getEmployeeSalary(req, res, next) {
    try {
      const { employeeId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const salary = await payrollService.getEmployeeSalary(
        employeeId,
        userId,
        userRole
      );

      res.json({
        success: true,
        data: salary
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all salaries (Admin/HR)
   */
  async getAllSalaries(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;

      const result = await payrollService.getAllSalaries(page, limit);

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
   * Update salary (Admin/HR)
   */
  async updateSalary(req, res, next) {
    try {
      const { employeeId } = req.params;
      const salaryData = req.body;

      const updated = await payrollService.updateSalary(employeeId, salaryData);

      res.json({
        success: true,
        message: 'Salary updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = payrollController;

