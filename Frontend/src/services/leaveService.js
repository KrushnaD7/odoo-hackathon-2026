import api from './api'

export const leaveService = {
  applyLeave: async (leaveData) => {
    const response = await api.post('/leaves', leaveData)
    return response.data
  },

  getMyLeaves: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await api.get(`/leaves/my-leaves?${params.toString()}`)
    return response.data
  },

  getAllLeaves: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.employeeId) params.append('employeeId', filters.employeeId)
    if (filters.status) params.append('status', filters.status)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await api.get(`/leaves?${params.toString()}`)
    return response.data
  },

  approveLeave: async (leaveId, adminComment = null) => {
    const response = await api.patch(`/leaves/${leaveId}/approve`, { admin_comment: adminComment })
    return response.data
  },

  rejectLeave: async (leaveId, adminComment = null) => {
    const response = await api.patch(`/leaves/${leaveId}/reject`, { admin_comment: adminComment })
    return response.data
  },
}

