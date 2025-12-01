'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/config/supabase'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          // Sync token with API client
          if (session.access_token) {
            apiClient.setAuthToken(session.access_token)
            localStorage.setItem('accessToken', session.access_token)
          }
          if (session.refresh_token) {
            localStorage.setItem('refreshToken', session.refresh_token)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          apiClient.removeAuthToken()
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        if (session.access_token) {
          apiClient.setAuthToken(session.access_token)
          localStorage.setItem('accessToken', session.access_token)
        }
        if (session.refresh_token) {
          localStorage.setItem('refreshToken', session.refresh_token)
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        setUser(data.session.user)
        if (data.session.access_token) {
          apiClient.setAuthToken(data.session.access_token)
          localStorage.setItem('accessToken', data.session.access_token)
        }
        if (data.session.refresh_token) {
          localStorage.setItem('refreshToken', data.session.refresh_token)
        }
        router.push('/')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) throw error

      if (data.session) {
        setUser(data.session.user)
        if (data.session.access_token) {
          apiClient.setAuthToken(data.session.access_token)
          localStorage.setItem('accessToken', data.session.access_token)
        }
        router.push('/')
      } else {
        // Email confirmation required
        router.push('/auth/verify-email')
      }
    } catch (error: any) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      apiClient.removeAuthToken()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

