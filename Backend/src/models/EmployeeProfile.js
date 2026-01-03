const pool = require('../config/database');

const EmployeeProfile = {
  /**
   * Create employee profile
   */
  async create(profileData) {
    const {
      user_id,
      first_name,
      last_name,
      phone,
      address,
      profile_picture,
      job_title,
      department,
      hire_date,
      status = 'active'
    } = profileData;

    const query = `
      INSERT INTO employee_profiles 
        (user_id, first_name, last_name, phone, address, profile_picture, 
         job_title, department, hire_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      first_name,
      last_name,
      phone,
      address,
      profile_picture,
      job_title,
      department,
      hire_date,
      status
    ]);

    return result.rows[0];
  },

  /**
   * Get profile by user ID
   */
  async findByUserId(userId) {
    const query = `
      SELECT ep.*, u.email, u.employee_id, u.role
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  /**
   * Get profile by profile ID
   */
  async findById(id) {
    const query = `
      SELECT ep.*, u.email, u.employee_id, u.role
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  /**
   * Update profile
   */
  async update(userId, updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'address', 'profile_picture',
      'job_title', 'department', 'hire_date', 'status'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return await this.findByUserId(userId);
    }

    values.push(userId);
    const query = `
      UPDATE employee_profiles
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * List all employees with pagination
   */
  async findAll(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (filters.department) {
      conditions.push(`ep.department = $${paramCount}`);
      values.push(filters.department);
      paramCount++;
    }

    if (filters.status) {
      conditions.push(`ep.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    values.push(limit, offset);

    const query = `
      SELECT ep.*, u.email, u.employee_id, u.role
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      ${whereClause}
      ORDER BY ep.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM employee_profiles ep
      ${whereClause}
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2))
    ]);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    };
  }
};

module.exports = EmployeeProfile;

