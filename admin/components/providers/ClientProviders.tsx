'use client'

import React from 'react'
import { AppProvider } from '../../contexts/AppContext'
import { Toaster } from '../ui/Toaster'
import { ThemeProvider } from './ThemeProvider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AppProvider>
                {children}
                <Toaster />
            </AppProvider>
        </ThemeProvider>
    )
}

