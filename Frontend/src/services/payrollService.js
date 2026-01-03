import api from './api'

export const payrollService = {
  getMySalary: async () => {
    const response = await api.get('/payroll/my-salary')
    return response.data
  },

  getAllSalaries: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await api.get(`/payroll?${params.toString()}`)
    return response.data
  },

  getEmployeeSalary: async (employeeId) => {
    const response = await api.get(`/payroll/${employeeId}`)
    return response.data
  },

  updateSalary: async (employeeId, salaryData) => {
    const response = await api.put(`/payroll/${employeeId}`, salaryData)
    return response.data
  },
}

