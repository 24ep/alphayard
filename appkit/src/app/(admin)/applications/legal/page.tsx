'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  ScaleIcon,
  FileTextIcon,
  ShieldIcon,
  GlobeIcon,
  SaveIcon,
  InfoIcon,
  PlusIcon,
  EditIcon,
  CheckCircleIcon,
} from 'lucide-react'

interface LegalDocument {
  id: string
  title: string
  desc: string
  lastUpdated: string
  status: 'Published' | 'Draft'
  version: string
}

const defaultDocuments: LegalDocument[] = [
  { id: 'tos', title: 'Terms of Service', desc: 'General terms and conditions of service usage', lastUpdated: '2024-02-15', status: 'Published', version: 'v2.1' },
  { id: 'privacy', title: 'Privacy Policy', desc: 'Data collection, usage, and protection policies', lastUpdated: '2024-02-10', status: 'Published', version: 'v3.0' },
  { id: 'cookie', title: 'Cookie Policy', desc: 'Cookie usage and tracking consent information', lastUpdated: '2024-01-20', status: 'Draft', version: 'v1.2' },
  { id: 'dpa', title: 'Data Processing Agreement', desc: 'GDPR-compliant data processing terms', lastUpdated: '2024-01-15', status: 'Published', version: 'v1.0' },
  { id: 'aup', title: 'Acceptable Use Policy', desc: 'Guidelines for appropriate usage of services', lastUpdated: '2024-01-10', status: 'Draft', version: 'v1.0' },
]

export default function DefaultLegalPage() {
  const [documents, setDocuments] = useState(defaultDocuments)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Legal & Compliance</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Manage default legal documents and compliance settings. Individual applications inherit these unless overridden.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Document
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/25">
            <SaveIcon className="w-4 h-4 mr-2" />
            Save Defaults
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/20">
        <InfoIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Default Configuration</p>
          <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">
            These legal documents serve as the platform-wide defaults. Each application can choose to use these defaults or upload individual documents.
          </p>
        </div>
      </div>

      {/* Legal Documents */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileTextIcon className="w-4 h-4 mr-2 text-gray-400" />
          Legal Documents
        </h2>
        <div className="space-y-3">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <ScaleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.title}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{doc.desc}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400 dark:text-zinc-500">{doc.version}</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">Updated: {doc.lastUpdated}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    doc.status === 'Published'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {doc.status}
                  </span>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <EditIcon className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Settings */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ShieldIcon className="w-4 h-4 mr-2 text-violet-500" />
          Compliance Settings
        </h2>
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4 space-y-2">
          {[
            { name: 'GDPR Compliance Mode', desc: 'Enable GDPR-specific data handling requirements', enabled: true },
            { name: 'Cookie Consent Banner', desc: 'Show cookie consent banner to users', enabled: true },
            { name: 'Data Retention Policy', desc: 'Automatically purge user data after retention period', enabled: false },
            { name: 'Right to Erasure', desc: 'Allow users to request data deletion', enabled: true },
            { name: 'Data Export', desc: 'Allow users to export their data', enabled: true },
            { name: 'Age Verification', desc: 'Require age verification for new accounts', enabled: false },
          ].map(item => (
            <div key={item.name} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={item.enabled} />
                <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data Retention */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <GlobeIcon className="w-4 h-4 mr-2 text-emerald-500" />
          Data Retention Defaults
        </h2>
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'User Data Retention (days)', defaultValue: '365' },
              { label: 'Audit Log Retention (days)', defaultValue: '90' },
              { label: 'Session Data Retention (days)', defaultValue: '30' },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">{field.label}</label>
                <input
                  type="number"
                  defaultValue={field.defaultValue}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
