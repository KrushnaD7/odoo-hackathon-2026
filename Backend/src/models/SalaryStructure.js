const pool = require('../config/database');

const SalaryStructure = {
  /**
   * Create salary structure
   */
  async create(salaryData) {
    const {
      user_id,
      base_salary,
      allowances,
      deductions,
      effective_from
    } = salaryData;

    const query = `
      INSERT INTO salary_structure 
        (user_id, base_salary, allowances, deductions, effective_from)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      base_salary,
      JSON.stringify(allowances || {}),
      JSON.stringify(deductions || {}),
      effective_from || new Date().toISOString().split('T')[0]
    ]);

    return {
      ...result.rows[0],
      allowances: typeof result.rows[0].allowances === 'string'
        ? JSON.parse(result.rows[0].allowances)
        : result.rows[0].allowances,
      deductions: typeof result.rows[0].deductions === 'string'
        ? JSON.parse(result.rows[0].deductions)
        : result.rows[0].deductions
    };
  },

  /**
   * Get salary by user ID
   */
  async findByUserId(userId) {
    const query = `
      SELECT ss.*, u.employee_id, u.email, ep.first_name, ep.last_name
      FROM salary_structure ss
      JOIN users u ON ss.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE ss.user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const salary = result.rows[0];
    return {
      ...salary,
      allowances: typeof salary.allowances === 'string'
        ? JSON.parse(salary.allowances)
        : salary.allowances || {},
      deductions: typeof salary.deductions === 'string'
        ? JSON.parse(salary.deductions)
        : salary.deductions || {}
    };
  },

  /**
   * Update salary structure
   */
  async update(userId, updateData) {
    const {
      base_salary,
      allowances,
      deductions,
      effective_from
    } = updateData;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (base_salary !== undefined) {
      updates.push(`base_salary = $${paramCount}`);
      values.push(base_salary);
      paramCount++;
    }

    if (allowances !== undefined) {
      updates.push(`allowances = $${paramCount}`);
      values.push(JSON.stringify(allowances));
      paramCount++;
    }

    if (deductions !== undefined) {
      updates.push(`deductions = $${paramCount}`);
      values.push(JSON.stringify(deductions));
      paramCount++;
    }

    if (effective_from !== undefined) {
      updates.push(`effective_from = $${paramCount}`);
      values.push(effective_from);
      paramCount++;
    }

    if (updates.length === 0) {
      return await this.findByUserId(userId);
    }

    values.push(userId);
    const query = `
      UPDATE salary_structure
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    const salary = result.rows[0];
    return {
      ...salary,
      allowances: typeof salary.allowances === 'string'
        ? JSON.parse(salary.allowances)
        : salary.allowances || {},
      deductions: typeof salary.deductions === 'string'
        ? JSON.parse(salary.deductions)
        : salary.deductions || {}
    };
  },

  /**
   * Get all salary structures (for Admin/HR)
   */
  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT ss.*, u.employee_id, u.email, ep.first_name, ep.last_name
      FROM salary_structure ss
      JOIN users u ON ss.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ORDER BY ep.first_name ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM salary_structure
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    const data = result.rows.map(row => ({
      ...row,
      allowances: typeof row.allowances === 'string'
        ? JSON.parse(row.allowances)
        : row.allowances || {},
      deductions: typeof row.deductions === 'string'
        ? JSON.parse(row.deductions)
        : row.deductions || {}
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    };
  }
};

module.exports = SalaryStructure;

