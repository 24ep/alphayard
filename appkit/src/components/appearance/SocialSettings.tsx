'use client'

import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Input } from '../ui/Input'
import { SocialLinksConfig } from './types'
import { ShareIcon, EnvelopeIcon, GlobeAltIcon, ChatBubbleLeftIcon, DevicePhoneMobileIcon, AtSymbolIcon, LinkIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface SocialSettingsProps {
    social: SocialLinksConfig
    setBranding: React.Dispatch<React.SetStateAction<any>>
}

export function SocialSettings({ social, setBranding }: SocialSettingsProps) {
    
    const updateSocial = (field: keyof SocialLinksConfig, value: string) => {
        setBranding((prev: any) => ({
            ...prev,
            social: { ...prev.social, [field]: value }
        }))
    }

    const SocialItem = ({ label, field, placeholder, icon: Icon, colorClass = "text-gray-400" }: { label: string, field: keyof SocialLinksConfig, placeholder: string, icon: any, colorClass?: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-center">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                </div>
                <Input 
                    value={social?.[field] || ''} 
                    onChange={(e) => updateSocial(field, e.target.value)}
                    placeholder={placeholder}
                    className="text-sm pl-10"
                />
            </div>
        </div>
    )

    return (
        <Card className="border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-none">
            <CardHeader className="border-b border-gray-100/50 pb-3">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <CardTitle className="text-lg">Links & Support</CardTitle>
                        <CardDescription>External connection points for your users.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="p-5 space-y-6">
                {/* Support Section */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Support Channels</p>
                    <div className="space-y-3">
                        <SocialItem label="Support Email" field="supportEmail" placeholder="support@example.com" icon={EnvelopeIcon} colorClass="text-red-500" />
                        <SocialItem label="Help Desk URL" field="helpDeskUrl" placeholder="https://help.example.com" icon={GlobeAltIcon} colorClass="text-blue-500" />
                        <SocialItem label="WhatsApp Number" field="whatsapp" placeholder="+1234567890" icon={ChatBubbleLeftIcon} colorClass="text-green-500" />
                        <SocialItem label="Line ID / URL" field="line" placeholder="https://line.me/..." icon={ChatBubbleLeftIcon} colorClass="text-green-600" />
                    </div>
                </div>

                {/* Social Profiles */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Social Profiles</p>
                    <div className="space-y-3">
                        <SocialItem label="Facebook URL" field="facebook" placeholder="https://facebook.com/..." icon={GlobeAltIcon} colorClass="text-blue-600" />
                        <SocialItem label="Instagram Handle" field="instagram" placeholder="@username" icon={AtSymbolIcon} colorClass="text-pink-600" />
                        <SocialItem label="Twitter (X) Handle" field="twitter" placeholder="@username" icon={AtSymbolIcon} colorClass="text-zinc-800" />
                        <SocialItem label="LinkedIn URL" field="linkedin" placeholder="https://linkedin.com/..." icon={LinkIcon} colorClass="text-blue-700" />
                        <SocialItem label="Discord Invite" field="discord" placeholder="https://discord.gg/..." icon={UserGroupIcon} colorClass="text-indigo-500" />
                    </div>
                </div>

                {/* Store IDs */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">App Store Integration</p>
                    <div className="space-y-3">
                        <SocialItem label="Apple App Store ID" field="appStoreId" placeholder="123456789" icon={GlobeAltIcon} />
                        <SocialItem label="Google Play Package" field="playStoreId" placeholder="com.example.app" icon={GlobeAltIcon} />
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}


