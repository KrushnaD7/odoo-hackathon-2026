const pool = require('../config/database');

const LeaveRequest = {
  /**
   * Create leave request
   */
  async create(leaveData) {
    const {
      user_id,
      leave_type,
      start_date,
      end_date,
      total_days,
      remarks
    } = leaveData;

    const query = `
      INSERT INTO leave_requests 
        (user_id, leave_type, start_date, end_date, total_days, remarks)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      leave_type,
      start_date,
      end_date,
      total_days,
      remarks
    ]);

    return result.rows[0];
  },

  /**
   * Find leave request by ID
   */
  async findById(id) {
    const query = `
      SELECT lr.*, 
             ep.first_name, ep.last_name, u.employee_id, u.email,
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name
      FROM leave_requests lr
      JOIN employee_profiles ep ON lr.user_id = ep.user_id
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN users approver_user ON lr.approved_by = approver_user.id
      LEFT JOIN employee_profiles approver ON approver_user.id = approver.user_id
      WHERE lr.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  /**
   * Get user's leave requests
   */
  async findByUserId(userId, filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = ['lr.user_id = $1'];
    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      conditions.push(`lr.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    if (filters.startDate) {
      conditions.push(`lr.start_date >= $${paramCount}`);
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      conditions.push(`lr.end_date <= $${paramCount}`);
      values.push(filters.endDate);
      paramCount++;
    }

    values.push(limit, offset);

    const query = `
      SELECT lr.*, ep.first_name, ep.last_name, u.employee_id
      FROM leave_requests lr
      JOIN employee_profiles ep ON lr.user_id = ep.user_id
      JOIN users u ON lr.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY lr.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM leave_requests lr
      WHERE ${conditions.join(' AND ')}
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
  },

  /**
   * Get all leave requests (for Admin/HR)
   */
  async findAll(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (filters.userId) {
      conditions.push(`lr.user_id = $${paramCount}`);
      values.push(filters.userId);
      paramCount++;
    }

    if (filters.status) {
      conditions.push(`lr.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    if (filters.startDate) {
      conditions.push(`lr.start_date >= $${paramCount}`);
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      conditions.push(`lr.end_date <= $${paramCount}`);
      values.push(filters.endDate);
      paramCount++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    values.push(limit, offset);

    const query = `
      SELECT lr.*, ep.first_name, ep.last_name, u.employee_id, u.email
      FROM leave_requests lr
      JOIN employee_profiles ep ON lr.user_id = ep.user_id
      JOIN users u ON lr.user_id = u.id
      ${whereClause}
      ORDER BY lr.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM leave_requests lr
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
  },

  /**
   * Update leave request status
   */
  async updateStatus(id, status, approvedBy, adminComment) {
    const query = `
      UPDATE leave_requests
      SET status = $1,
          approved_by = $2,
          admin_comment = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [
      status,
      approvedBy,
      adminComment,
      id
    ]);

    return result.rows[0];
  },

  /**
   * Check for overlapping leave requests
   */
  async findOverlapping(userId, startDate, endDate, excludeId = null) {
    const conditions = [
      'user_id = $1',
      'status != $2',
      '((start_date <= $3 AND end_date >= $3) OR (start_date <= $4 AND end_date >= $4) OR (start_date >= $3 AND end_date <= $4))'
    ];
    const values = [userId, 'rejected', startDate, endDate];

    if (excludeId) {
      conditions.push('id != $5');
      values.push(excludeId);
    }

    const query = `
      SELECT *
      FROM leave_requests
      WHERE ${conditions.join(' AND ')}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }
};

module.exports = LeaveRequest;

