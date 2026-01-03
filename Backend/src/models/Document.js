const pool = require('../config/database');

const Document = {
  /**
   * Create document record
   */
  async create(documentData) {
    const {
      user_id,
      document_type,
      file_path,
      file_name,
      visibility
    } = documentData;

    const query = `
      INSERT INTO documents (user_id, document_type, file_path, file_name, visibility)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      document_type,
      file_path,
      file_name,
      visibility || JSON.stringify(['hr', 'admin'])
    ]);

    return result.rows[0];
  },

  /**
   * Get document by ID
   */
  async findById(id) {
    const query = `
      SELECT d.*, u.employee_id, ep.first_name, ep.last_name
      FROM documents d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE d.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  /**
   * Get user's documents
   */
  async findByUserId(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT *
      FROM documents
      WHERE user_id = $1
      ORDER BY uploaded_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents
      WHERE user_id = $1
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [userId, limit, offset]),
      pool.query(countQuery, [userId])
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
   * Get documents visible to a user based on their role
   */
  async findVisibleDocuments(userId, userRole, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    // Build visibility conditions based on role
    let visibilityCondition = '';
    if (userRole === 'admin') {
      // Admin can see:
      // - All employee documents (uploader role = 'employee')
      // - HR documents with 'admin' in visibility (default for HR docs)
      // - Admin documents with 'hr' in visibility (default for admin docs)
      // - Their own documents
      visibilityCondition = `
        d.user_id = $1
        OR u.role = 'employee'
        OR (u.role = 'hr' AND (d.visibility @> '["admin"]'::jsonb OR d.visibility @> '["hr", "admin"]'::jsonb))
        OR (u.role = 'admin' AND (d.visibility @> '["hr"]'::jsonb OR d.visibility @> '["hr", "admin"]'::jsonb))
      `;
    } else if (userRole === 'hr') {
      // HR can see:
      // - All employee documents (uploader role = 'employee')
      // - HR documents (their own or with 'hr' in visibility)
      // - Admin documents with 'hr' in visibility (default for admin docs)
      // - Their own documents
      visibilityCondition = `
        d.user_id = $1
        OR u.role = 'employee'
        OR (u.role = 'hr' AND (d.visibility @> '["hr"]'::jsonb OR d.visibility @> '["hr", "admin"]'::jsonb))
        OR (u.role = 'admin' AND (d.visibility @> '["hr"]'::jsonb OR d.visibility @> '["hr", "admin"]'::jsonb))
      `;
    } else {
      // Employees can see:
      // - Their own documents
      // - Documents with 'employee' in visibility
      visibilityCondition = `
        d.user_id = $1
        OR d.visibility @> '["employee"]'::jsonb
      `;
    }

    const query = `
      SELECT d.*, u.employee_id, ep.first_name, ep.last_name, u.role as uploader_role
      FROM documents d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE (${visibilityCondition})
      ORDER BY d.uploaded_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE (${visibilityCondition})
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [userId, limit, offset]),
      pool.query(countQuery, [userId])
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
   * Delete document
   */
  async delete(id, userId) {
    const query = `
      DELETE FROM documents
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }
};

module.exports = Document;

