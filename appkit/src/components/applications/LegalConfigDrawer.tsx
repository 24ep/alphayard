'use client'

import React, { useState } from 'react'
import {
  XIcon,
  ScaleIcon,
  FileTextIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
} from 'lucide-react'

interface LegalConfigDrawerProps {
  isOpen: boolean
  onClose: () => void
  appName: string
}

const defaultDocs = [
  { id: 'tos', name: 'Terms of Service', status: 'Published', version: 'v2.1' },
  { id: 'privacy', name: 'Privacy Policy', status: 'Published', version: 'v3.0' },
  { id: 'cookie', name: 'Cookie Policy', status: 'Draft', version: 'v1.2' },
  { id: 'dpa', name: 'Data Processing Agreement', status: 'Published', version: 'v1.0' },
  { id: 'aup', name: 'Acceptable Use Policy', status: 'Draft', version: 'v1.0' },
]

const complianceSettings = [
  { id: 'gdpr', name: 'GDPR Compliance Mode', defaultEnabled: true },
  { id: 'cookie-banner', name: 'Cookie Consent Banner', defaultEnabled: true },
  { id: 'data-retention', name: 'Data Retention Policy', defaultEnabled: false },
  { id: 'erasure', name: 'Right to Erasure', defaultEnabled: true },
  { id: 'export', name: 'Data Export', defaultEnabled: true },
  { id: 'age-verify', name: 'Age Verification', defaultEnabled: false },
]

export default function LegalConfigDrawer({ isOpen, onClose, appName }: LegalConfigDrawerProps) {
  const [useDefault, setUseDefault] = useState(true)
  const [settings, setSettings] = useState(complianceSettings.map(s => ({ ...s, enabled: s.defaultEnabled })))

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ScaleIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Legal & Compliance</h2>
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
                  This application inherits the platform default legal documents and compliance settings. Changes to defaults will automatically apply.
                </p>
              </div>

              {/* Documents Summary */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Legal Documents</h3>
                <div className="space-y-2">
                  {defaultDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <FileTextIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{doc.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 dark:text-zinc-500">{doc.version}</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          doc.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>{doc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Summary */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Compliance Settings</h3>
                <div className="space-y-1.5">
                  {complianceSettings.map(s => (
                    <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                      <span className="text-sm text-gray-700 dark:text-zinc-300">{s.name}</span>
                      {s.defaultEnabled ? (
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
            </div>
          ) : (
            <div className="space-y-4">
              {/* Editable Compliance */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Compliance Settings</h3>
                <div className="space-y-2">
                  {settings.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={s.enabled} onChange={() => toggleSetting(s.id)} />
                        <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Legal Document URLs */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Custom Document URLs</h3>
                <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-4 space-y-3">
                  {['Terms of Service URL', 'Privacy Policy URL', 'Cookie Policy URL'].map(label => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">{label}</label>
                      <input
                        type="url"
                        placeholder="https://your-app.com/legal/..."
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  ))}
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
