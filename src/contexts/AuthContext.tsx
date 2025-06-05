import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

interface User {
  id: number
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = 'http://localhost:3001/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem('talentai_token')
    const storedUser = localStorage.getItem('talentai_user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      })

      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
      
      // Store in localStorage
      localStorage.setItem('talentai_token', newToken)
      localStorage.setItem('talentai_user', JSON.stringify(userData))
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        email,
        password,
        name
      })

      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
      
      // Store in localStorage
      localStorage.setItem('talentai_token', newToken)
      localStorage.setItem('talentai_user', JSON.stringify(userData))
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    
    // Remove from localStorage
    localStorage.removeItem('talentai_token')
    localStorage.removeItem('talentai_user')
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}