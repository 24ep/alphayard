'use client'

import React, { useState } from 'react'
import {
  XIcon,
  MessageSquareIcon,
  MailIcon,
  SmartphoneIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
} from 'lucide-react'

interface CommunicationConfigDrawerProps {
  isOpen: boolean
  onClose: () => void
  appName: string
}

const defaultChannels = [
  { id: 'smtp', name: 'SMTP / Email', desc: 'Email delivery via SMTP server', icon: <MailIcon className="w-4 h-4" />, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500', defaultEnabled: true },
  { id: 'sms', name: 'SMS', desc: 'SMS delivery (Twilio / Vonage)', icon: <SmartphoneIcon className="w-4 h-4" />, color: 'bg-red-50 dark:bg-red-500/10 text-red-500', defaultEnabled: false },
  { id: 'push', name: 'Push Notifications', desc: 'Firebase / APNs push', icon: <BellIcon className="w-4 h-4" />, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500', defaultEnabled: false },
  { id: 'in-app', name: 'In-App Notifications', desc: 'Real-time in-app messages', icon: <MessageSquareIcon className="w-4 h-4" />, color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-500', defaultEnabled: true },
]

const emailTemplates = [
  { name: 'Welcome Email', status: 'Active' },
  { name: 'Password Reset', status: 'Active' },
  { name: 'Email Verification', status: 'Active' },
  { name: 'MFA Code', status: 'Active' },
  { name: 'Account Locked', status: 'Draft' },
]

export default function CommunicationConfigDrawer({ isOpen, onClose, appName }: CommunicationConfigDrawerProps) {
  const [useDefault, setUseDefault] = useState(true)
  const [channels, setChannels] = useState(defaultChannels.map(c => ({ ...c, enabled: c.defaultEnabled })))

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <MessageSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Communication</h2>
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
            <div className="space-y-4">
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/20">
                <InfoIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  This application inherits the platform default communication configuration. Changes to defaults will automatically apply.
                </p>
              </div>

              {/* Channels Summary */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Channels</h3>
                <div className="space-y-2">
                  {defaultChannels.map(ch => (
                    <div key={ch.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-7 h-7 rounded-md ${ch.color} flex items-center justify-center`}>
                          {ch.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{ch.name}</span>
                      </div>
                      {ch.defaultEnabled ? (
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

              {/* Templates Summary */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Email Templates</h3>
                <div className="space-y-1.5">
                  {emailTemplates.map(t => (
                    <div key={t.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                      <span className="text-sm text-gray-700 dark:text-zinc-300">{t.name}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        t.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Editable Channels */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Channels</h3>
                <div className="space-y-2">
                  {channels.map(ch => (
                    <div key={ch.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-lg ${ch.color} flex items-center justify-center`}>
                          {ch.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{ch.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-zinc-400">{ch.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={ch.enabled} onChange={() => toggleChannel(ch.id)} />
                        <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMTP Override Fields */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">SMTP Override</h3>
                <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">From Email</label>
                      <input type="email" placeholder="noreply@app.com" className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">From Name</label>
                      <input type="text" placeholder="App Name" className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
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
