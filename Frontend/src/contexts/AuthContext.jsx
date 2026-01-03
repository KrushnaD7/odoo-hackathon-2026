import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        // Verify token is still valid
        api.get('/auth/me')
          .then((response) => {
            setUser(response.data.data)
            localStorage.setItem('user', JSON.stringify(response.data.data))
          })
          .catch(() => {
            // Token invalid, clear storage
            logout()
          })
          .finally(() => setLoading(false))
      } catch (error) {
        logout()
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password })
      // Backend returns: { success: true, message: "...", data: { user: {...}, token: "..." } }
      const { token, user: userData } = response.data.data
      
      if (!token || !userData) {
        console.error('Invalid response structure:', response.data)
        return {
          success: false,
          error: 'Invalid response from server'
        }
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (error) {
      // Handle network errors (backend not running)
      if (!error.response) {
        console.error('Network error - is backend running?', error.message)
        return {
          success: false,
          error: 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000'
        }
      }
      
      // Handle rate limiting (429) with a user-friendly message
      if (error.response?.status === 429) {
        // Axios normalizes headers, so check both lowercase and normalized versions
        const retryAfter = error.response?.headers?.['retry-after'] || 
                          error.response?.headers?.['Retry-After'] ||
                          error.response?.headers?.retryafter
        const message = retryAfter 
          ? `Too many requests. Please try again in ${retryAfter} seconds.`
          : 'Too many login attempts. Please wait a moment and try again.'
        return {
          success: false,
          error: message
        }
      }
      
      // Handle other errors
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed'
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData)
      // Backend returns: { success: true, message: "...", data: user }
      return { success: true, data: response.data.data }
    } catch (error) {
      // Handle network errors (backend not running)
      if (!error.response) {
        console.error('Network error - is backend running?', error.message)
        return {
          success: false,
          error: 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000'
        }
      }
      
      // Handle rate limiting (429) with a user-friendly message
      if (error.response?.status === 429) {
        // Axios normalizes headers, so check both lowercase and normalized versions
        const retryAfter = error.response?.headers?.['retry-after'] || 
                          error.response?.headers?.['Retry-After'] ||
                          error.response?.headers?.retryafter
        const message = retryAfter 
          ? `Too many requests. Please try again in ${retryAfter} seconds.`
          : 'Too many signup attempts. Please wait a moment and try again.'
        return {
          success: false,
          error: message
        }
      }
      
      // Handle other errors
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Signup failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'hr',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

