'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  XIcon, 
  ShieldCheckIcon, 
  GlobeIcon, 
  MailIcon, 
  SmartphoneIcon, 
  KeyIcon,
  CheckCircleIcon,
  HelpCircleIcon
} from 'lucide-react'

interface AuthMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  category: 'credentials' | 'social' | 'enterprise'
}

interface AuthMethodsDrawerProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  applicationName: string
}

export default function AuthMethodsDrawer({ isOpen, onClose, applicationId, applicationName }: AuthMethodsDrawerProps) {
  const [configMode, setConfigMode] = useState<'default' | 'individual'>('default')
  
  const [methods, setMethods] = useState<AuthMethod[]>([
    { id: 'email-password', name: 'Email & Password', description: 'Traditional email and password authentication', icon: <MailIcon className="w-5 h-5" />, enabled: true, category: 'credentials' },
    { id: 'magic-link', name: 'Magic Link', description: 'Passwordless sign-in via email link', icon: <KeyIcon className="w-5 h-5" />, enabled: true, category: 'credentials' },
    { id: 'sms-otp', name: 'SMS OTP', description: 'One-time password via SMS', icon: <SmartphoneIcon className="w-5 h-5" />, enabled: false, category: 'credentials' },
    { id: 'google', name: 'Google', description: 'Sign in with Google OAuth 2.0', icon: <GlobeIcon className="w-5 h-5" />, enabled: true, category: 'social' },
    { id: 'apple', name: 'Apple', description: 'Sign in with Apple ID', icon: <ShieldCheckIcon className="w-5 h-5" />, enabled: false, category: 'social' },
    { id: 'saml', name: 'SAML SSO', description: 'Enterprise SAML-based single sign-on', icon: <ShieldCheckIcon className="w-5 h-5" />, enabled: false, category: 'enterprise' },
  ])

  const toggleMethod = (id: string) => {
    if (configMode === 'default') return
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-zinc-800">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950 sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Authentication Methods</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{applicationName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-zinc-400">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-zinc-900/30">
            {/* Config Mode Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                Configuration Mode
                <HelpCircleIcon className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfigMode('default')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    configMode === 'default'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-1 ring-blue-500'
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${configMode === 'default' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      Default Config
                    </span>
                    {configMode === 'default' && <CheckCircleIcon className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Use global platform authentication settings
                  </p>
                </button>
                <button
                  onClick={() => setConfigMode('individual')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    configMode === 'individual'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${configMode === 'individual' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                      Individual Config
                    </span>
                    {configMode === 'individual' && <CheckCircleIcon className="w-4 h-4 text-indigo-500" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Configure custom methods for this application
                  </p>
                </button>
              </div>
            </div>

            <div className={`space-y-4 transition-opacity duration-200 ${configMode === 'default' ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Active Methods</h3>
                {configMode === 'default' && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                    Read-only
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {methods.map((method) => (
                  <div 
                    key={method.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      method.enabled && configMode === 'individual'
                        ? 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm' 
                        : 'bg-white/50 dark:bg-zinc-900/50 border-gray-100 dark:border-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        method.enabled 
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' 
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
                      }`}>
                        {method.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-500">{method.description}</p>
                      </div>
                    </div>
                    <label className={`relative inline-flex items-center ${configMode === 'individual' ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={method.enabled} 
                        onChange={() => toggleMethod(method.id)} 
                        disabled={configMode === 'default'}
                      />
                      <div className="w-10 h-5 bg-gray-200 dark:bg-zinc-800 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full shadow-inner"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-end space-x-3 sticky bottom-0 z-10">
            <Button variant="outline" onClick={onClose} className="border-gray-200 dark:border-zinc-800">
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/20 px-8" onClick={onClose}>
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
