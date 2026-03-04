import React from 'react'
import { BellIcon, MailIcon, SmartphoneIcon, MessageSquareIcon, SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface CommunicationSettingsProps {
  commConfig: { channels: Record<string, boolean> }
  onOpenCommDrawer: (channel: 'email' | 'sms' | 'push' | 'inApp') => void
  onToggleCommChannel: (channel: 'email' | 'sms' | 'push' | 'inApp', current: boolean) => void
}

export const CommunicationSettings: React.FC<CommunicationSettingsProps> = ({
  commConfig,
  onOpenCommDrawer,
  onToggleCommChannel,
}) => {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="p-8 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100 dark:border-blue-500/20">
          <BellIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Communication Hub</h3>
        <p className="text-gray-500 dark:text-zinc-400 mb-8">
          Manage all outgoing notifications, including Email, SMS, Push, and In-App messaging. 
          Configure providers like SendGrid, Twilio, and Firebase Messaging in one place.
        </p>
      </div>
      
      <div className="p-6 pt-0 space-y-3 max-w-2xl mx-auto">
        {[
          { name: 'Email', key: 'email', icon: <MailIcon className="w-5 h-5" />, active: commConfig.channels.email, color: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' },
          { name: 'SMS', key: 'sms', icon: <SmartphoneIcon className="w-5 h-5" />, active: commConfig.channels.sms, color: 'bg-green-50 text-green-600 dark:bg-green-500/10' },
          { name: 'Push', key: 'push', icon: <BellIcon className="w-5 h-5" />, active: commConfig.channels.push, color: 'bg-amber-50 text-amber-500 dark:bg-amber-500/10' },
          { name: 'In-App', key: 'inApp', icon: <MessageSquareIcon className="w-5 h-5" />, active: commConfig.channels.inApp, color: 'bg-violet-50 text-violet-500 dark:bg-violet-500/10' },
        ].map(item => (
          <div 
            key={item.key} 
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50/20 dark:hover:bg-blue-500/5 transition-all cursor-pointer group"
            onClick={() => onOpenCommDrawer(item.key as any)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                {item.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  <Badge variant={item.active ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                    {item.active ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 capitalize">Channel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Configure
              </Button>
              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  title={`Toggle ${item.name} channel`}
                  checked={item.active}
                  onChange={() => onToggleCommChannel(item.key as any, item.active)}
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 pt-4 flex flex-col items-center text-center max-w-2xl mx-auto">
        <Button 
          onClick={() => onOpenCommDrawer('email')}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-xl shadow-blue-500/25 px-8 hover:scale-[1.02] transition-transform"
        >
          <SettingsIcon className="w-4 h-4 mr-2" />
          Manage Communication Channels
        </Button>
      </div>
    </div>
  )
}
