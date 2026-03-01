'use client'

import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Input } from '../ui/Input'
import { AnnouncementConfig } from './types'
import { MegaphoneIcon, LinkIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface AnnouncementSettingsProps {
    announcements: AnnouncementConfig
    setBranding: React.Dispatch<React.SetStateAction<any>>
}

export function AnnouncementSettings({ announcements, setBranding }: AnnouncementSettingsProps) {
    
    const updateAnnouncement = (field: keyof AnnouncementConfig, value: any) => {
        setBranding((prev: any) => ({
            ...prev,
            announcements: { ...prev.announcements, [field]: value }
        }))
    }

    const typeIcons = {
        info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
        success: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
        warning: <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />,
        error: <ExclamationCircleIcon className="w-5 h-5 text-rose-500" />
    }

    return (
        <Card className="border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-none">
            <CardHeader className="border-b border-gray-100/50 pb-3">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <CardTitle className="text-lg">Announcement Banners</CardTitle>
                        <CardDescription>Broadcast messages and marketing banners to all users.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="p-5 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-center">
                            <label className="text-sm font-medium text-gray-700">Enable Banner</label>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-gray-500">Toggle whether the banner is visible in the mobile app.</p>
                                <button 
                                    onClick={() => updateAnnouncement('enabled', !announcements.enabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${announcements.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    title={announcements.enabled ? 'Disable banner' : 'Enable banner'}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${announcements.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-start">
                            <label className="text-sm font-medium text-gray-700 pt-2">Banner Message</label>
                            <textarea 
                                value={announcements.text}
                                onChange={(e) => updateAnnouncement('text', e.target.value)}
                                className="content-input min-h-[80px] text-sm resize-none"
                                placeholder="Enter your announcement text here..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-center">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                Action URL (Optional)
                            </label>
                            <Input 
                                value={announcements.linkUrl}
                                onChange={(e) => updateAnnouncement('linkUrl', e.target.value)}
                                placeholder="https://example.com/promo"
                                className="text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-start">
                            <label className="text-sm font-medium text-gray-700 pt-2">Banner Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => updateAnnouncement('type', type)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                                            announcements.type === type 
                                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                        title={`Set banner type to ${type}`}
                                    >
                                        {typeIcons[type]}
                                        <span className="capitalize">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-center">
                            <label className="text-sm font-medium text-gray-700">Allow Dismiss</label>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-gray-500">Let users close the banner until the next app launch.</p>
                                <button 
                                    onClick={() => updateAnnouncement('isDismissible', !announcements.isDismissible)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${announcements.isDismissible ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    title={announcements.isDismissible ? 'Make banner non-dismissible' : 'Allow banner to be dismissible'}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${announcements.isDismissible ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </CardBody>
        </Card>
    )
}


