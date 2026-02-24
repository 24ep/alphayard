'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  ScaleIcon,
  FileTextIcon,
  ShieldIcon,
  GlobeIcon,
  CheckCircleIcon,
  SaveIcon
} from 'lucide-react'

export default function LegalDefaultPage() {
  const [settings, setSettings] = useState({
    termsUrl: 'https://example.com/terms',
    privacyUrl: 'https://example.com/privacy',
    cookiePolicyUrl: 'https://example.com/cookies',
    requireConsent: true,
    dataResidency: 'US',
    complianceStandard: 'GDPR'
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Legal & Compliance Defaults</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Configure default legal documents and compliance standards for all applications.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
        <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Default Configuration</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">Applications will inherit these documents and compliance settings unless overridden at the individual application level.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legal Documents */}
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
              <FileTextIcon className="w-4 h-4 mr-2" />
              Standard Legal Documents
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Terms of Service URL</label>
              <input 
                type="text" 
                value={settings.termsUrl} 
                onChange={(e) => setSettings({...settings, termsUrl: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Privacy Policy URL</label>
              <input 
                type="text" 
                value={settings.privacyUrl} 
                onChange={(e) => setSettings({...settings, privacyUrl: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Cookie Policy URL</label>
              <input 
                type="text" 
                value={settings.cookiePolicyUrl} 
                onChange={(e) => setSettings({...settings, cookiePolicyUrl: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-700 dark:text-zinc-300">Require explicit consent on signup</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.requireConsent} onChange={(e) => setSettings({...settings, requireConsent: e.target.checked})} />
                <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Compliance & Governance */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
              <ShieldIcon className="w-4 h-4 mr-2" />
              Compliance Standards
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Data Residency</label>
                <select 
                  value={settings.dataResidency} 
                  onChange={(e) => setSettings({...settings, dataResidency: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="US">United States (US)</option>
                  <option value="EU">European Union (EU)</option>
                  <option value="SG">Singapore (SG)</option>
                  <option value="AU">Australia (AU)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Default Standard</label>
                <select 
                  value={settings.complianceStandard} 
                  onChange={(e) => setSettings({...settings, complianceStandard: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="GDPR">GDPR</option>
                  <option value="CCPA">CCPA</option>
                  <option value="HIPAA">HIPAA</option>
                  <option value="SOC2">SOC2</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400">
              <ScaleIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Audit Trail & Governance</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Audit logs for legal consent and data residency changes are managed via the System History dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-8">
          <SaveIcon className="w-4 h-4 mr-2" />
          Save Legal Defaults
        </Button>
      </div>
    </div>
  )
}
