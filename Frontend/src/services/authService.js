import api from './api'

export const authService = {
  signin: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password })
    return response.data
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData)
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

