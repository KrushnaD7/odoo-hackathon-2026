const pool = require('../config/database');

const Attendance = {
  /**
   * Create or update attendance record
   */
  async upsert(attendanceData) {
    const { user_id, date, check_in_time, check_out_time, status } = attendanceData;

    const query = `
      INSERT INTO attendance (user_id, date, check_in_time, check_out_time, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        check_in_time = COALESCE(EXCLUDED.check_in_time, attendance.check_in_time),
        check_out_time = COALESCE(EXCLUDED.check_out_time, attendance.check_out_time),
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      date,
      check_in_time,
      check_out_time,
      status
    ]);

    return result.rows[0];
  },

  /**
   * Get attendance by user and date
   */
  async findByUserAndDate(userId, date) {
    const query = `
      SELECT *
      FROM attendance
      WHERE user_id = $1 AND date = $2
    `;

    const result = await pool.query(query, [userId, date]);
    return result.rows[0];
  },

  /**
   * Get user's attendance records
   */
  async findByUserId(userId, startDate, endDate, page = 1, limit = 30) {
    const offset = (page - 1) * limit;
    const conditions = ['a.user_id = $1'];
    const values = [userId];
    let paramCount = 2;

    if (startDate) {
      conditions.push(`a.date >= $${paramCount}`);
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      conditions.push(`a.date <= $${paramCount}`);
      values.push(endDate);
      paramCount++;
    }

    values.push(limit, offset);

    const query = `
      SELECT a.*, ep.first_name, ep.last_name, u.employee_id
      FROM attendance a
      JOIN employee_profiles ep ON a.user_id = ep.user_id
      JOIN users u ON a.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.date DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM attendance a
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
   * Get all attendance records (for Admin/HR)
   */
  async findAll(filters = {}, page = 1, limit = 30) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (filters.userId) {
      conditions.push(`a.user_id = $${paramCount}`);
      values.push(filters.userId);
      paramCount++;
    }

    if (filters.startDate) {
      conditions.push(`a.date >= $${paramCount}`);
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      conditions.push(`a.date <= $${paramCount}`);
      values.push(filters.endDate);
      paramCount++;
    }

    if (filters.status) {
      conditions.push(`a.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    values.push(limit, offset);

    const query = `
      SELECT a.*, ep.first_name, ep.last_name, u.employee_id, u.email
      FROM attendance a
      JOIN employee_profiles ep ON a.user_id = ep.user_id
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.date DESC, ep.first_name ASC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM attendance a
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
   * Update attendance status for leave dates
   */
  async updateStatusForDateRange(userId, startDate, endDate, status) {
    const query = `
      UPDATE attendance
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
        AND date >= $3
        AND date <= $4
      RETURNING *
    `;

    const result = await pool.query(query, [status, userId, startDate, endDate]);
    return result.rows;
  }
};

module.exports = Attendance;

