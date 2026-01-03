const EmployeeProfile = require('../models/EmployeeProfile');
const User = require('../models/User');

const employeeService = {
  /**
   * Get employee profile
   */
  async getProfile(userId, requestingUserId, requestingUserRole) {
    // Employees can only view their own profile
    // Admin/HR can view any profile
    if (requestingUserRole === 'employee' && userId !== requestingUserId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const profile = await EmployeeProfile.findByUserId(userId);
    if (!profile) {
      const error = new Error('Employee profile not found');
      error.statusCode = 404;
      error.code = 'PROFILE_NOT_FOUND';
      throw error;
    }

    return profile;
  },

  /**
   * Update employee profile
   */
  async updateProfile(userId, updateData, requestingUserId, requestingUserRole) {
    // Employees can only update their own profile with limited fields
    // Admin/HR can update any profile with all fields
    if (requestingUserRole === 'employee' && userId !== requestingUserId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // If employee, restrict updatable fields
    if (requestingUserRole === 'employee') {
      const allowedFields = ['phone', 'address', 'profile_picture'];
      const restrictedFields = Object.keys(updateData).filter(
        field => !allowedFields.includes(field)
      );

      if (restrictedFields.length > 0) {
        const error = new Error(`You cannot update: ${restrictedFields.join(', ')}`);
        error.statusCode = 403;
        error.code = 'FIELD_RESTRICTED';
        throw error;
      }
    }

    const updatedProfile = await EmployeeProfile.update(userId, updateData);
    return updatedProfile;
  },

  /**
   * List all employees (Admin/HR only)
   */
  async listEmployees(filters = {}, page = 1, limit = 20) {
    const result = await EmployeeProfile.findAll(page, limit, filters);
    return result;
  }
};

module.exports = employeeService;

