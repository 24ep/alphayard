import React from 'react'
import { SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ComplianceSettingsProps {
  legalConfig: any
  legalUseDefault: boolean
  onOpenLegalDrawer: () => void
}

export const ComplianceSettings: React.FC<ComplianceSettingsProps> = ({
  legalConfig,
  legalUseDefault,
  onOpenLegalDrawer,
}) => {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Legal & Compliance</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Legal & Compliance list. Click an item to edit in drawer.</p>
        </div>
        <Button onClick={onOpenLegalDrawer} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/25">
          <SettingsIcon className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="space-y-2">
        {[
          {
            name: 'Legal Documents',
            detail: `${(legalConfig?.documents || []).length} docs configured`,
            group: 'Documents',
          },
          {
            name: 'Compliance Methods',
            detail: legalUseDefault ? 'Using default values' : 'App override active',
            group: 'Compliance',
          },
          {
            name: 'Data Retention',
            detail: `User: ${legalConfig?.retention?.userData || 0}d · Audit: ${legalConfig?.retention?.auditLog || 0}d · Session: ${legalConfig?.retention?.sessionData || 0}d`,
            group: 'Retention',
          },
        ].map((item) => (
          <button
            key={item.name}
            onClick={onOpenLegalDrawer}
            className="w-full text-left rounded-lg border border-gray-200 dark:border-zinc-800 px-3 py-2.5 hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-blue-50/20 dark:hover:bg-blue-500/5 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                {item.group}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">{item.detail}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
