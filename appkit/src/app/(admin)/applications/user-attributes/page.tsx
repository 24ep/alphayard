'use client'

import React from 'react'
import UserAttributesConfig from '@/components/applications/UserAttributesConfig'
import { 
  UsersIcon, 
  InfoIcon,
} from 'lucide-react'

export default function GlobalUserAttributesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Attributes</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Configure global user attributes that are available across all applications. These serve as the baseline schema for your users.</p>
        </div>
      </div>

      <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/20">
        <InfoIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Global Defaults</p>
          <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">Attributes defined here will be visible to all applications. Individual apps can choose to disable specific defaults or add their own custom attributes.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6">
        <UserAttributesConfig appId="system" mode="default" />
      </div>
    </div>
  )
}
