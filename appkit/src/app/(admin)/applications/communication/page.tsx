'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  MailIcon,
  MessageSquareIcon,
  BellIcon,
  SmartphoneIcon,
  CogIcon,
  CheckCircleIcon,
  SendIcon
} from 'lucide-react'

interface NotificationChannel {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

const defaultChannels: NotificationChannel[] = [
  { id: 'email', name: 'Email Notifications', description: 'Send system notifications via email', icon: <MailIcon className="w-5 h-5" />, enabled: true },
  { id: 'sms', name: 'SMS Notifications', description: 'Send urgent alerts via SMS text messages', icon: <SmartphoneIcon className="w-5 h-5" />, enabled: false },
  { id: 'push', name: 'Push Notifications', description: 'Real-time mobile and web push notifications', icon: <BellIcon className="w-5 h-5" />, enabled: true },
  { id: 'in-app', name: 'In-App Notifications', description: 'Internal notifications within the user dashboard', icon: <MessageSquareIcon className="w-5 h-5" />, enabled: true },
]

export default function CommunicationDefaultPage() {
  const [channels, setChannels] = useState<NotificationChannel[]>(defaultChannels)
  const [smtp, setSmtp] = useState({
    host: 'smtp.example.com',
    port: '587',
    fromEmail: 'noreply@example.com',
    fromName: 'AppKit Default'
  })

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication Settings</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Configure default notification channels and SMTP relay for all applications.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
        <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Default Configuration</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">These settings serve as the platform default. Each application can choose to inherit these or use their own individual setup.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Channels */}
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Default Notification Channels</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    channel.enabled 
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' 
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
                  }`}>
                    {channel.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{channel.name}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{channel.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={channel.enabled} onChange={() => toggleChannel(channel.id)} />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <CogIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Default SMTP Configuration</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">SMTP Host</label>
                <input 
                  type="text" 
                  value={smtp.host} 
                  onChange={(e) => setSmtp({...smtp, host: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">SMTP Port</label>
                <input 
                  type="text" 
                  value={smtp.port} 
                  onChange={(e) => setSmtp({...smtp, port: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">From Email Address</label>
              <input 
                type="email" 
                value={smtp.fromEmail} 
                onChange={(e) => setSmtp({...smtp, fromEmail: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">From Name</label>
              <input 
                type="text" 
                value={smtp.fromName} 
                onChange={(e) => setSmtp({...smtp, fromName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
          </div>
          <div className="pt-2 flex space-x-3">
            <Button variant="outline" className="w-full">
              <SendIcon className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-8">
          Save Platform Defaults
        </Button>
      </div>
    </div>
  )
}
