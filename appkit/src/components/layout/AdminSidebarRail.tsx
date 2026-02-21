'use client'

import React from 'react'
import { Settings } from 'lucide-react'
import { Tooltip } from '../ui/Tooltip'
import { type NavHub } from './AdminNavigation'

interface AdminSidebarRailProps {
    hubs: NavHub[]
    activeHubId: string
    onHubClick: (href: string) => void
    onNavigate: (path: string) => void
    IconComponent: React.ComponentType<{ name: string; className?: string }>
}

export function AdminSidebarRail({ 
    hubs, 
    activeHubId, 
    onHubClick, 
    onNavigate,
    IconComponent: Icon 
}: AdminSidebarRailProps) {
    return (
        <aside className="hidden lg:flex flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-40 flex-shrink-0 w-16 rounded-r-xl">
            {/* System Navigation Hubs */}
            <nav className="flex-1 space-y-1 py-4 flex flex-col items-center">
                {hubs.map((hub) => {
                    const isHubActive = activeHubId === hub.id
                    return (
                        <Tooltip key={hub.id} content={hub.label} position="right">
                            <button
                                onClick={() => onHubClick(hub.href)}
                                className={`group transition-all duration-200 w-10 h-10 flex items-center justify-center rounded-xl ${
                                    isHubActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                <Icon name={hub.icon} className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${isHubActive ? 'text-white' : ''}`} />
                            </button>
                        </Tooltip>
                    )
                })}
            </nav>

            <div className="py-4 flex flex-col items-center space-y-2 border-t border-gray-100 dark:border-zinc-800">
                <Tooltip content="Sandbox" position="right">
                    <button 
                        onClick={() => onNavigate('/sandbox')}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 rounded-xl"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </button>
                </Tooltip>
                
                <Tooltip content="Settings" position="right">
                    <button 
                        onClick={() => onHubClick('/settings')}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 rounded-xl"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
        </aside>
    )
}
