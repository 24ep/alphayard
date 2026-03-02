'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import {
  PlusIcon,
  TrashIcon,
  RotateCcwIcon,
  SaveIcon,
  Loader2Icon,
  TagIcon,
  HashIcon,
  TypeIcon,
  ToggleLeftIcon,
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  LinkIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { adminService } from '@/services/adminService'

interface UserAttribute {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'phone' | 'url' | 'select'
  required: boolean
  isSystem: boolean
  options?: string[]
  validation?: string
}

const SYSTEM_ATTRIBUTES: UserAttribute[] = [
  { id: 'sys_email', name: 'email', label: 'Email', type: 'email', required: true, isSystem: true },
  { id: 'sys_name', name: 'first_name', label: 'First Name', type: 'text', required: true, isSystem: true },
  { id: 'sys_lastname', name: 'last_name', label: 'Last Name', type: 'text', required: true, isSystem: true },
  { id: 'sys_phone', name: 'phone', label: 'Phone Number', type: 'phone', required: false, isSystem: true },
  { id: 'sys_avatar', name: 'avatar_url', label: 'Avatar URL', type: 'url', required: false, isSystem: true },
]

const TYPE_META: Record<string, { icon: React.ReactNode; label: string }> = {
  text: { icon: <TypeIcon className="w-3 h-3" />, label: 'Text' },
  number: { icon: <HashIcon className="w-3 h-3" />, label: 'Number' },
  boolean: { icon: <ToggleLeftIcon className="w-3 h-3" />, label: 'Boolean' },
  date: { icon: <CalendarIcon className="w-3 h-3" />, label: 'Date' },
  email: { icon: <MailIcon className="w-3 h-3" />, label: 'Email' },
  phone: { icon: <PhoneIcon className="w-3 h-3" />, label: 'Phone' },
  url: { icon: <LinkIcon className="w-3 h-3" />, label: 'URL' },
  select: { icon: <TagIcon className="w-3 h-3" />, label: 'Select' },
}

function generateId() {
  return 'attr_' + Math.random().toString(36).substring(2, 10)
}

interface UserAttributesConfigProps {
  appId: string
  mode: 'default' | 'app'
}

export default function UserAttributesConfig({ appId, mode }: UserAttributesConfigProps) {
  const [defaultAttributes, setDefaultAttributes] = useState<UserAttribute[]>([...SYSTEM_ATTRIBUTES])
  const [appAttributes, setAppAttributes] = useState<UserAttribute[]>([])
  const [appOverrides, setAppOverrides] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAttr, setNewAttr] = useState<Partial<UserAttribute>>({ name: '', label: '', type: 'text', required: false })

  const isAppMode = mode === 'app'

  useEffect(() => {
    loadData()
  }, [appId, mode])

  useEffect(() => {
    if (statusMsg) {
      const t = setTimeout(() => setStatusMsg(null), 3000)
      return () => clearTimeout(t)
    }
  }, [statusMsg])

  const loadData = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      if (isAppMode) {
        const res = await adminService.getAppConfigOverride(appId, 'user-attributes')
        const defaults = await adminService.getDefaultUserAttributes()
        setDefaultAttributes(defaults.attributes || [...SYSTEM_ATTRIBUTES])
        
        if (!res.useDefault && res.config) {
          setAppAttributes(res.config.appAttributes || [])
          setAppOverrides(res.config.overrides || {})
        }
      } else {
        const res = await adminService.getDefaultUserAttributes()
        setDefaultAttributes(res.attributes || [...SYSTEM_ATTRIBUTES])
      }
    } catch (err) {
      console.error('Failed to load attributes:', err)
      setLoadError('Failed to load attributes.')
    } finally {
      setIsLoading(false)
    }
  }

  const attributes = isAppMode ? [...defaultAttributes, ...appAttributes] : defaultAttributes

  const addAttribute = () => {
    if (!newAttr.name || !newAttr.label) return
    const attr: UserAttribute = {
      id: generateId(),
      name: newAttr.name || '',
      label: newAttr.label || '',
      type: newAttr.type as UserAttribute['type'] || 'text',
      required: newAttr.required || false,
      isSystem: false,
      options: newAttr.type === 'select' ? ['Option 1'] : undefined,
    }
    if (isAppMode) {
      setAppAttributes(prev => [...prev, attr])
    } else {
      setDefaultAttributes(prev => [...prev, attr])
    }
    setNewAttr({ name: '', label: '', type: 'text', required: false })
    setShowAddForm(false)
  }

  const removeAttribute = (id: string) => {
    if (isAppMode) {
      setAppAttributes(prev => prev.filter(a => a.id !== id))
    } else {
      setDefaultAttributes(prev => prev.filter(a => a.id !== id))
    }
  }

  const toggleOverride = (id: string) => {
    setAppOverrides(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (isAppMode) {
        const payload = { 
          defaultAttributes, 
          appAttributes, 
          overrides: appOverrides,
          useDefault: false // If they are saving here, we assume they want to use overrides
        }
        await adminService.saveAppConfig(appId, 'user-attributes', payload)
      } else {
        await adminService.saveDefaultUserAttributes(defaultAttributes)
      }
      setStatusMsg({ type: 'success', text: 'Attributes saved successfully' })
    } catch (err) {
      console.error('Failed to save attributes:', err)
      setStatusMsg({ type: 'error', text: 'Failed to save attributes' })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2Icon className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading attributes...</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <AlertTriangleIcon className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{loadError}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCwIcon className="w-4 h-4 mr-1.5" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Status Msg */}
      {statusMsg && (
        <div className={`p-3 rounded-lg text-xs font-medium ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <PlusIcon className="w-4 h-4 mr-1" />
            {isAppMode ? 'Custom Attribute' : 'Add Attribute'}
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            {saving ? <Loader2Icon className="w-4 h-4 mr-1 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-blue-200/50 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5 p-4 space-y-3">
          <h5 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tight">New Attribute</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Field Name</label>
              <input
                type="text"
                value={newAttr.name || ''}
                onChange={e => setNewAttr(p => ({ ...p, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))}
                placeholder="e.g. company_name"
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Display Label</label>
              <input
                type="text"
                value={newAttr.label || ''}
                onChange={e => setNewAttr(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Company Name"
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Type</label>
              <select
                title="Attribute type"
                value={newAttr.type || 'text'}
                onChange={e => setNewAttr(p => ({ ...p, type: e.target.value as UserAttribute['type'] }))}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer pb-1">
                <input type="checkbox" checked={newAttr.required || false} onChange={() => setNewAttr(p => ({ ...p, required: !p.required }))} className="w-3.5 h-3.5 text-blue-500 border-gray-300 dark:border-zinc-600 rounded" />
                <span className="text-xs text-gray-500">Required</span>
              </label>
              <Button size="sm" onClick={addAttribute} className="bg-blue-500 text-white border-0 ml-auto">Add</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Attributes List */}
      <div className="space-y-2">
        {/* System / Default Attributes */}
        <div className="px-1 mb-1">
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isAppMode ? 'Platform Default Attributes' : 'System & Custom Attributes'}
          </h5>
        </div>
        {defaultAttributes.map(attr => {
          const meta = TYPE_META[attr.type]
          const isDisabledInApp = isAppMode && appOverrides[attr.id] === false

          return (
            <div key={attr.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isDisabledInApp ? 'border-gray-200/50 dark:border-zinc-800/50 opacity-50' : 'border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${attr.isSystem ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 'bg-violet-50 dark:bg-violet-500/10 text-violet-500'}`}>
                  {meta?.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{attr.label}</span>
                    {attr.isSystem && <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-[8px] font-bold text-blue-600 uppercase rounded">System</span>}
                    {attr.required && <span className="text-[8px] font-bold text-red-500 uppercase">Required</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">{attr.name} · {meta?.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAppMode && (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" title={`Toggle ${attr.label} for this app`} className="sr-only peer" checked={appOverrides[attr.id] !== false} onChange={() => toggleOverride(attr.id)} />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                )}
                {!attr.isSystem && (
                  <button title={`Remove ${attr.label}`} onClick={() => removeAttribute(attr.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* App-specific custom attributes */}
        {isAppMode && appAttributes.length > 0 && (
          <>
            <div className="px-1 mt-4 mb-1">
              <h5 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">App-Specific Custom Attributes</h5>
            </div>
            {appAttributes.map(attr => {
              const meta = TYPE_META[attr.type]
              return (
                <div key={attr.id} className="flex items-center justify-between p-3 rounded-xl border border-orange-500/20 bg-orange-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 dark:bg-orange-500/10 text-orange-500">
                      {meta?.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{attr.label}</span>
                        <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-[8px] font-bold text-orange-600 uppercase rounded">Custom</span>
                        {attr.required && <span className="text-[8px] font-bold text-red-500 uppercase">Required</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono">{attr.name} · {meta?.label}</p>
                    </div>
                  </div>
                  <button title={`Remove ${attr.label}`} onClick={() => removeAttribute(attr.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
