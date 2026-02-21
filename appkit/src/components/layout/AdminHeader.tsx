'use client'

import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
    Sun, 
    Moon, 
    Monitor, 
    LogOut, 
    Menu as MenuIcon, 
    Search,
    Bell,
    ChevronDown,
    User,
    Settings
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface AdminHeaderProps {
    user: any
    moduleTitle: string
    onLogout: () => void
    onOpenMobileMenu: () => void
    onOpenAccountSettings: () => void
}

export function AdminHeader({ 
    user, 
    moduleTitle, 
    onLogout, 
    onOpenMobileMenu, 
    onOpenAccountSettings 
}: AdminHeaderProps) {
    const { theme, setTheme } = useTheme()

    return (
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50 flex items-center justify-between px-4 lg:px-8 relative z-50 shrink-0 shadow-sm shadow-gray-200/20 dark:shadow-zinc-900/20">
            <div className="flex items-center space-x-6">
                {/* Brand Logo */}
                <div className="flex items-center group">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-600/25 mr-4 group-hover:shadow-blue-600/40 transition-all duration-300">
                        A
                    </div>
                    <div className="hidden md:block overflow-hidden whitespace-nowrap">
                        <h1 className="font-bold text-gray-900 dark:text-white tracking-tight text-xl leading-none mb-0.5">AppKit</h1>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest leading-none">Platform</p>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="lg:hidden p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200 hover:scale-105"
                    onClick={onOpenMobileMenu}
                    aria-label="Open mobile menu"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>
                
                {/* Vertical Divider */}
                <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-zinc-800 mx-6" />

                {/* Page Title */}
                <div className="hidden sm:block">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{moduleTitle}</h2>
                </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6">
                {/* Search field */}
                <div className="hidden md:flex items-center relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                        <Search className="w-4 h-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-gray-100/50 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm w-48 lg:w-64 transition-all duration-200 placeholder-gray-400"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl group" aria-label="Notifications" title="Notifications">
                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
                </button>

                {/* User Profile Popover */}
                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/25 group-hover:shadow-blue-600/40 transition-all duration-300">
                            {user?.firstName?.[0] || 'A'}
                        </div>
                        <div className="hidden sm:block text-left pr-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none capitalize">{user?.firstName}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5 tracking-wider">{user?.role || 'Admin'}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-4 w-72 origin-top-right divide-y divide-gray-100/50 dark:divide-zinc-800/50 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5 focus:outline-none z-50 border border-gray-200/50 dark:border-zinc-800/50">
                            <div className="px-5 py-4">
                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Signed in as</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-1">{user?.email}</p>
                            </div>

                            <div className="p-3 space-y-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button className={`${active ? 'bg-gray-50/80 dark:bg-zinc-800/80' : ''} flex w-full items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 rounded-xl transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-zinc-800/80`}>
                                            <User className="w-4 h-4 mr-3 text-gray-400" />
                                            Your Profile
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button 
                                            onClick={onOpenAccountSettings}
                                            className={`${active ? 'bg-gray-50/80 dark:bg-zinc-800/80' : ''} flex w-full items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 rounded-xl transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-zinc-800/80`}>
                                            <Settings className="w-4 h-4 mr-3 text-gray-400" />
                                            Account Settings
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>

                            <div className="p-4">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-3 mb-3">Appearance</p>
                                <div className="grid grid-cols-3 gap-1.5 bg-gray-50/50 dark:bg-zinc-950/50 p-1.5 rounded-xl border border-gray-200/50 dark:border-zinc-800/50">
                                    {[
                                        { id: 'light', icon: Sun, label: 'Light' },
                                        { id: 'dark', icon: Moon, label: 'Dark' },
                                        { id: 'system', icon: Monitor, label: 'System' },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`
                                                flex flex-col items-center justify-center py-2.5 rounded-lg transition-all duration-200
                                                ${theme === t.id 
                                                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/20' 
                                                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                                                }
                                            `}
                                        >
                                            <t.icon className="w-4 h-4 mb-1" />
                                            <span className="text-[9px] font-bold">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button 
                                            onClick={onLogout}
                                            className={`${active ? 'bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-zinc-300'} flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-red-50/80 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400`}>
                                            <LogOut className="w-4 h-4 mr-3 text-red-500" />
                                            Sign Out
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    )
}
