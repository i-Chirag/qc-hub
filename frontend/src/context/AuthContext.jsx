import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/index'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('qc_user')
    const token = localStorage.getItem('qc_token')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const res = await api.login(username, password)
      const userData = { username: res.username }
      localStorage.setItem('qc_token', res.token)
      localStorage.setItem('qc_user', JSON.stringify(userData))
      setUser(userData)
      return true
    } catch (e) {
      console.error('Login failed', e)
      throw e
    }
  }

  const logout = () => {
    localStorage.removeItem('qc_token')
    localStorage.removeItem('qc_user')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
