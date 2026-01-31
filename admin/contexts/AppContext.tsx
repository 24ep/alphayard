'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { adminService, Application } from '../services/adminService'

interface AppContextType {
    currentApp: Application | null
    setCurrentApp: (app: Application | null) => void
    applications: Application[]
    isLoading: boolean
    refreshApplications: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [currentApp, setCurrentApp] = useState<Application | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()

    const refreshApplications = async () => {
        try {
            const response = await adminService.getApplications()
            setApplications(response.applications)
            
            // Try to restore current app from localStorage or pick the first one
            const savedAppId = localStorage.getItem('selected_app_id')
            if (savedAppId) {
                const savedApp = response.applications.find((a: Application) => a.id === savedAppId)
                if (savedApp) {
                    setCurrentApp(savedApp)
                } else if (response.applications.length > 0) {
                    setCurrentApp(response.applications[0])
                }
            } else if (response.applications.length > 0) {
                setCurrentApp(response.applications[0])
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // Initial fetch if token exists
        const token = localStorage.getItem('admin_token')
        if (token && (applications.length === 0 || pathname !== '/login')) {
            refreshApplications()
        }

        // Listen for storage changes (for other tabs or same-tab updates)
        const handleStorage = () => {
            const newToken = localStorage.getItem('admin_token')
            if (newToken && applications.length === 0) {
                refreshApplications()
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [pathname, applications.length])

    useEffect(() => {
        if (currentApp) {
            localStorage.setItem('selected_app_id', currentApp.id)
        } else {
            localStorage.removeItem('selected_app_id')
        }
    }, [currentApp])

    return (
        <AppContext.Provider value={{ currentApp, setCurrentApp, applications, isLoading, refreshApplications }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
