'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ServerIcon,
  UserIcon,
  UsersIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

interface SearchResult {
  type: 'application' | 'user' | 'circle' | 'nav'
  id: string
  label: string
  sub?: string
  href: string
}

// Static nav links included in search
const NAV_LINKS: SearchResult[] = [
  { type: 'nav', id: 'nav-dashboard', label: 'Dashboard', sub: 'Overview', href: '/dashboard' },
{ type: 'nav', id: 'nav-billing', label: 'Billing Plans', sub: 'Subscription plans', href: '/billing' },
{ type: 'nav', id: 'nav-storage', label: 'File Manager', sub: 'Storage', href: '/storage' },
{ type: 'nav', id: 'nav-audit', label: 'Audit Trail', sub: 'System', href: '/system/audit' },
  { type: 'nav', id: 'nav-sso', label: 'SSO', sub: 'System settings', href: '/system/sso' },
  { type: 'nav', id: 'nav-smtp', label: 'SMTP', sub: 'System settings', href: '/system/smtp' },
  { type: 'nav', id: 'nav-webhooks', label: 'Webhooks', sub: 'System settings', href: '/system/webhooks' },
  { type: 'nav', id: 'nav-api-keys', label: 'API Keys', sub: 'System settings', href: '/system/api-keys' },
  { type: 'nav', id: 'nav-health', label: 'System Health', sub: 'System', href: '/system/health' },
  { type: 'nav', id: 'nav-backups', label: 'Backups', sub: 'System', href: '/system/backups' },
{ type: 'nav', id: 'nav-alerts', label: 'Alerts', sub: 'System', href: '/system/alerts' },
]

function ResultIcon({ type }: { type: SearchResult['type'] }) {
  const cls = 'w-4 h-4 shrink-0'
  if (type === 'application') return <ServerIcon className={cls} />
  if (type === 'user') return <UserIcon className={cls} />
  if (type === 'circle') return <UsersIcon className={cls} />
  return <ArrowRightIcon className={cls} />
}

function typeLabel(type: SearchResult['type']): string {
  if (type === 'application') return 'App'
  if (type === 'user') return 'User'
  if (type === 'circle') return 'Circle'
  return 'Page'
}

function typeColor(type: SearchResult['type']): string {
  if (type === 'application') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
  if (type === 'user') return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  if (type === 'circle') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
  return 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300'
}

interface GlobalSearchProps {
  onClose: () => void
}

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Show nav links as default when no query
  useEffect(() => {
    if (!query.trim()) {
      setResults(NAV_LINKS.slice(0, 8))
      setActiveIdx(0)
      return
    }
  }, [query])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) return
    setLoading(true)
    try {
      const token = authService.getToken()
      const res = await fetch(`/api/v1/admin/search?q=${encodeURIComponent(q)}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) return
      const data = await res.json()
      const r = data.results ?? {}

      const mapped: SearchResult[] = [
        // Nav pages matching query
        ...NAV_LINKS.filter(n => n.label.toLowerCase().includes(q.toLowerCase()) || n.sub?.toLowerCase().includes(q.toLowerCase())),
        // Applications
        ...(r.applications ?? []).map((a: any): SearchResult => ({
          type: 'application', id: a.id, label: a.name, sub: a.slug, href: `/applications/${a.id}`,
        })),
        // Users
        ...(r.users ?? []).map((u: any): SearchResult => ({
          type: 'user', id: u.id, label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email, sub: u.email, href: `/users?search=${encodeURIComponent(u.email)}`,
        })),
        // Circles
        ...(r.circles ?? []).map((c: any): SearchResult => ({
          type: 'circle', id: c.id, label: c.name, sub: c.circleCode, href: `/applications/${c.applicationId}`,
        })),
      ]
      setResults(mapped.slice(0, 12))
      setActiveIdx(0)
    } catch { /* noop */ } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 200)
  }

  const navigate = (href: string) => {
    router.push(href)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[activeIdx]) { navigate(results[activeIdx].href) }
    if (e.key === 'Escape') { onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-zinc-800">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, users, applications…"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((r, idx) => (
              <li key={`${r.type}-${r.id}`}>
                <button
                  onClick={() => navigate(r.href)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    activeIdx === idx ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className={`p-1.5 rounded-lg ${typeColor(r.type)}`}>
                    <ResultIcon type={r.type} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.label}</p>
                    {r.sub && <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{r.sub}</p>}
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColor(r.type)}`}>
                    {typeLabel(r.type)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-zinc-400">No results for "{query}"</p>
        )}

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400 dark:text-zinc-500">
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-[10px]">↑↓</kbd> navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-[10px]">↵</kbd> open</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-[10px]">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
