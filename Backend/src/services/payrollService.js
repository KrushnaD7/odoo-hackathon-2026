const SalaryStructure = require('../models/SalaryStructure');
const User = require('../models/User');

const payrollService = {
  /**
   * Calculate net salary
   */
  calculateNetSalary(baseSalary, allowances = {}, deductions = {}) {
    const totalAllowances = Object.values(allowances).reduce(
      (sum, amount) => sum + parseFloat(amount || 0),
      0
    );
    
    const totalDeductions = Object.values(deductions).reduce(
      (sum, amount) => sum + parseFloat(amount || 0),
      0
    );

    const netSalary = parseFloat(baseSalary) + totalAllowances - totalDeductions;

    return {
      base_salary: parseFloat(baseSalary),
      total_allowances: totalAllowances,
      total_deductions: totalDeductions,
      net_salary: netSalary
    };
  },

  /**
   * Get employee salary
   */
  async getEmployeeSalary(userId, requestingUserId, requestingUserRole) {
    // Employees can only view their own salary
    if (requestingUserRole === 'employee' && userId !== requestingUserId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const salaryStructure = await SalaryStructure.findByUserId(userId);
    
    if (!salaryStructure) {
      const error = new Error('Salary structure not found');
      error.statusCode = 404;
      error.code = 'SALARY_NOT_FOUND';
      throw error;
    }

    const calculation = this.calculateNetSalary(
      salaryStructure.base_salary,
      salaryStructure.allowances,
      salaryStructure.deductions
    );

    return {
      ...salaryStructure,
      ...calculation
    };
  },

  /**
   * Update salary structure (Admin/HR only)
   */
  async updateSalary(userId, salaryData) {
    // Check if salary structure exists
    const existing = await SalaryStructure.findByUserId(userId);
    
    if (!existing) {
      // Create new salary structure
      const newSalary = await SalaryStructure.create({
        user_id: userId,
        ...salaryData
      });

      const calculation = this.calculateNetSalary(
        newSalary.base_salary,
        newSalary.allowances,
        newSalary.deductions
      );

      return {
        ...newSalary,
        ...calculation
      };
    }

    // Update existing
    const updated = await SalaryStructure.update(userId, salaryData);

    const calculation = this.calculateNetSalary(
      updated.base_salary,
      updated.allowances,
      updated.deductions
    );

    return {
      ...updated,
      ...calculation
    };
  },

  /**
   * Get all salaries (Admin/HR only)
   */
  async getAllSalaries(page = 1, limit = 20) {
    const result = await SalaryStructure.findAll(page, limit);
    
    // Add calculations for each salary
    const data = result.data.map(salary => ({
      ...salary,
      ...this.calculateNetSalary(
        salary.base_salary,
        salary.allowances,
        salary.deductions
      )
    }));

    return {
      data,
      pagination: result.pagination
    };
  }
};

module.exports = payrollService;

