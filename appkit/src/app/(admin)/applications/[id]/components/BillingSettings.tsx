import React from 'react'
import { AppBillingConfig } from '../page'

interface BillingSettingsProps {
  circleBillingMode: 'perCircleLevel' | 'perAccount'
  onSaveCircleBillingMode: (mode: 'perCircleLevel' | 'perAccount') => void
  circleBillingModeSaving: boolean
  billingConfig: AppBillingConfig
  onOpenBillingDrawer: (provider: string) => void
  billingProviders: readonly { value: string; label: string }[]
}

export const BillingSettings: React.FC<BillingSettingsProps> = ({
  circleBillingMode,
  onSaveCircleBillingMode,
  circleBillingModeSaving,
  billingConfig,
  onOpenBillingDrawer,
  billingProviders,
}) => {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Billing Method Scope</h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Choose whether billing is charged per user account or per circle level.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              title="Billing method scope"
              value={circleBillingMode || 'perAccount'}
              onChange={(e) => onSaveCircleBillingMode(e.target.value as 'perCircleLevel' | 'perAccount')}
              disabled={circleBillingModeSaving}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg"
            >
              <option value="perAccount">Per User</option>
              <option value="perCircleLevel">Per Circle</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Available Billing Methods</h4>
          <span className="text-[11px] text-gray-500 dark:text-zinc-400">Click a method card to configure</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {billingProviders.map((provider) => {
            const isActive = billingConfig.provider === provider.value
            const isEnabled = !!billingConfig.providerEnabled?.[provider.value]
            return (
              <button
                key={provider.value}
                onClick={() => onOpenBillingDrawer(provider.value)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  isActive
                    ? 'border-blue-300 bg-blue-50/30 dark:border-blue-500/40 dark:bg-blue-500/10'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-blue-50/20 dark:hover:bg-blue-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{provider.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase ${isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {isActive && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Selected</span>}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {isActive ? `Mode: ${billingConfig.mode} · Currency: ${billingConfig.currency}` : 'Click to configure this method'}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
