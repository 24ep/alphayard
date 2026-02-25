'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  ShieldCheckIcon,
  MailIcon,
  GlobeIcon,
  CogIcon,
  KeyIcon,
  SmartphoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  SaveIcon,
  InfoIcon,
} from 'lucide-react'

interface AuthProvider {
  id: string
  name: string
  desc: string
  icon: React.ReactNode
  color: string
  enabled: boolean
  fields?: { label: string; placeholder: string; type?: string }[]
}

const defaultProviders: AuthProvider[] = [
  {
    id: 'email-password',
    name: 'Email & Password',
    desc: 'Traditional email/password login',
    icon: <MailIcon className="w-5 h-5" />,
    color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500',
    enabled: true,
    fields: [
      { label: 'Min Password Length', placeholder: '8', type: 'number' },
      { label: 'Require Email Verification', placeholder: 'true' },
    ],
  },
  {
    id: 'google-oauth',
    name: 'Google OAuth',
    desc: 'Sign in with Google account',
    icon: <GlobeIcon className="w-5 h-5" />,
    color: 'bg-red-50 dark:bg-red-500/10 text-red-500',
    enabled: true,
    fields: [
      { label: 'Client ID', placeholder: 'your-google-client-id' },
      { label: 'Client Secret', placeholder: '••••••••', type: 'password' },
      { label: 'Redirect URI', placeholder: 'https://your-domain.com/auth/google/callback' },
    ],
  },
  {
    id: 'github-oauth',
    name: 'GitHub OAuth',
    desc: 'Sign in with GitHub account',
    icon: <CogIcon className="w-5 h-5" />,
    color: 'bg-gray-50 dark:bg-zinc-500/10 text-gray-700 dark:text-zinc-300',
    enabled: false,
    fields: [
      { label: 'Client ID', placeholder: 'your-github-client-id' },
      { label: 'Client Secret', placeholder: '••••••••', type: 'password' },
      { label: 'Redirect URI', placeholder: 'https://your-domain.com/auth/github/callback' },
    ],
  },
  {
    id: 'saml-sso',
    name: 'SAML SSO',
    desc: 'Enterprise SAML 2.0 single sign-on',
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-500',
    enabled: false,
    fields: [
      { label: 'Entity ID', placeholder: 'https://your-idp.com/entity-id' },
      { label: 'SSO URL', placeholder: 'https://your-idp.com/sso' },
      { label: 'Certificate', placeholder: 'Paste X.509 certificate...' },
    ],
  },
  {
    id: 'magic-link',
    name: 'Magic Link',
    desc: 'Passwordless email login',
    icon: <KeyIcon className="w-5 h-5" />,
    color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500',
    enabled: true,
    fields: [
      { label: 'Link Expiry (minutes)', placeholder: '15', type: 'number' },
    ],
  },
  {
    id: 'sms-otp',
    name: 'SMS OTP',
    desc: 'Phone number verification',
    icon: <SmartphoneIcon className="w-5 h-5" />,
    color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500',
    enabled: false,
    fields: [
      { label: 'Provider', placeholder: 'Twilio' },
      { label: 'Account SID', placeholder: 'your-account-sid' },
      { label: 'Auth Token', placeholder: '••••••••', type: 'password' },
      { label: 'From Number', placeholder: '+1234567890' },
    ],
  },
]

export default function DefaultAuthMethodsPage() {
  const [providers, setProviders] = useState(defaultProviders)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleProvider = (id: string) => {
    setProviders(prev =>
      prev.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Methods</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Configure default authentication providers. Individual applications inherit these settings unless overridden.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/25">
          <SaveIcon className="w-4 h-4 mr-2" />
          Save Defaults
        </Button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/20">
        <InfoIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Default Configuration</p>
          <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">
            These settings serve as the platform-wide defaults. Each application can choose to use these defaults or configure individual settings.
          </p>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="space-y-4">
        {providers.map(provider => (
          <div
            key={provider.id}
            className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden transition-all"
          >
            {/* Provider Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                  {provider.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{provider.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{provider.desc}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {provider.enabled ? (
                  <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircleIcon className="w-4 h-4 mr-1" /> Enabled
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-gray-400 dark:text-zinc-500">
                    <XCircleIcon className="w-4 h-4 mr-1" /> Disabled
                  </span>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={provider.enabled}
                    onChange={() => toggleProvider(provider.id)}
                  />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                </label>
                {provider.fields && provider.fields.length > 0 && (
                  <button
                    onClick={() => setExpandedId(expandedId === provider.id ? null : provider.id)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    {expandedId === provider.id ? 'Collapse' : 'Configure'}
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Config */}
            {expandedId === provider.id && provider.fields && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.fields.map(field => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">
                        {field.label}
                      </label>
                      <input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
