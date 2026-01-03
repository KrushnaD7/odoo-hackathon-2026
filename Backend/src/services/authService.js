const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const { hashPassword, comparePassword } = require('../utils/hasher');
const { generateToken } = require('../config/jwt');
const { sendVerificationEmail } = require('../utils/emailService');
const { v4: uuidv4 } = require('uuid');

const authService = {
  /**
   * Sign up a new user
   */
  async signup(userData) {
    const { employee_id, email, password, role = 'employee', ...profileData } = userData;

    // Check if email already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    // Check if employee_id already exists
    const existingUserByEmployeeId = await User.findByEmployeeId(employee_id);
    if (existingUserByEmployeeId) {
      const error = new Error('Employee ID already exists');
      error.statusCode = 409;
      error.code = 'EMPLOYEE_ID_EXISTS';
      throw error;
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate verification token
    const verification_token = uuidv4();

    // Create user
    const user = await User.create({
      employee_id,
      email,
      password_hash,
      role,
      verification_token
    });

    // Create employee profile if profile data provided
    if (profileData.first_name || profileData.last_name) {
      await EmployeeProfile.create({
        user_id: user.id,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone,
        address: profileData.address,
        profile_picture: profileData.profile_picture,
        job_title: profileData.job_title,
        department: profileData.department,
        hire_date: profileData.hire_date
      });
    }

    // Send verification email (optional)
    try {
      await sendVerificationEmail(email, verification_token);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail the signup if email fails
    }

    // Don't return sensitive data
    const { password_hash: _, ...userWithoutHash } = user;
    return userWithoutHash;
  },

  /**
   * Sign in user
   */
  async signin(email, password) {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      employee_id: user.employee_id,
      role: user.role,
      email: user.email
    });

    // Return user info and token
    return {
      user: {
        id: user.id,
        employee_id: user.employee_id,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified
      },
      token
    };
  },

  /**
   * Verify email
   */
  async verifyEmail(token) {
    const user = await User.findByVerificationToken(token);
    if (!user) {
      const error = new Error('Invalid verification token');
      error.statusCode = 400;
      error.code = 'INVALID_TOKEN';
      throw error;
    }

    if (user.email_verified) {
      return { message: 'Email already verified' };
    }

    await User.verifyEmail(user.id);
    return { message: 'Email verified successfully' };
  }
};

module.exports = authService;

