'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { adminService } from '@/services/adminService'
import {
  XIcon,
  MailIcon,
  SmartphoneIcon,
  BellIcon,
  MessageSquareIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  SaveIcon,
  Loader2Icon,
  RotateCcwIcon,
  SettingsIcon,
} from 'lucide-react'

interface CommunicationConfigDrawerProps {
  isOpen: boolean
  onClose: () => void
  appId: string
  appName: string
}

interface CommConfig {
  providers: { id: string; name: string; type: string; enabled: boolean; settings: Record<string, any> }[]
  channels: { email: boolean; sms: boolean; push: boolean; inApp: boolean }
  smtpSettings?: { host: string; port: number; username: string; fromEmail: string; fromName: string; secure: boolean }
}

const CHANNEL_META = [
  { key: 'email' as const, name: 'Email', icon: <MailIcon className="w-4 h-4" /> },
  { key: 'sms' as const, name: 'SMS', icon: <SmartphoneIcon className="w-4 h-4" /> },
  { key: 'push' as const, name: 'Push Notifications', icon: <BellIcon className="w-4 h-4" /> },
  { key: 'inApp' as const, name: 'In-App', icon: <MessageSquareIcon className="w-4 h-4" /> },
]

export default function CommunicationConfigDrawer({ isOpen, onClose, appId, appName }: CommunicationConfigDrawerProps) {
  const [useDefault, setUseDefault] = useState(true)
  const [config, setConfig] = useState<CommConfig | null>(null)
  const [defaultConfig, setDefaultConfig] = useState<CommConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (isOpen && appId) loadData()
  }, [isOpen, appId])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await adminService.getAppConfigOverride(appId, 'comm')
      setUseDefault(res.useDefault)

      const defaults = await adminService.getDefaultCommConfig()
      setDefaultConfig(defaults.config)

      if (!res.useDefault && res.config) {
        setConfig(res.config)
      } else {
        setConfig(defaults.config)
      }
    } catch (err) {
      console.error('Failed to load app comm config:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleUseDefault = async (val: boolean) => {
    setUseDefault(val)
    if (val) {
      try {
        await adminService.deleteAppConfig(appId, 'comm')
        setConfig(defaultConfig)
      } catch (err) {
        console.error('Failed to revert to default:', err)
      }
    }
  }

  const toggleChannel = (ch: keyof CommConfig['channels']) => {
    if (!config) return
    setConfig({ ...config, channels: { ...config.channels, [ch]: !config.channels[ch] } })
  }

  const handleSave = async () => {
    if (!config) return
    try {
      setSaving(true)
      await adminService.saveAppConfig(appId, 'comm', config)
      setSaveMessage('Saved!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save:', err)
      setSaveMessage('Failed to save')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Communication Config</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{appName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500"><XIcon className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="w-5 h-5 text-blue-500 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                <button className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${useDefault ? 'bg-white dark:bg-zinc-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-400'}`} onClick={() => toggleUseDefault(true)}>Use Default</button>
                <button className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${!useDefault ? 'bg-white dark:bg-zinc-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-400'}`} onClick={() => toggleUseDefault(false)}>Individual</button>
              </div>

              {useDefault ? (
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Using Platform Defaults</p>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-[10px] font-bold text-blue-600 uppercase tracking-tight rounded">Global</span>
                  </div>
                  <div className="space-y-2">
                    {CHANNEL_META.map(ch => (
                      <div key={ch.key} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 dark:text-zinc-400">{ch.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-zinc-300">{ch.name}</span>
                        </div>
                        {defaultConfig?.channels[ch.key] ? <CheckCircleIcon className="w-4 h-4 text-emerald-500" /> : <XCircleIcon className="w-4 h-4 text-gray-300 dark:text-zinc-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              ) : config ? (
                <div className="space-y-6">
                  {/* Channels */}
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notification Channels</h3>
                      <span className="text-[10px] text-gray-400 italic">Individual override from base</span>
                    </div>
                    <div className="space-y-2">
                      {CHANNEL_META.map(ch => {
                        const isEnabled = config.channels[ch.key]
                        const isDefaultEnabled = defaultConfig?.channels[ch.key]
                        const isOverridden = isEnabled !== isDefaultEnabled

                        return (
                          <div key={ch.key} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isOverridden ? 'border-orange-500/30 bg-orange-500/5 shadow-sm' : 'border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900'}`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOverridden ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                {ch.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{ch.name}</span>
                                  {isOverridden && <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-[9px] font-bold text-orange-600 uppercase rounded">Custom</span>}
                                </div>
                                <p className="text-[9px] text-gray-400">
                                  {isOverridden ? 'Value adjusted for this app' : 'Inheriting system default'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isOverridden && (
                                <button 
                                  onClick={() => setConfig({ ...config, channels: { ...config.channels, [ch.key]: !!isDefaultEnabled } })}
                                  className="p-1.5 hover:bg-orange-100 rounded-md text-orange-500"
                                  title="Reset to Default"
                                >
                                  <RotateCcwIcon className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={() => toggleChannel(ch.key)} />
                                <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* SMTP Override */}
                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <SettingsIcon className="w-3 h-3" />
                        SMTP Configuration
                      </h3>
                      {config.smtpSettings ? (
                        <button 
                          onClick={() => setConfig({ ...config, smtpSettings: undefined })}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          Remove Override
                        </button>
                      ) : (
                        <button 
                          onClick={() => setConfig({ ...config, smtpSettings: { host: '', port: 587, username: '', fromEmail: '', fromName: '', secure: false } })}
                          className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          + Add Override
                        </button>
                      )}
                    </div>
                    
                    {config.smtpSettings ? (
                      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'SMTP Host', key: 'host', placeholder: 'smtp.example.com' },
                            { label: 'SMTP Port', key: 'port', placeholder: '587', type: 'number' },
                            { label: 'From Email', key: 'fromEmail', placeholder: 'noreply@app.com' },
                            { label: 'From Name', key: 'fromName', placeholder: 'App Name' },
                          ].map(field => (
                            <div key={field.key} className={field.key === 'host' || field.key === 'fromEmail' ? 'col-span-1' : 'col-span-1'}>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{field.label}</label>
                              <input
                                type={field.type || 'text'}
                                placeholder={field.placeholder}
                                value={String(config.smtpSettings?.[field.key as keyof typeof config.smtpSettings] ?? '')}
                                onChange={e => {
                                  setConfig(prev => prev ? { ...prev, smtpSettings: { ...(prev.smtpSettings || { host: '', port: 587, username: '', fromEmail: '', fromName: '', secure: false }), [field.key]: field.type === 'number' ? parseInt(e.target.value) : e.target.value } } : prev)
                                }}
                                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                        <MailIcon className="w-8 h-8 text-gray-200 dark:text-zinc-800 mb-2" />
                        <p className="text-xs text-gray-500">Using system default SMTP settings</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {!useDefault && !loading && (
          <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end space-x-2">
            {saveMessage && <span className={`text-sm font-medium mr-2 ${saveMessage === 'Saved!' ? 'text-emerald-600' : 'text-red-500'}`}>{saveMessage}</span>}
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
              {saving ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
