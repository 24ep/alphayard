'use client'

import React, { useState } from 'react'
import {
  XIcon,
  ShieldCheckIcon,
  MailIcon,
  GlobeIcon,
  CogIcon,
  KeyIcon,
  SmartphoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
} from 'lucide-react'

interface AuthMethodsConfigDrawerProps {
  isOpen: boolean
  onClose: () => void
  appName: string
}

const authMethods = [
  { id: 'email-password', name: 'Email & Password', desc: 'Traditional email/password login', icon: <MailIcon className="w-4 h-4" />, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500', defaultEnabled: true },
  { id: 'google-oauth', name: 'Google OAuth', desc: 'Sign in with Google account', icon: <GlobeIcon className="w-4 h-4" />, color: 'bg-red-50 dark:bg-red-500/10 text-red-500', defaultEnabled: true },
  { id: 'github-oauth', name: 'GitHub OAuth', desc: 'Sign in with GitHub account', icon: <CogIcon className="w-4 h-4" />, color: 'bg-gray-50 dark:bg-zinc-500/10 text-gray-700 dark:text-zinc-300', defaultEnabled: false },
  { id: 'saml-sso', name: 'SAML SSO', desc: 'Enterprise SAML 2.0 single sign-on', icon: <ShieldCheckIcon className="w-4 h-4" />, color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-500', defaultEnabled: false },
  { id: 'magic-link', name: 'Magic Link', desc: 'Passwordless email login', icon: <KeyIcon className="w-4 h-4" />, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500', defaultEnabled: true },
  { id: 'sms-otp', name: 'SMS OTP', desc: 'Phone number verification', icon: <SmartphoneIcon className="w-4 h-4" />, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500', defaultEnabled: false },
]

export default function AuthMethodsConfigDrawer({ isOpen, onClose, appName }: AuthMethodsConfigDrawerProps) {
  const [useDefault, setUseDefault] = useState(true)
  const [methods, setMethods] = useState(authMethods.map(m => ({ ...m, enabled: m.defaultEnabled })))

  const toggleMethod = (id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Authentication Methods</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{appName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <XIcon className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-500/30 bg-blue-50/30 dark:bg-blue-500/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Configuration Mode</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  {useDefault ? 'Using platform-wide default settings' : 'Using individual settings for this app'}
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setUseDefault(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    useDefault
                      ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
                  }`}
                >
                  Use Default
                </button>
                <button
                  onClick={() => setUseDefault(false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    !useDefault
                      ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
                  }`}
                >
                  Individual
                </button>
              </div>
            </div>
          </div>

          {useDefault ? (
            /* Default Mode - Read-only summary */
            <div className="space-y-4">
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/20">
                <InfoIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  This application inherits the platform default authentication configuration. Changes to defaults will automatically apply.
                </p>
              </div>

              <div className="space-y-2">
                {authMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded-md ${method.color} flex items-center justify-center`}>
                        {method.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{method.name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-zinc-500">{method.desc}</p>
                      </div>
                    </div>
                    {method.defaultEnabled ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                        <CheckCircleIcon className="w-3.5 h-3.5 mr-1" /> On
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 flex items-center">
                        <XCircleIcon className="w-3.5 h-3.5 mr-1" /> Off
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Individual Mode - Editable */
            <div className="space-y-3">
              {methods.map(method => (
                <div key={method.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-lg ${method.color} flex items-center justify-center`}>
                      {method.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">{method.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={method.enabled}
                      onChange={() => toggleMethod(method.id)}
                    />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </>
  )
}
