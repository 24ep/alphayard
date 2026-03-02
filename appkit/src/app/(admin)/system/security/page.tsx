'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState({
    enforceMfa: true,
    ipWhitelistEnabled: false,
    auditLogging: true,
    sessionTimeoutMins: 30,
    corsProtection: true,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('admin_token') || ''
        const res = await fetch('/api/v1/admin/system/config/security', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load security settings')
        const data = await res.json()
        if (data?.config) setSettings((prev) => ({ ...prev, ...data.config }))
      } catch (err) {
        console.error(err)
        setMessage('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('admin_token') || ''
      const res = await fetch('/api/v1/admin/system/config/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ config: settings }),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      setMessage('Saved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setMessage('Failed to save')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Global security policies for the platform.</p>
      </div>

      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-4">
        {[
          { key: 'enforceMfa', label: 'Enforce MFA for all admin users', desc: 'Require multi-factor authentication for admin console access' },
          { key: 'ipWhitelistEnabled', label: 'IP Whitelist', desc: 'Restrict admin access to specific IP addresses' },
          { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all admin actions for security auditing' },
          { key: 'sessionTimeoutMins', label: 'Session Timeout', desc: 'Automatically log out inactive admin sessions after N minutes', numeric: true },
          { key: 'corsProtection', label: 'CORS Protection', desc: 'Restrict cross-origin requests to approved domains only' },
        ].map((setting) => (
          <div key={setting.label} className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{setting.desc}</p>
            </div>
            {setting.numeric ? (
              <input
                type="number"
                min={1}
                title="Session timeout in minutes"
                placeholder="30"
                value={settings.sessionTimeoutMins}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, sessionTimeoutMins: Number(e.target.value || 30) }))
                }
                className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              />
            ) : (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  title={setting.label}
                  aria-label={setting.label}
                  className="sr-only peer"
                  checked={Boolean(settings[setting.key as keyof typeof settings])}
                  onChange={() =>
                    setSettings((prev) => ({
                      ...prev,
                      [setting.key]: !Boolean(prev[setting.key as keyof typeof prev]),
                    }))
                  }
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            )}
          </div>
        ))}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-3">
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
          {message && <span className={`text-xs font-medium ${message === 'Saved!' ? 'text-emerald-600' : 'text-red-500'}`}>{message}</span>}
          <Button onClick={save} disabled={saving || loading} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            {saving ? 'Saving...' : 'Save Security Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
