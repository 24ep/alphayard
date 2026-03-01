'use client'

import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Input } from '../ui/Input'
import { AppUpdateConfig } from './types'
import { RocketLaunchIcon, ArrowDownCircleIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface AppUpdateSettingsProps {
    updates: AppUpdateConfig
    setBranding: React.Dispatch<React.SetStateAction<any>>
}

export function AppUpdateSettings({ updates, setBranding }: AppUpdateSettingsProps) {
    
    const updateSettings = (field: keyof AppUpdateConfig, value: any) => {
        setBranding((prev: any) => ({
            ...prev,
            updates: { ...prev.updates, [field]: value }
        }))
    }

    return (
        <Card className="border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-none">
            <CardHeader className="border-b border-gray-100/50 pb-3">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <CardTitle className="text-lg">App Version Control</CardTitle>
                        <CardDescription>Manage mandatory updates and version compliance.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-2 items-start">
                    <label className="text-sm font-medium text-gray-700 pt-2 flex items-center gap-2">
                        <ArrowDownCircleIcon className="w-4 h-4" />
                        Minimum Allowed Version
                    </label>
                    <div>
                        <Input 
                            value={updates.minVersion}
                            onChange={(e) => updateSettings('minVersion', e.target.value)}
                            placeholder="e.g. 1.2.5"
                            className="text-sm font-mono"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Users on versions lower than this will be prompted to update.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-2 items-start">
                    <label className="text-sm font-medium text-gray-700 pt-2 flex items-center gap-2">
                        <GlobeAltIcon className="w-4 h-4" />
                        App Store / Play Store URL
                    </label>
                    <Input 
                        value={updates.storeUrl}
                        onChange={(e) => updateSettings('storeUrl', e.target.value)}
                        placeholder="https://apps.apple.com/..."
                        className="text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-2 items-start border border-amber-100 rounded-xl p-3">
                    <label className="text-sm font-medium text-amber-900 pt-1 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4" />
                        Force Update (Strict Mode)
                    </label>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-amber-800/70">If enabled, users cannot bypass the update screen. Use only for critical security fixes.</p>
                        <button 
                            onClick={() => updateSettings('forceUpdate', !updates.forceUpdate)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${updates.forceUpdate ? 'bg-amber-500' : 'bg-gray-200'}`}
                            title={updates.forceUpdate ? 'Disable forced updates' : 'Enable forced updates'}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${updates.forceUpdate ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}


