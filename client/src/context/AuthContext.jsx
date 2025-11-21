import { createContext, useContext, useState, useEffect } from 'react'
import axios from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
      // The axios interceptor will handle the token automatically
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    // The axios interceptor will handle the token automatically
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // The axios interceptor will handle token removal automatically
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await axios.get('/auth/me')
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
