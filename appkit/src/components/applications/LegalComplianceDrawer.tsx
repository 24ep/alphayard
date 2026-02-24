'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  XIcon, 
  ScaleIcon, 
  FileTextIcon, 
  ShieldIcon, 
  GlobeIcon,
  CheckCircleIcon,
  HelpCircleIcon,
  SaveIcon
} from 'lucide-react'

interface LegalComplianceDrawerProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  applicationName: string
}

export default function LegalComplianceDrawer({ isOpen, onClose, applicationId, applicationName }: LegalComplianceDrawerProps) {
  const [configMode, setConfigMode] = useState<'default' | 'individual'>('default')
  
  const [settings, setSettings] = useState({
    termsUrl: 'https://example.com/terms',
    privacyUrl: 'https://example.com/privacy',
    cookiePolicyUrl: 'https://example.com/cookies',
    requireConsent: true,
    dataResidency: 'US',
    complianceStandard: 'GDPR'
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-zinc-800">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950 sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ScaleIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Legal & Compliance</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{applicationName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-zinc-400">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 dark:bg-zinc-900/30">
            {/* Config Mode Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                Configuration Mode
                <HelpCircleIcon className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfigMode('default')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    configMode === 'default'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-1 ring-blue-500'
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${configMode === 'default' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      Default Config
                    </span>
                    {configMode === 'default' && <CheckCircleIcon className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Inherit platform default legal settings
                  </p>
                </button>
                <button
                  onClick={() => setConfigMode('individual')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    configMode === 'individual'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${configMode === 'individual' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                      Individual Config
                    </span>
                    {configMode === 'individual' && <CheckCircleIcon className="w-4 h-4 text-indigo-500" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Custom legal docs for this specific app
                  </p>
                </button>
              </div>
            </div>

            {/* Legal Form Section */}
            <div className={`space-y-6 transition-all duration-200 ${configMode === 'default' ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Legal Documents</h3>
                {configMode === 'default' && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                    Read-only
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Terms of Service URL</label>
                  <input 
                    type="text" 
                    value={settings.termsUrl} 
                    onChange={(e) => setSettings({...settings, termsUrl: e.target.value})}
                    disabled={configMode === 'default'}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Privacy Policy URL</label>
                  <input 
                    type="text" 
                    value={settings.privacyUrl} 
                    onChange={(e) => setSettings({...settings, privacyUrl: e.target.value})}
                    disabled={configMode === 'default'}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center space-x-3">
                    <ShieldIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Require explicit consent</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-500">Force users to agree during registration</p>
                    </div>
                  </div>
                  <label className={`relative inline-flex items-center ${configMode === 'individual' ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.requireConsent} 
                      onChange={(e) => setSettings({...settings, requireConsent: e.target.checked})} 
                      disabled={configMode === 'default'}
                    />
                    <div className="w-10 h-5 bg-gray-200 dark:bg-zinc-800 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Compliance & Standard</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Data Residency</label>
                    <select 
                      value={settings.dataResidency} 
                      onChange={(e) => setSettings({...settings, dataResidency: e.target.value})}
                      disabled={configMode === 'default'}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="US">US</option>
                      <option value="EU">EU</option>
                      <option value="SG">SG</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Standard</label>
                    <select 
                      value={settings.complianceStandard} 
                      onChange={(e) => setSettings({...settings, complianceStandard: e.target.value})}
                      disabled={configMode === 'default'}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="GDPR">GDPR</option>
                      <option value="CCPA">CCPA</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-end space-x-3 sticky bottom-0 z-10">
            <Button variant="outline" onClick={onClose} className="border-gray-200 dark:border-zinc-800">
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/20 px-8" onClick={onClose}>
              Save Legal Config
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
