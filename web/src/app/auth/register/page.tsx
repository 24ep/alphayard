'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'
import { FrostedGlassPanel } from '@/components/ui/FrostedGlassPanel'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <FrostedGlassPanel className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-600">Join Bondarys to connect with your Circle</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-macos bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              name="firstName"
              label="First name"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <Input
              type="text"
              name="lastName"
              label="Last name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            name="confirmPassword"
            label="Confirm password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-macos-blue-600 hover:text-macos-blue-700 font-medium transition-macos"
            >
              Sign in
            </Link>
          </p>
        </div>
      </FrostedGlassPanel>
    </div>
  )
}


