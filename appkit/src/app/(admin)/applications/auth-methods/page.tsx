'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  MailIcon,
  SmartphoneIcon,
  KeyIcon,
  GlobeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from 'lucide-react'

interface AuthMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  category: 'credentials' | 'social' | 'enterprise'
}

const defaultMethods: AuthMethod[] = [
  { id: 'email-password', name: 'Email & Password', description: 'Traditional email and password authentication', icon: <MailIcon className="w-5 h-5" />, enabled: true, category: 'credentials' },
  { id: 'magic-link', name: 'Magic Link', description: 'Passwordless sign-in via email link', icon: <KeyIcon className="w-5 h-5" />, enabled: true, category: 'credentials' },
  { id: 'sms-otp', name: 'SMS OTP', description: 'One-time password via SMS', icon: <SmartphoneIcon className="w-5 h-5" />, enabled: false, category: 'credentials' },
  { id: 'google', name: 'Google', description: 'Sign in with Google OAuth 2.0', icon: <GlobeIcon className="w-5 h-5" />, enabled: true, category: 'social' },
  { id: 'apple', name: 'Apple', description: 'Sign in with Apple ID', icon: <ShieldCheckIcon className="w-5 h-5" />, enabled: false, category: 'social' },
  { id: 'facebook', name: 'Facebook', description: 'Sign in with Facebook', icon: <GlobeIcon className="w-5 h-5" />, enabled: false, category: 'social' },
  { id: 'github', name: 'GitHub', description: 'Sign in with GitHub account', icon: <GlobeIcon className="w-5 h-5" />, enabled: false, category: 'social' },
  { id: 'saml', name: 'SAML SSO', description: 'Enterprise SAML-based single sign-on', icon: <ShieldCheckIcon className="w-5 h-5" />, enabled: false, category: 'enterprise' },
  { id: 'oidc', name: 'OpenID Connect', description: 'Enterprise OpenID Connect provider', icon: <KeyIcon className="w-5 h-5" />, enabled: false, category: 'enterprise' },
]

export default function AuthMethodsPage() {
  const [methods, setMethods] = useState<AuthMethod[]>(defaultMethods)

  const toggleMethod = (id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  }

  const categories = [
    { id: 'credentials', label: 'Credential Methods' },
    { id: 'social', label: 'Social Providers' },
    { id: 'enterprise', label: 'Enterprise SSO' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Methods</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Configure default authentication methods for all applications. Individual apps can override these settings.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
        <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Default Configuration</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">These settings apply to all new applications by default. Each application can override and use its own individual configuration.</p>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{category.label}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {methods.filter(m => m.category === category.id).map((method) => (
              <div key={method.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    method.enabled 
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' 
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{method.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={method.enabled} onChange={() => toggleMethod(method.id)} />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-2">
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
          Save Default Configuration
        </Button>
      </div>
    </div>
  )
}
