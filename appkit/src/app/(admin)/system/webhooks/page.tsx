'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LinkIcon } from 'lucide-react'

interface WebhookItem {
  id: string
  url: string
  events: string[]
  status: 'Active' | 'Disabled'
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('admin_token') || ''
        const res = await fetch('/api/v1/admin/system/config/webhooks', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load webhooks')
        const data = await res.json()
        setWebhooks(Array.isArray(data?.config?.endpoints) ? data.config.endpoints : [])
      } catch (err) {
        console.error(err)
        setMessage('Failed to load webhooks')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async (next: WebhookItem[]) => {
    try {
      setSaving(true)
      setWebhooks(next)
      const token = localStorage.getItem('admin_token') || ''
      const res = await fetch('/api/v1/admin/system/config/webhooks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ config: { endpoints: next } }),
      })
      if (!res.ok) throw new Error('Failed to save webhooks')
      setMessage('Saved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setMessage('Failed to save webhooks')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const addWebhook = () => {
    const next: WebhookItem[] = [
      {
        id: crypto.randomUUID(),
        url: '',
        events: ['user.created'],
        status: 'Active',
      },
      ...webhooks,
    ]
    setWebhooks(next)
  }

  const updateWebhook = (id: string, patch: Partial<WebhookItem>) => {
    const next = webhooks.map((item) => (item.id === id ? { ...item, ...patch } : item))
    setWebhooks(next)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Configure webhook endpoints to receive real-time events.</p>
      </div>

      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-6">
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-zinc-800 gap-4">
              <div>
                <input
                  type="url"
                  value={webhook.url}
                  onChange={(e) => updateWebhook(webhook.id, { url: e.target.value })}
                  placeholder="https://your-webhook-endpoint"
                  className="w-[440px] max-w-full text-sm font-medium text-gray-900 dark:text-white font-mono bg-transparent border-b border-gray-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={webhook.events.join(', ')}
                  onChange={(e) =>
                    updateWebhook(webhook.id, {
                      events: e.target.value
                        .split(',')
                        .map((v) => v.trim())
                        .filter(Boolean),
                    })
                  }
                  className="text-xs text-gray-500 dark:text-zinc-400 mt-1 w-[440px] max-w-full bg-transparent border-b border-gray-100 dark:border-zinc-800 focus:outline-none focus:border-blue-500"
                  placeholder="user.created, user.deleted"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {webhook.status}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    updateWebhook(webhook.id, {
                      status: webhook.status === 'Active' ? 'Disabled' : 'Active',
                    })
                  }
                >
                  {webhook.status === 'Active' ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          ))}
          {!loading && webhooks.length === 0 && (
            <p className="text-sm text-gray-500">No webhook endpoints configured.</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {message && <span className={`text-xs font-medium ${message === 'Saved!' ? 'text-emerald-600' : 'text-red-500'}`}>{message}</span>}
          <Button variant="outline" className="text-sm" onClick={addWebhook}>
            <LinkIcon className="w-4 h-4 mr-2" />
            Add Webhook Endpoint
          </Button>
          <Button onClick={() => save(webhooks)} disabled={saving || loading} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            {saving ? 'Saving...' : 'Save Webhooks'}
          </Button>
        </div>
      </div>
    </div>
  )
}
