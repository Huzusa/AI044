'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getCurrentUser } from '@/utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('inkscribe_token')
      if (!token) {
        setLoading(false)
        return
      }

      const data = await getCurrentUser()
      if (data.ok) {
        setUser(data.user)
      } else {
        localStorage.removeItem('inkscribe_token')
      }
    } catch {
      localStorage.removeItem('inkscribe_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const { res, result } = await apiLogin({ username, password })
      if (result.ok) {
        localStorage.setItem('inkscribe_token', result.access_token)
        setUser(result.user)
        return { ok: true }
      }
      return { ok: false, error: result.error || '登录失败' }
    } catch (e) {
      return { ok: false, error: '网络错误，请稍后重试' }
    }
  }

  const register = async (username, password, email) => {
    try {
      const { res, result } = await apiRegister({ username, password, email })
      if (result.ok) {
        return { ok: true }
      }
      return { ok: false, error: result.error || '注册失败' }
    } catch (e) {
      return { ok: false, error: '网络错误，请稍后重试' }
    }
  }

  const logout = () => {
    localStorage.removeItem('inkscribe_token')
    setUser(null)
  }

  const getToken = () => localStorage.getItem('inkscribe_token')

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
