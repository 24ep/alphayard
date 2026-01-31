import React from 'react'
import { ComponentConfig } from './types'
import { colorValueToCss } from '../ui/ColorPickerPopover'
import { clsx } from 'clsx'
import * as HeroIcons from '@heroicons/react/24/outline'

interface MiniDevicePreviewProps {
    component: ComponentConfig
    onClick?: () => void
}

import { renderPreview } from './ComponentPreviews'

interface MiniDevicePreviewProps {
    component: ComponentConfig
    onClick?: () => void
}

export function MiniDevicePreview({ component, onClick }: MiniDevicePreviewProps) {
    const styles = component.styles

    return (
        <div 
            onClick={onClick}
            className="group relative w-full aspect-[4/3] bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:bg-white flex items-center justify-center p-4"
        >
            {/* The Component Preview */}
            <div className="relative z-10 w-full flex justify-center items-center transform scale-[0.65] origin-center -translate-y-2 group-hover:scale-[0.68] transition-transform duration-300">
                <div className="w-full flex justify-center pointer-events-none">
                    {renderPreview(component, styles)}
                </div>
            </div>

            {/* Component Status/Name Overlay */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start pointer-events-none border-b border-transparent group-hover:border-gray-50 bg-transparent group-hover:bg-white/80 backdrop-blur-sm transition-all duration-300 z-10">
                <div className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">
                   {component.type || 'generic'}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>

            {/* Hover Footer */}
            <div className="absolute inset-0 bg-transparent transition-colors z-20 flex items-end justify-center pb-3">
                <span className="text-[10px] bg-white border border-gray-200 shadow-sm text-gray-900 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-200 font-medium">
                    Configure Styling
                </span>
            </div>
        </div>
    )
}
