import api from './api'

export const attendanceService = {
  checkIn: async (date = null) => {
    const response = await api.post('/attendance/check-in', date ? { date } : {})
    return response.data
  },

  checkOut: async (date = null) => {
    const response = await api.post('/attendance/check-out', date ? { date } : {})
    return response.data
  },

  getMyAttendance: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await api.get(`/attendance/my-attendance?${params.toString()}`)
    return response.data
  },

  getAllAttendance: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.employeeId) params.append('employeeId', filters.employeeId)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.status) params.append('status', filters.status)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await api.get(`/attendance?${params.toString()}`)
    return response.data
  },
}

