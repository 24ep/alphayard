import React from 'react'
import { PlusIcon, WebhookIcon, HashIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WebhookEndpoint } from '../page'

interface WebhookSettingsProps {
  webhooks: WebhookEndpoint[]
  webhookMsg: string
  showAddWebhook: boolean
  setShowAddWebhook: (show: boolean) => void
  newWebhookUrl: string
  setNewWebhookUrl: (url: string) => void
  newWebhookEvents: string[]
  setNewWebhookEvents: React.Dispatch<React.SetStateAction<string[]>>
  onAddWebhook: () => void
  editingWebhookId: string | null
  editingWebhookUrl: string
  setEditingWebhookUrl: (url: string) => void
  editingWebhookEvents: string[]
  setEditingWebhookEvents: React.Dispatch<React.SetStateAction<string[]>>
  editingWebhookStatus: 'active' | 'inactive'
  setEditingWebhookStatus: (status: 'active' | 'inactive') => void
  onStartWebhookEdit: (wh: WebhookEndpoint) => void
  onCancelWebhookEdit: () => void
  onSaveWebhookEdit: () => void
  onDeleteWebhook: (id: string) => void
  webhookEvents: readonly string[]
}

export const WebhookSettings: React.FC<WebhookSettingsProps> = ({
  webhooks,
  webhookMsg,
  showAddWebhook,
  setShowAddWebhook,
  newWebhookUrl,
  setNewWebhookUrl,
  newWebhookEvents,
  setNewWebhookEvents,
  onAddWebhook,
  editingWebhookId,
  editingWebhookUrl,
  setEditingWebhookUrl,
  editingWebhookEvents,
  setEditingWebhookEvents,
  editingWebhookStatus,
  setEditingWebhookStatus,
  onStartWebhookEdit,
  onCancelWebhookEdit,
  onSaveWebhookEdit,
  onDeleteWebhook,
  webhookEvents,
}) => {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Webhooks</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Receive real-time notifications when events occur in your application.</p>
        </div>
        <Button onClick={() => setShowAddWebhook(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
          <PlusIcon className="w-4 h-4 mr-1.5" /> Add Endpoint
        </Button>
      </div>
      {webhookMsg && (
        <div className="mb-4 text-xs text-gray-600 dark:text-zinc-400">{webhookMsg}</div>
      )}

      {/* Add Webhook Form */}
      {showAddWebhook && (
        <div className="mb-4 p-4 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5 space-y-3">
          <label className="text-xs font-medium text-gray-600 dark:text-zinc-400 block">Endpoint URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={newWebhookUrl}
              onChange={e => setNewWebhookUrl(e.target.value)}
              placeholder="https://api.example.com/webhooks"
              className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Button onClick={onAddWebhook} disabled={!newWebhookUrl || newWebhookEvents.length === 0} className="bg-blue-600 text-white border-0">Add</Button>
            <Button variant="outline" onClick={() => { setShowAddWebhook(false); setNewWebhookUrl(''); setNewWebhookEvents(['user.created']) }}>Cancel</Button>
          </div>
          <div className="mt-2">
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-400 block mb-2">Events</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {webhookEvents.map((eventName) => {
                const checked = newWebhookEvents.includes(eventName)
                return (
                  <label key={eventName} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 px-2 py-1.5 text-[11px] text-gray-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setNewWebhookEvents((prev) => {
                          if (e.target.checked) return Array.from(new Set([...prev, eventName]))
                          return prev.filter((item) => item !== eventName)
                        })
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                    />
                    <span className="font-mono">{eventName}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Webhook List */}
      <div className="space-y-3">
        {webhooks.map(wh => (
          <div key={wh.id} className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
            {editingWebhookId === wh.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={editingWebhookUrl}
                    onChange={(e) => setEditingWebhookUrl(e.target.value)}
                    placeholder="https://api.example.com/webhooks"
                    className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <select
                    value={editingWebhookStatus}
                    onChange={(e) => setEditingWebhookStatus(e.target.value === 'inactive' ? 'inactive' : 'active')}
                    className="px-2.5 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    title="Webhook status"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {webhookEvents.map((eventName) => {
                    const checked = editingWebhookEvents.includes(eventName)
                    return (
                      <label key={eventName} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 px-2 py-1.5 text-[11px] text-gray-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setEditingWebhookEvents((prev) => {
                              if (e.target.checked) return Array.from(new Set([...prev, eventName]))
                              return prev.filter((item) => item !== eventName)
                            })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                        />
                        <span className="font-mono">{eventName}</span>
                      </label>
                    )
                  })}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={onCancelWebhookEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onSaveWebhookEdit}
                    disabled={!editingWebhookUrl || editingWebhookEvents.length === 0}
                    className="bg-blue-600 text-white border-0"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${wh.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <code className="text-xs font-mono text-gray-700 dark:text-zinc-300 truncate">{wh.url}</code>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {wh.events.map(ev => (
                      <span key={ev} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">{ev}</span>
                    ))}
                    {wh.lastTriggered && <span className="text-[10px] text-gray-400 ml-1">Last: {new Date(wh.lastTriggered).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onStartWebhookEdit(wh)} className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors" title="Edit webhook">
                    Edit
                  </button>
                  <button onClick={() => onDeleteWebhook(wh.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors" title="Delete webhook">
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {webhooks.length === 0 && (
          <div className="text-center py-10">
            <WebhookIcon className="w-10 h-10 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-zinc-400">No webhook endpoints configured</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Add an endpoint to start receiving event notifications</p>
          </div>
        )}
      </div>

      {/* Available Events */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Events</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {webhookEvents.map(ev => (
            <span key={ev} className="inline-flex items-center px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 text-[10px] font-mono text-gray-600 dark:text-zinc-400">
              <HashIcon className="w-3 h-3 mr-1 text-gray-400" />{ev}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
