'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowLeft, Home, Key, User } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import Link from 'next/link'

interface TestUser {
  id: string
  email: string
  name: string
  username: string
  company: string
  role: string
  verified: boolean
  createdAt: string
  lastLogin: string
}

export default function SandboxSuccessPage() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string>('')
  const [user, setUser] = useState<TestUser | null>(null)

  useEffect(() => {
    if (!searchParams) return
    
    const tokenParam = searchParams.get('token')
    const userParam = searchParams.get('user')

    if (tokenParam) {
      setToken(tokenParam)
      // Store in localStorage for testing
      localStorage.setItem('sandbox_token', tokenParam)
    }

    if (userParam) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userParam))
        setUser(decodedUser)
        // Store in localStorage for testing
        localStorage.setItem('sandbox_user', JSON.stringify(decodedUser))
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Login Successful!
          </h1>
          <p className="text-gray-600 mb-8">
            Your sandbox login test was successful. The authentication flow is working correctly.
          </p>

          {/* Token Display */}
          {token && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center mb-2">
                <Key className="w-4 h-4 text-blue-600 mr-2" />
                <h3 className="text-sm font-semibold text-blue-900">Authentication Token</h3>
              </div>
              <div className="bg-white rounded p-2 border border-blue-200">
                <code className="text-xs text-blue-700 break-all font-mono">
                  {token}
                </code>
              </div>
            </div>
          )}

          {/* User Data Display */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center mb-3">
                <User className="w-4 h-4 text-gray-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-900">Test User Data</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="text-gray-900 font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Username:</span>
                  <span className="text-gray-900">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Company:</span>
                  <span className="text-gray-900">{user.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="text-gray-900">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified:</span>
                  <span className={`font-semibold ${user.verified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.verified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/sandbox">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sandbox
              </Button>
            </Link>
            
            <Link href="/sandbox/integration-guide">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                View Integration Guide
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              This is a test environment. No real authentication was performed.
              <br />
              Token and user data have been stored in localStorage for testing purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
