'use client'

import React, { useRef } from 'react'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { BrandingConfig } from './types'
import { SegmentedControl } from '../ui/SegmentedControl'
import { PaintBrushIcon, PhotoIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { ColorPickerPopover, toColorValue, colorValueToCss } from '../ui/ColorPickerPopover'

interface BrandingSettingsProps {
    branding: BrandingConfig | null
    setBranding: React.Dispatch<React.SetStateAction<BrandingConfig | null>>
    handleBrandingUpload: (field: keyof BrandingConfig, file: File) => Promise<void>
    uploading: boolean
}

export function BrandingSettings({ branding, setBranding, handleBrandingUpload, uploading }: BrandingSettingsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)

    const brandingUsage = `// 1. App Identity
{ appName } = useTheme();
<AppLogo className="w-10 h-10" />

// 2. Splash / Loading Screen
import { SplashScreen } from '../components/ui/SplashScreen';

if (isLoading) {
  return <SplashScreen />;
}`

    const safeBranding = branding || {
        appName: '',
        logoUrl: '',
        splash: {
            backgroundColor: '#ffffff',
            spinnerColor: '#000000',
            resizeMode: 'cover',
            spinnerType: 'pulse',
            logoAnimation: 'none',
            showLogo: true,
            showAppName: true
        }
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
                        <CardTitle className="text-lg">Identity & Brand</CardTitle>
                        <CardDescription>Core visual elements and splash settings.</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdvancedOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Advanced</span>
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="p-5 space-y-5">
                <div className="space-y-6">
                    <div className="space-y-8">
                        {/* App Identity */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-gray-900">App Identity</p>
                            <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-start">
                                <label className="text-sm font-medium text-gray-700 pt-2">App Name</label>
                                <div>
                                    <Input
                                        value={safeBranding.appName}
                                        onChange={(e) => setBranding(prev => prev ? ({ ...prev, appName: e.target.value }) : null)}
                                        placeholder="e.g. Acme Corp"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Displayed on splash screen and in system dialogs.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 items-start">
                                <label className="text-sm font-medium text-gray-700 pt-2">App Logo</label>
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-400 flex items-center justify-center bg-gray-50 cursor-pointer transition-all overflow-hidden relative group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {safeBranding.logoUrl ? (
                                            <img src={safeBranding.logoUrl} className="w-full h-full object-contain p-2" alt="App logo" />
                                        ) : (
                                            <PhotoIcon className="w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform" />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowPathIcon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" title="Upload logo file" onChange={(e) => e.target.files?.[0] && handleBrandingUpload('logoUrl', e.target.files[0])} />
                                        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full sm:w-auto">
                                            {uploading ? 'Uploading...' : 'Upload Logo'}
                                        </Button>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            Upload a high-res PNG (min 512x512).<br/>
                                            This will be used for your app icon and splash screen.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Splash Screen Config */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-gray-900">Splash Screen Quick Settings</p>
                            
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
                        title="Advanced Brand Settings"
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


