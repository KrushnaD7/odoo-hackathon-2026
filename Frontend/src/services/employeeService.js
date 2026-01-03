import api from './api'

export const employeeService = {
  getProfile: async (userId) => {
    const response = await api.get(`/employees/${userId}`)
    return response.data
  },

  updateProfile: async (userId, data) => {
    const response = await api.put(`/employees/${userId}`, data)
    return response.data
  },

  listEmployees: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.department) params.append('department', filters.department)
    if (filters.status) params.append('status', filters.status)
    
    const response = await api.get(`/employees?${params.toString()}`)
    return response.data
  },
}

