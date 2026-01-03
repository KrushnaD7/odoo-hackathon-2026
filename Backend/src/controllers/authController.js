const authService = require('../services/authService');

const authController = {
  /**
   * Sign up
   */
  async signup(req, res, next) {
    try {
      const userData = req.body;
      const user = await authService.signup(userData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Sign in
   */
  async signin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.signin(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user
   */
  async getMe(req, res, next) {
    try {
      res.json({
        success: true,
        data: {
          id: req.user.id,
          employee_id: req.user.employee_id,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;

