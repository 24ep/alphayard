'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, ChevronRight, CornerDownLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { searchDocs } from '../data/docs'
import { cn } from '@/lib/utils'

export default function DevHubSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(searchDocs)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setQuery('')
      setResults(searchDocs)
    }
  }, [isOpen])

  useEffect(() => {
    const filtered = searchDocs.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.description.toLowerCase().includes(query.toLowerCase()) ||
      doc.slug.toLowerCase().includes(query.toLowerCase())
    )
    setResults(filtered)
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[selectedIndex].href)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-sm flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all group text-slate-400"
      >
        <Search className="h-4 w-4 group-hover:text-blue-600 transition-colors" />
        <span className="text-sm font-medium">Search documentation...</span>
        <kbd className="ml-auto hidden sm:flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            ref={overlayRef}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((doc, index) => (
                    <button
                      key={doc.slug}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => handleSelect(doc.href)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                        index === selectedIndex ? "bg-blue-50 dark:bg-blue-900/20 shadow-sm" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                        index === selectedIndex ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-bold truncate",
                            index === selectedIndex ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"
                          )}>
                            {doc.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{doc.description}</p>
                      </div>
                      {index === selectedIndex && (
                        <div className="flex items-center gap-1.5 text-blue-600 animate-in fade-in slide-in-from-right-2 duration-200">
                          <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
                          <CornerDownLeft className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No results found for &quot;{query}&quot;</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching for something else.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="h-5 w-5 flex items-center justify-center rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-500 shadow-sm">↑</kbd>
                  <kbd className="h-5 w-5 flex items-center justify-center rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-500 shadow-sm">↓</kbd>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="h-5 w-8 flex items-center justify-center rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-500 shadow-sm">esc</kbd>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Close</span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                {results.length} Results
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
