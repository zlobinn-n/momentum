import { User } from '@prisma/client'
import { useState, useCallback, useEffect } from 'react'

interface AuthState {
  user: User | null
  token: string | null
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setAuth({ token, user })
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = useCallback(async (login: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login, password })
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setAuth({ token: data.token, user: data.user })
      return data
    } else {
      throw new Error(data.error)
    }
  }, [])

  const register = useCallback(async (login: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login, password, name })
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setAuth({ token: data.token, user: data.user })
      return data
    } else {
      throw new Error(data.error)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth({ token: null, user: null })
  }, [])

  return {
    user: auth.user,
    token: auth.token,
    login,
    register,
    logout,
    isAuthenticated: !!auth.token,
    loading
  }
}