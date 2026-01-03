const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = {
  /**
   * Create a new user
   */
  async create(userData) {
    const {
      employee_id,
      email,
      password_hash,
      role = 'employee',
      verification_token
    } = userData;

    const query = `
      INSERT INTO users (employee_id, email, password_hash, role, verification_token)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, employee_id, email, role, email_verified, created_at
    `;

    const result = await pool.query(query, [
      employee_id,
      email,
      password_hash,
      role,
      verification_token
    ]);

    return result.rows[0];
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const query = `
      SELECT id, employee_id, email, password_hash, role, email_verified, created_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  /**
   * Find user by employee ID
   */
  async findByEmployeeId(employee_id) {
    const query = `
      SELECT id, employee_id, email, role, email_verified
      FROM users
      WHERE employee_id = $1
    `;

    const result = await pool.query(query, [employee_id]);
    return result.rows[0];
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const query = `
      SELECT id, employee_id, email, role, email_verified, created_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  /**
   * Update email verification status
   */
  async verifyEmail(userId) {
    const query = `
      UPDATE users
      SET email_verified = true, verification_token = NULL
      WHERE id = $1
      RETURNING id, email, email_verified
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  /**
   * Update verification token
   */
  async updateVerificationToken(userId, token) {
    const query = `
      UPDATE users
      SET verification_token = $1
      WHERE id = $2
      RETURNING id
    `;

    await pool.query(query, [token, userId]);
  },

  /**
   * Find user by verification token
   */
  async findByVerificationToken(token) {
    const query = `
      SELECT id, email, email_verified
      FROM users
      WHERE verification_token = $1
    `;

    const result = await pool.query(query, [token]);
    return result.rows[0];
  }
};

module.exports = User;

