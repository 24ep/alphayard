'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '../../services/authService'

interface AdminLayoutProps {
    children: React.ReactNode
}

// Navigation menu configuration
const navigationItems = [
    {
        group: 'Overview',
        items: [
            { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'chart-bar' }
        ]
    },
    {
        group: 'User Management',
        items: [
            { id: 'users', label: 'Users', href: '/users', icon: 'users' },
            { id: 'admin-users', label: 'Admin Users', href: '/admin/users', icon: 'shield' },
            { id: 'families', label: 'Families', href: '/families', icon: 'home' }
        ]
    },
    {
        group: 'Content & Media',
        items: [
            { id: 'content', label: 'Content', href: '/content', icon: 'document' },
            { id: 'media', label: 'Media Library', href: '/media', icon: 'photo' },
            { id: 'pages', label: 'Page Builder', href: '/pages', icon: 'layout' }
        ]
    },
    {
        group: 'Settings',
        items: [
            { id: 'settings', label: 'Settings', href: '/settings', icon: 'cog' }
        ]
    }
]

// Simple icon component
const Icon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
    const icons: Record<string, JSX.Element> = {
        'chart-bar': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        'users': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        'shield': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
        'home': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        'document': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        'photo': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        'layout': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
        'cog': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        'logout': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
        'menu': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
        'x': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    }
    return icons[name] || <span className={className}>•</span>
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check auth on mount
    useEffect(() => {
        const storedUser = authService.getUser()
        if (!authService.isAuthenticated()) {
            router.push('/login')
        } else {
            setUser(storedUser)
        }
        setIsLoading(false)
    }, [router])

    const handleLogout = async () => {
        await authService.logout()
        router.push('/login')
    }

    const isActive = (href: string) => pathname === href

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar - Desktop */}
            <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 text-white transition-all duration-300 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}>
                {/* Logo */}
                <div className="flex items-center h-16 px-4 border-b border-gray-800">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
                        B
                    </div>
                    {sidebarOpen && (
                        <div className="ml-3">
                            <h1 className="font-semibold">Bondarys</h1>
                            <p className="text-xs text-gray-400">Admin Panel</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {navigationItems.map((group) => (
                        <div key={group.group} className="mb-6">
                            {sidebarOpen && (
                                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    {group.group}
                                </h3>
                            )}
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => router.push(item.href)}
                                    className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${isActive(item.href)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User section */}
                <div className="border-t border-gray-800 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            {user?.firstName?.[0] || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-gray-400">{user?.role || 'Admin'}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`mt-3 w-full flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}
                    >
                        <Icon name="logout" className="w-5 h-5" />
                        {sidebarOpen && <span className="ml-2">Logout</span>}
                    </button>
                </div>

                {/* Toggle button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
                >
                    <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </aside>

            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b">
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">B</div>
                        <span className="ml-2 font-semibold">Bondarys Admin</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                        <Icon name={mobileMenuOpen ? 'x' : 'menu'} className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white" onClick={e => e.stopPropagation()}>
                        <div className="pt-20 pb-4 overflow-y-auto h-full">
                            {navigationItems.map((group) => (
                                <div key={group.group} className="mb-4">
                                    <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">{group.group}</h3>
                                    {group.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { router.push(item.href); setMobileMenuOpen(false) }}
                                            className={`w-full flex items-center px-4 py-2.5 text-sm ${isActive(item.href) ? 'bg-blue-600' : 'hover:bg-gray-800'
                                                }`}
                                        >
                                            <Icon name={item.icon} className="w-5 h-5" />
                                            <span className="ml-3">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                            <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800">
                                <Icon name="logout" className="w-5 h-5" />
                                <span className="ml-3">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-16 lg:pt-0`}>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
