'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/cms/RichTextEditor'
import { ScaleIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react'

interface LegalDocument {
  id: string
  title: string
  type: string
  version: string
  status: 'Published' | 'Draft' | 'Archived'
  lastUpdated: string
  content: string
}

interface LegalConfig {
  documents: LegalDocument[]
  compliance: Record<string, boolean>
  retention: { userData: number; auditLog: number; sessionData: number }
}

export default function LegalCompliancePage() {
  const [config, setConfig] = useState<LegalConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: '',
    version: 'v1.0',
    status: 'Draft' as LegalDocument['status'],
  })

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('admin_token') || ''
        const res = await fetch('/api/v1/admin/system/config/legal', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load legal settings')
        const data = await res.json()
        const loaded = data?.config as LegalConfig
        setConfig(loaded)
        setActiveDocId(loaded?.documents?.[0]?.id || null)
      } catch (err) {
        console.error(err)
        setMessage('Failed to load legal settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async () => {
    if (!config) return
    try {
      setSaving(true)
      const token = localStorage.getItem('admin_token') || ''
      const res = await fetch('/api/v1/admin/system/config/legal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ config }),
      })
      if (!res.ok) throw new Error('Failed to save legal settings')
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

  const addDocument = () => {
    if (!config || !newDoc.title.trim() || !newDoc.type.trim()) return
    const created: LegalDocument = {
      id: `legal-${crypto.randomUUID()}`,
      title: newDoc.title.trim(),
      type: newDoc.type.trim(),
      version: newDoc.version.trim() || 'v1.0',
      status: newDoc.status,
      lastUpdated: new Date().toISOString().split('T')[0],
      content: '',
    }
    const next = { ...config, documents: [...config.documents, created] }
    setConfig(next)
    setActiveDocId(created.id)
    setShowModal(false)
    setNewDoc({ title: '', type: '', version: 'v1.0', status: 'Draft' })
  }

  const removeDocument = (id: string) => {
    if (!config) return
    const nextDocs = config.documents.filter((d) => d.id !== id)
    setConfig({ ...config, documents: nextDocs })
    if (activeDocId === id) {
      setActiveDocId(nextDocs[0]?.id || null)
    }
  }

  const activeDoc = config?.documents.find((d) => d.id === activeDocId) || null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Legal & Compliance</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Edit legal documents inline using rich text and persist globally.</p>
        </div>
        <div className="flex items-center gap-2">
          {message && <span className={`text-xs font-medium ${message === 'Saved!' ? 'text-emerald-600' : 'text-red-500'}`}>{message}</span>}
          <Button variant="outline" onClick={() => setShowModal(true)}>
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Add Document
          </Button>
          <Button onClick={save} disabled={saving || loading} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <SaveIcon className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6">
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {!loading && config && (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6">
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {config.documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    doc.id === activeDocId
                      ? 'border-blue-300 bg-blue-50/40 dark:border-blue-500/30 dark:bg-blue-500/10'
                      : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ScaleIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{doc.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeDocument(doc.id)
                      }}
                      title="Remove document"
                      className="p-1 rounded hover:bg-red-50 text-red-400"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Updated: {doc.lastUpdated}</p>
                </button>
              ))}
            </div>
            {activeDoc ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={activeDoc.title}
                    onChange={(e) =>
                      setConfig((prev) =>
                        prev
                          ? {
                              ...prev,
                              documents: prev.documents.map((d) =>
                                d.id === activeDoc.id ? { ...d, title: e.target.value } : d
                              ),
                            }
                          : prev
                      )
                    }
                    className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                    placeholder="Document title"
                  />
                  <input
                    type="text"
                    value={activeDoc.version}
                    onChange={(e) =>
                      setConfig((prev) =>
                        prev
                          ? {
                              ...prev,
                              documents: prev.documents.map((d) =>
                                d.id === activeDoc.id ? { ...d, version: e.target.value } : d
                              ),
                            }
                          : prev
                      )
                    }
                    className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                    placeholder="Version"
                  />
                  <select
                    title="Document status"
                    value={activeDoc.status}
                    onChange={(e) =>
                      setConfig((prev) =>
                        prev
                          ? {
                              ...prev,
                              documents: prev.documents.map((d) =>
                                d.id === activeDoc.id ? { ...d, status: e.target.value as LegalDocument['status'] } : d
                              ),
                            }
                          : prev
                      )
                    }
                    className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <RichTextEditor
                  content={activeDoc.content || ''}
                  onChange={(content) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            documents: prev.documents.map((d) =>
                              d.id === activeDoc.id
                                ? {
                                    ...d,
                                    content,
                                    lastUpdated: new Date().toISOString().split('T')[0],
                                  }
                                : d
                            ),
                          }
                        : prev
                    )
                  }
                  placeholder={`Write ${activeDoc.title} content here...`}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No document selected.</p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Legal Document</h3>
            <input
              type="text"
              value={newDoc.title}
              onChange={(e) => setNewDoc((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
            />
            <input
              type="text"
              value={newDoc.type}
              onChange={(e) => setNewDoc((prev) => ({ ...prev, type: e.target.value }))}
              placeholder="Type slug (e.g. privacy-policy)"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={addDocument} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
