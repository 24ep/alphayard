'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { adminService } from '@/services/adminService'
import {
  XIcon,
  ScaleIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  SaveIcon,
  Loader2Icon,
  RotateCcwIcon,
  FileTextIcon,
  ClockIcon,
  PlusIcon,
  Trash2Icon,
  LinkIcon,
  PenLineIcon,
  BoldIcon,
  ItalicIcon,
  ListIcon,
  Heading2Icon,
  EyeIcon,
  CodeIcon,
  MaximizeIcon,
  MinimizeIcon,
} from 'lucide-react'

interface LegalConfigDrawerProps {
  isOpen: boolean
  onClose: () => void
  appId: string
  appName: string
}

interface LegalDocument {
  id: string
  title: string
  type: string
  version: string
  status: string
  lastUpdated: string
  url?: string
  content?: string
  contentMode?: 'url' | 'content'
}

interface LegalConfig {
  documents: LegalDocument[]
  compliance: Record<string, boolean>
  retention: { userData: number; auditLog: number; sessionData: number }
}

const COMPLIANCE_ITEMS = [
  { key: 'gdprMode', name: 'GDPR Compliance' },
  { key: 'cookieConsent', name: 'Cookie Consent' },
  { key: 'dataRetention', name: 'Data Retention' },
  { key: 'rightToErasure', name: 'Right to Erasure' },
  { key: 'dataExport', name: 'Data Export' },
  { key: 'ageVerification', name: 'Age Verification' },
]

export default function LegalConfigDrawer({ isOpen, onClose, appId, appName }: LegalConfigDrawerProps) {
  const [useDefault, setUseDefault] = useState(true)
  const [config, setConfig] = useState<LegalConfig | null>(null)
  const [defaultConfig, setDefaultConfig] = useState<LegalConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)
  const [previewDocId, setPreviewDocId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && appId) loadData()
  }, [isOpen, appId])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await adminService.getAppConfigOverride(appId, 'legal')
      setUseDefault(res.useDefault)

      const defaults = await adminService.getDefaultLegalConfig()
      setDefaultConfig(defaults.config)

      if (!res.useDefault && res.config) {
        // Merge global docs with app overrides to ensure new global docs are visible
        const mergedDocs = (defaults.config?.documents || []).map((defDoc: any) => {
          const overrideDoc = res.config.documents?.find((d: any) => d.id === defDoc.id)
          return overrideDoc ? { ...defDoc, ...overrideDoc } : defDoc
        })

        // Also include any app-specific docs that don't exist in defaults
        const appSpecificDocs = (res.config.documents || []).filter(
          (ad: any) => !defaults.config?.documents.some((dd: any) => dd.id === ad.id)
        )

        setConfig({ 
          ...res.config, 
          documents: [...mergedDocs, ...appSpecificDocs] 
        })
      } else {
        setConfig(defaults.config)
      }
    } catch (err) {
      console.error('Failed to load app legal config:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleUseDefault = async (val: boolean) => {
    setUseDefault(val)
    if (val) {
      try {
        await adminService.deleteAppConfig(appId, 'legal')
        setConfig(defaultConfig)
      } catch (err) {
        console.error('Failed to revert to default:', err)
      }
    }
  }

  const toggleCompliance = (key: string) => {
    if (!config) return
    setConfig({ ...config, compliance: { ...config.compliance, [key]: !config.compliance[key] } })
  }

  const handleSave = async () => {
    if (!config) return
    try {
      setSaving(true)
      await adminService.saveAppConfig(appId, 'legal', config)
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
      <div className="fixed top-4 right-4 bottom-4 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 dark:border-zinc-800/80">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Legal & Compliance Config</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{appName}</p>
          </div>
          <button onClick={onClose} title="Close drawer" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500"><XIcon className="w-5 h-5" /></button>
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
                    {COMPLIANCE_ITEMS.map(item => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700 dark:text-zinc-300">{item.name}</span>
                        {defaultConfig?.compliance[item.key] ? <CheckCircleIcon className="w-4 h-4 text-emerald-500" /> : <XCircleIcon className="w-4 h-4 text-gray-300 dark:text-zinc-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              ) : config ? (
                <div className="space-y-6">
                  {/* Compliance Toggles */}
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldIcon className="w-3 h-3 text-violet-500" />
                        Compliance Settings
                      </h3>
                      <span className="text-[10px] text-gray-400 italic">Adjust individual markers</span>
                    </div>
                    <div className="space-y-2">
                      {COMPLIANCE_ITEMS.map(item => {
                        const val = config.compliance[item.key]
                        const defVal = defaultConfig?.compliance[item.key]
                        const isOverridden = val !== defVal

                        return (
                          <div key={item.key} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isOverridden ? 'border-violet-500/30 bg-violet-500/5 shadow-sm' : 'border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900'}`}>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                                {isOverridden && <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-500/20 text-[9px] font-bold text-violet-600 uppercase rounded">Custom</span>}
                              </div>
                              <p className="text-[9px] text-gray-400">
                                {isOverridden ? 'Custom policy applied' : 'Inheriting platform policy'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {isOverridden && (
                                <button 
                                  onClick={() => setConfig({ ...config, compliance: { ...config.compliance, [item.key]: !!defVal } })}
                                  className="p-1.5 hover:bg-violet-100 rounded-md text-violet-500"
                                  title="Reset to Default"
                                >
                                  <RotateCcwIcon className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" title={`Toggle ${item.name}`} checked={val ?? false} onChange={() => toggleCompliance(item.key)} />
                                <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Legal Documents with Content Editor */}
                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileTextIcon className="w-3 h-3 text-blue-500" />
                        Legal Documents
                      </h3>
                      <button
                        onClick={() => {
                          const newDoc: LegalDocument = {
                            id: `custom-${Date.now()}`,
                            title: 'New Document',
                            type: 'custom',
                            version: '1.0',
                            status: 'Draft',
                            lastUpdated: new Date().toISOString().split('T')[0],
                            url: '',
                            content: '',
                            contentMode: 'content',
                          }
                          setConfig(prev => prev ? { ...prev, documents: [...prev.documents, newDoc] } : prev)
                          setExpandedDocId(newDoc.id)
                        }}
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                      >
                        <PlusIcon className="w-3 h-3" /> Add Document
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(config.documents || []).map(doc => {
                        const defDoc = defaultConfig?.documents.find(d => d.id === doc.id)
                        const isUrlOverridden = doc.url !== defDoc?.url
                        const isContentOverridden = !!(doc.content && doc.content !== defDoc?.content)
                        const isOverridden = isUrlOverridden || isContentOverridden
                        const isCustom = !defDoc
                        const mode = doc.contentMode || 'url'
                        const isExpanded = expandedDocId === doc.id
                        const isPreviewing = previewDocId === doc.id

                        return (
                          <div key={doc.id} className={`rounded-xl border transition-all ${isCustom ? 'border-emerald-500/20 bg-emerald-500/5' : isOverridden ? 'border-blue-500/20 bg-blue-500/5' : 'border-gray-200/80 dark:border-zinc-800/80'}`}>
                            {/* Document Header */}
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {isCustom ? (
                                    <input
                                      type="text"
                                      value={doc.title}
                                      onChange={e => {
                                        setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, title: e.target.value } : d) } : prev)
                                      }}
                                      className="text-[10px] font-bold text-gray-700 dark:text-zinc-200 uppercase tracking-tight bg-transparent border-b border-dashed border-gray-300 dark:border-zinc-600 focus:outline-none focus:border-blue-500 px-0 py-0.5"
                                      placeholder="Document Title"
                                    />
                                  ) : (
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{doc.title}</label>
                                  )}
                                  {isCustom && <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-[8px] font-bold text-emerald-600 uppercase rounded">Custom</span>}
                                  {!isCustom && isOverridden && <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-[8px] font-bold text-blue-600 uppercase rounded">Overridden</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  {!isCustom && isOverridden && (
                                    <button 
                                      onClick={() => setConfig({ ...config, documents: config.documents.map(d => d.id === doc.id ? { ...d, url: defDoc?.url, content: defDoc?.content, contentMode: defDoc?.contentMode } : d) })}
                                      className="text-[10px] font-bold text-blue-500 flex items-center gap-1"
                                    >
                                      <RotateCcwIcon className="w-2.5 h-2.5" /> Inherit
                                    </button>
                                  )}
                                  {isCustom && (
                                    <button 
                                      onClick={() => setConfig(prev => prev ? { ...prev, documents: prev.documents.filter(d => d.id !== doc.id) } : prev)}
                                      className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors"
                                      title="Remove document"
                                    >
                                      <Trash2Icon className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Content Mode Toggle */}
                              <div className="flex items-center gap-1 mb-3 p-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md w-fit">
                                <button
                                  onClick={() => setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, contentMode: 'url' } : d) } : prev)}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                                    mode === 'url'
                                      ? 'bg-white dark:bg-zinc-700 shadow text-gray-900 dark:text-white'
                                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
                                  }`}
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  URL
                                </button>
                                <button
                                  onClick={() => {
                                    setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, contentMode: 'content' } : d) } : prev)
                                    setExpandedDocId(doc.id)
                                  }}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                                    mode === 'content'
                                      ? 'bg-white dark:bg-zinc-700 shadow text-gray-900 dark:text-white'
                                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
                                  }`}
                                >
                                  <PenLineIcon className="w-3 h-3" />
                                  Write Content
                                </button>
                              </div>

                              {/* URL Input */}
                              {mode === 'url' && (
                                <>
                                  <input
                                    type="url"
                                    placeholder={defDoc?.url || `https://your-domain.com/${doc.type}`}
                                    value={doc.url || ''}
                                    onChange={e => {
                                      setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, url: e.target.value } : d) } : prev)
                                    }}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                  />
                                  {!isCustom && !isUrlOverridden && defDoc?.url && (
                                    <p className="text-[9px] text-gray-400 mt-1 italic">Using platform default URL</p>
                                  )}
                                </>
                              )}

                              {/* Content Editor */}
                              {mode === 'content' && (
                                <div className="space-y-2">
                                  {/* Toolbar */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">
                                      <button
                                        onClick={() => {
                                          const ta = document.getElementById(`legal-editor-${doc.id}`) as HTMLTextAreaElement
                                          if (!ta) return
                                          const start = ta.selectionStart
                                          const end = ta.selectionEnd
                                          const selected = ta.value.substring(start, end)
                                          const replacement = `**${selected || 'bold text'}**`
                                          const newContent = ta.value.substring(0, start) + replacement + ta.value.substring(end)
                                          setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, content: newContent } : d) } : prev)
                                        }}
                                        className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white transition-colors"
                                        title="Bold"
                                      >
                                        <BoldIcon className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const ta = document.getElementById(`legal-editor-${doc.id}`) as HTMLTextAreaElement
                                          if (!ta) return
                                          const start = ta.selectionStart
                                          const end = ta.selectionEnd
                                          const selected = ta.value.substring(start, end)
                                          const replacement = `*${selected || 'italic text'}*`
                                          const newContent = ta.value.substring(0, start) + replacement + ta.value.substring(end)
                                          setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, content: newContent } : d) } : prev)
                                        }}
                                        className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white transition-colors"
                                        title="Italic"
                                      >
                                        <ItalicIcon className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const ta = document.getElementById(`legal-editor-${doc.id}`) as HTMLTextAreaElement
                                          if (!ta) return
                                          const start = ta.selectionStart
                                          const newContent = ta.value.substring(0, start) + '\n## Heading\n' + ta.value.substring(start)
                                          setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, content: newContent } : d) } : prev)
                                        }}
                                        className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white transition-colors"
                                        title="Heading"
                                      >
                                        <Heading2Icon className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const ta = document.getElementById(`legal-editor-${doc.id}`) as HTMLTextAreaElement
                                          if (!ta) return
                                          const start = ta.selectionStart
                                          const newContent = ta.value.substring(0, start) + '\n- List item\n' + ta.value.substring(start)
                                          setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, content: newContent } : d) } : prev)
                                        }}
                                        className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white transition-colors"
                                        title="List"
                                      >
                                        <ListIcon className="w-3 h-3" />
                                      </button>
                                      <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700 mx-0.5" />
                                      <button
                                        onClick={() => setPreviewDocId(isPreviewing ? null : doc.id)}
                                        className={`p-1.5 rounded transition-colors ${isPreviewing ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' : 'hover:bg-white dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white'}`}
                                        title="Preview"
                                      >
                                        <EyeIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 transition-colors"
                                        title={isExpanded ? 'Collapse' : 'Expand'}
                                      >
                                        {isExpanded ? <MinimizeIcon className="w-3 h-3" /> : <MaximizeIcon className="w-3 h-3" />}
                                      </button>
                                      <span className="text-[9px] text-gray-400 font-mono">{(doc.content || '').length} chars</span>
                                    </div>
                                  </div>

                                  {/* Editor / Preview */}
                                  {isPreviewing ? (
                                    <div className={`bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 overflow-y-auto prose prose-sm dark:prose-invert max-w-none ${isExpanded ? 'min-h-[320px] max-h-[500px]' : 'min-h-[120px] max-h-[200px]'}`}>
                                      {(doc.content || '').split('\n').map((line, i) => {
                                        if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1">{line.slice(3)}</h2>
                                        if (line.startsWith('# ')) return <h1 key={i} className="text-base font-bold text-gray-900 dark:text-white mt-4 mb-1">{line.slice(2)}</h1>
                                        if (line.startsWith('- ')) return <ul key={i}><li className="text-xs text-gray-700 dark:text-zinc-300 ml-4 list-disc">{line.slice(2)}</li></ul>
                                        if (line.trim() === '') return <br key={i} />
                                        return <p key={i} className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
                                          {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                                            j % 2 === 1 ? <strong key={j}>{part}</strong> : 
                                            part.split(/\*(.*?)\*/g).map((sub, k) =>
                                              k % 2 === 1 ? <em key={k}>{sub}</em> : sub
                                            )
                                          )}
                                        </p>
                                      })}
                                      {!(doc.content || '').trim() && <p className="text-xs text-gray-400 italic">No content yet. Switch to edit mode to start writing.</p>}
                                    </div>
                                  ) : (
                                    <textarea
                                      id={`legal-editor-${doc.id}`}
                                      value={doc.content || ''}
                                      onChange={e => {
                                        setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, content: e.target.value } : d) } : prev)
                                      }}
                                      placeholder={`Write your ${doc.title.toLowerCase()} content here...\n\n# Title\n## Section Heading\n\nYour legal text goes here. Use **bold** and *italic* for emphasis.\n\n- List item 1\n- List item 2`}
                                      className={`w-full px-3 py-2 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isExpanded ? 'min-h-[320px]' : 'min-h-[120px]'}`}
                                    />
                                  )}

                                  {/* Version & Status */}
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                      <label className="text-[9px] font-bold text-gray-400 uppercase">Version</label>
                                      <input
                                        type="text"
                                        title="Document version"
                                        value={doc.version}
                                        onChange={e => setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, version: e.target.value } : d) } : prev)}
                                        className="w-14 px-1.5 py-0.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <label className="text-[9px] font-bold text-gray-400 uppercase">Status</label>
                                      <select
                                        title="Document status"
                                        value={doc.status}
                                        onChange={e => setConfig(prev => prev ? { ...prev, documents: prev.documents.map(d => d.id === doc.id ? { ...d, status: e.target.value } : d) } : prev)}
                                        className="px-1.5 py-0.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                                      >
                                        <option value="Draft">Draft</option>
                                        <option value="Published">Published</option>
                                        <option value="Archived">Archived</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Data Retention Overrides */}
                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ClockIcon className="w-3 h-3 text-amber-500" />
                        Data Retention
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { key: 'userData', name: 'User Data Retention', desc: 'How long to keep inactive user accounts (days)' },
                        { key: 'auditLog', name: 'Audit Log Retention', desc: 'Retention period for security and activity logs (days)' },
                        { key: 'sessionData', name: 'Session Data Retention', desc: 'How long to keep session metadata (days)' },
                      ].map(item => {
                        const val = config.retention?.[item.key as keyof typeof config.retention]
                        const defVal = defaultConfig?.retention?.[item.key as keyof typeof config.retention]
                        const isOverridden = val !== defVal

                        return (
                          <div key={item.key} className={`p-4 rounded-xl border transition-all ${isOverridden ? 'border-amber-500/20 bg-amber-500/5' : 'border-gray-200/80 dark:border-zinc-800/80'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{item.name}</label>
                                  {isOverridden && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-[8px] font-bold text-amber-600 uppercase rounded">Custom</span>}
                                </div>
                                <p className="text-[9px] text-gray-400">{item.desc}</p>
                              </div>
                              {isOverridden && (
                                <button 
                                  onClick={() => setConfig({ ...config, retention: { ...config.retention, [item.key]: defVal } })}
                                  className="text-[10px] font-bold text-amber-500 flex items-center gap-1"
                                >
                                  <RotateCcwIcon className="w-2.5 h-2.5" /> Inherit
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                title={`${item.name} in days`}
                                value={val || 0}
                                onChange={e => {
                                  const newVal = parseInt(e.target.value) || 0
                                  setConfig(prev => prev ? { ...prev, retention: { ...prev.retention, [item.key]: newVal } } : prev)
                                }}
                                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">days</span>
                            </div>
                            {!isOverridden && defVal && (
                              <p className="text-[9px] text-gray-400 mt-1 italic">Using platform default ({defVal} days)</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
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
