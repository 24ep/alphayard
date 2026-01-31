import React, { useRef, useState, useEffect } from 'react'
import { clsx } from 'clsx'

interface Tab {
    id: string
    label: string
    icon?: React.ReactNode
}

interface TabsProps {
    tabs: Tab[]
    activeTab: string
    onChange: (tabId: string) => void
    className?: string
    variant?: 'default' | 'pills' | 'segmented'
}

export function Tabs({ tabs, activeTab, onChange, className = '', variant = 'pills' }: TabsProps) {
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

    useEffect(() => {
        const activeIndex = tabs.findIndex(t => t.id === activeTab)
        const activeElement = tabsRef.current[activeIndex]

        if (activeElement) {
            setIndicatorStyle({
                left: activeElement.offsetLeft,
                width: activeElement.offsetWidth,
                opacity: 1
            })
        }
    }, [activeTab, tabs])

    return (
        <div className={clsx(
            'relative',
            variant === 'default' && 'border-b border-gray-200',
            className
        )}>
            {/* Pill/Segmented Background */}
            {(variant === 'pills' || variant === 'segmented') && (
                <div className={clsx(
                    "flex p-1 rounded-xl relative w-full", // Added w-full
                    variant === 'segmented' ? "bg-gray-100/50 border border-gray-200/50" : "bg-transparent gap-2"
                )}>
                    {/* Floating Indicator */}
                    <div
                        className={clsx(
                            "absolute top-1 bottom-1 bg-white shadow-sm rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                            variant === 'pills' && "!bg-white !shadow-sm ring-1 ring-black/5 top-0 bottom-0 rounded-xl", // Changed to white bg with subtle ring
                            indicatorStyle.opacity === 0 && "opacity-0"
                        )}
                        style={{
                            left: variant === 'pills' ? indicatorStyle.left : indicatorStyle.left,
                            width: indicatorStyle.width
                        }}
                    />

                    {tabs.map((tab, index) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                ref={el => { tabsRef.current[index] = el }}
                                onClick={() => onChange(tab.id)}
                                type="button"
                                className={clsx(
                                    "relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-gray-900",
                                    // Variant: Segmented
                                    variant === 'segmented' && (
                                        isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                                    ),
                                    // Variant: Pills
                                    variant === 'pills' && (
                                        // Active: Black text. Inactive: Gray text.
                                        isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                                    )
                                )}
                            >
                                {tab.icon && (
                                    <span className={clsx(
                                        "w-4 h-4 transition-transform duration-300",
                                        isActive && "scale-110"
                                    )}>
                                        {tab.icon}
                                    </span>
                                )}
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Default Underline Style */}
            {variant === 'default' && (
                <nav className="flex space-x-8 -mb-px" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onChange(tab.id)}
                                className={clsx(
                                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200",
                                    isActive
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            )}
        </div>
    )
}
