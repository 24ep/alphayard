'use client'

import React, { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { BrandingConfig } from './types'
import { SegmentedControl } from '../ui/SegmentedControl'
import { ColorPickerPopover, toColorValue, colorValueToCss } from '../ui/ColorPickerPopover'
import { PhotoIcon, Cog6ToothIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface SplashScreenSettingsProps {
    branding: BrandingConfig | null
    setBranding: React.Dispatch<React.SetStateAction<BrandingConfig | null>>
}

export function SplashScreenSettings({ branding, setBranding }: SplashScreenSettingsProps) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

    const splashUsage = `// Splash Screen Usage
import { SplashScreen } from '../components/ui/SplashScreen';

if (isLoading) {
  return <SplashScreen />;
}`

    const safeBranding = {
        appName: '',
        logoUrl: '',
        splash: {
            backgroundColor: '#ffffff',
            spinnerColor: '#000000',
            spinnerType: 'circle' as const,
            showAppName: true,
            showLogo: true,
            logoAnimation: 'none',
            resizeMode: 'cover' as const,
            ...branding?.splash
        },
        ...branding
    }

    const updateSplash = (key: string, value: any) => {
        setBranding(prev => prev ? ({
            ...prev,
            splash: {
                ...safeBranding.splash,
                [key]: value
            } as any
        } as BrandingConfig) : null)
    }

    return (
        <Card className="border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-none">
            <CardHeader className="border-b border-gray-100/50 pb-3">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <CardTitle className="text-lg">Splash Screen</CardTitle>
                        <CardDescription>Customize the app launch experience.</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAdvancedOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Cog6ToothIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Advanced</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="p-5 space-y-5">
                <div className="space-y-6">
                    <div className="space-y-6">
                         {/* Splash Screen Config */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-gray-900">Splash Configuration</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-start">
                                <label className="text-sm font-medium text-gray-700 pt-2">Colors</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ColorPickerPopover
                                        label="Background"
                                        value={toColorValue(safeBranding.splash.backgroundColor)}
                                        onChange={(v) => updateSplash('backgroundColor', v)}
                                    />
                                    <ColorPickerPopover
                                        label="Spinner Color"
                                        value={toColorValue(safeBranding.splash.spinnerColor)}
                                        onChange={(v) => updateSplash('spinnerColor', v)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-start">
                                <label className="text-sm font-medium text-gray-700 pt-2">Resize Mode</label>
                                <div>
                                    <SegmentedControl
                                        options={[
                                            { label: 'Cover', value: 'cover' },
                                            { label: 'Contain', value: 'contain' },
                                            { label: 'Stretch', value: 'stretch' },
                                            { label: 'Center', value: 'center' },
                                        ]}
                                        value={safeBranding.splash.resizeMode || 'cover'}
                                        onChange={(value) => updateSplash('resizeMode', value)}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Controls how the background image fills the screen.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-start">
                                <label className="text-sm font-medium text-gray-700 pt-2">Loading Animation</label>
                                <SegmentedControl
                                        options={[
                                            { label: 'Circle', value: 'circle' },
                                            { label: 'Dots', value: 'dots' },
                                            { label: 'Pulse', value: 'pulse' },
                                            { label: 'None', value: 'none' },
                                        ]}
                                        value={safeBranding.splash.spinnerType}
                                        onChange={(value) => updateSplash('spinnerType', value)}
                                    />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-start">
                                <label className="text-sm font-medium text-gray-700 pt-2">Logo Animation</label>
                                <SegmentedControl
                                        options={[
                                            { label: 'None', value: 'none' },
                                            { label: 'Zoom', value: 'zoom' },
                                            { label: 'Rotate', value: 'rotate' },
                                            { label: 'Bounce', value: 'bounce' },
                                            { label: 'Pulse', value: 'pulse' },
                                        ]}
                                        value={safeBranding.splash.logoAnimation || 'none'}
                                        onChange={(value) => updateSplash('logoAnimation', value as any)}
                                    />
                            </div>
                        </div>
                    </div>

                    {/* Modal for Advanced Settings */}
                    <Modal
                        isOpen={isAdvancedOpen}
                        onClose={() => setIsAdvancedOpen(false)}
                        title="Advanced Splash Settings"
                    >
                        <div className="space-y-6 pb-6">
                            <div className="space-y-4">
                                <h5 className="text-sm font-bold text-gray-900 dark:text-white">Splash Visibility</h5>
                                <div className="flex flex-col gap-4">
                                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 cursor-pointer">
                                        <span className="text-sm text-gray-700 dark:text-slate-300">Show Logo on Splash</span>
                                        <input 
                                            type="checkbox" 
                                            checked={safeBranding.splash.showLogo} 
                                            onChange={(e) => updateSplash('showLogo', e.target.checked)}
                                            className="w-5 h-5 rounded text-pink-600 border-gray-300 focus:ring-pink-500" 
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 cursor-pointer">
                                        <span className="text-sm text-gray-700 dark:text-slate-300">Show App Name on Splash</span>
                                        <input 
                                            type="checkbox" 
                                            checked={safeBranding.splash.showAppName} 
                                            onChange={(e) => updateSplash('showAppName', e.target.checked)}
                                            className="w-5 h-5 rounded text-pink-600 border-gray-300 focus:ring-pink-500" 
                                        />
                                    </label>
                                </div>
                            </div>
                            
                            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                    <strong>Note:</strong> These settings are specifically optimized for mobile devices and will affect how the native splash screen is generated.
                                </p>
                            </div>

                            <Button onClick={() => setIsAdvancedOpen(false)} className="w-full">
                                Done
                            </Button>
                        </div>
                    </Modal>

                </div>
            </CardBody>
        </Card>
    )
}


