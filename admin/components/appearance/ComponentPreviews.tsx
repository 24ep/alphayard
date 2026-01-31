import React from 'react'

import { ComponentConfig, ComponentStyle } from './types'
import { colorValueToCss } from '../ui/ColorPickerPopover'
import { clsx } from 'clsx'
import * as HeroIcons from '@heroicons/react/24/outline'
import { SelectionTabs } from '../ui/SelectionTabs'

// Helper to get shadow style
export const getShadowStyle = (styles: any) => {
    const level = styles?.shadowLevel || 'none'
    
    if (level !== 'custom') {
        switch (level) {
            case 'sm': return '0 1px 2px rgba(0,0,0,0.05)'
            case 'md': return '0 4px 6px rgba(0,0,0,0.1)'
            case 'lg': return '0 10px 15px rgba(0,0,0,0.1)'
            default: return 'none'
        }
    }

    const color = styles?.shadowColor || { mode: 'solid', solid: '#000000' }
    const blur = styles?.shadowBlur ?? 10
    const spread = styles?.shadowSpread ?? 0
    const offsetX = styles?.shadowOffsetX ?? 0
    const offsetY = styles?.shadowOffsetY ?? 4
    
    return `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${colorValueToCss(color)}`
}

// Helper to render icons
export const RenderIcon = ({ style }: { style: any }) => {
    if (!style?.icon) return null
    
    const IconComp = (HeroIcons as any)[style.icon]
    if (!IconComp) return null

    const iconColor = style.iconColor?.solid || 'currentColor'
    const hasBackground = style.showIconBackground
    const bgColor = style.iconBackgroundColor?.solid || '#ffffff'
    const bgOpacity = (style.iconBackgroundOpacity ?? 20) / 100

    return (
        <div 
            className="flex items-center justify-center rounded-md relative overflow-hidden shrink-0"
            style={{
                width: hasBackground ? '24px' : '16px',
                height: hasBackground ? '24px' : '16px',
            }}
        >
             {hasBackground && (
                 <div 
                    className="absolute inset-0" 
                    style={{ backgroundColor: bgColor, opacity: bgOpacity }} 
                 />
             )}
             
             <IconComp 
                className="relative z-10" 
                style={{ 
                    width: '14px', 
                    height: '14px', 
                    color: iconColor 
                }} 
             />
        </div>
    )
}

// Interactive button preview
export const AnimatedButtonPreview = ({ component, styles, baseStyle }: { 
    component: ComponentConfig, 
    styles: any, 
    baseStyle: React.CSSProperties 
}) => {
    const clickAnimation = styles?.clickAnimation || 'scale'
    const [animationKey, setAnimationKey] = React.useState(0)
    
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setAnimationKey(prev => prev + 1)
    }
    
    const getAnimationName = () => {
        switch (clickAnimation) {
            case 'scale': return 'btnScaleAnim'
            case 'pulse': return 'btnPulseAnim'
            case 'opacity': return 'btnOpacityAnim'
            default: return 'none'
        }
    }
    
    const animationStyle: React.CSSProperties = clickAnimation !== 'none' ? {
        animation: `${getAnimationName()} 0.3s ease-out`,
    } : {}
    
    return (
        <>
            <style>{`
                @keyframes btnScaleAnim {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.88); }
                    100% { transform: scale(1); }
                }
                @keyframes btnPulseAnim {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.12); }
                    100% { transform: scale(1); }
                }
                @keyframes btnOpacityAnim {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
            `}</style>
            <button 
                key={animationKey}
                type="button"
                className="px-6 py-3 font-semibold text-sm cursor-pointer select-none flex items-center justify-center gap-2"
                style={{ 
                    ...baseStyle, 
                    ...animationStyle,
                    pointerEvents: 'auto' 
                }}
                onClick={handleClick}
            >
                {styles?.iconPosition !== 'right' && <RenderIcon style={styles} />}
                <span className="truncate">{component.name}</span>
                {styles?.iconPosition === 'right' && <RenderIcon style={styles} />}
            </button>
        </>
    )
}

// Interactive Input Preview
export const InteractiveInputPreview = ({ styles, baseStyle }: { styles: any, baseStyle: React.CSSProperties }) => {
    const [value, setValue] = React.useState('')
    const [isFocused, setIsFocused] = React.useState(false)
    const [inputState, setInputState] = React.useState<'default' | 'valid' | 'invalid'>('default')
    
    const getStateStyles = () => {
        switch (inputState) {
            case 'valid':
                return { 
                    borderColor: colorValueToCss(styles?.validBorderColor || { mode: 'solid', solid: '#10B981' }),
                    backgroundColor: colorValueToCss(styles?.validBackgroundColor || (styles?.backgroundColor || { mode: 'solid', solid: '#f9fafb' })),
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' 
                }
            case 'invalid':
                return { 
                    borderColor: colorValueToCss(styles?.invalidBorderColor || { mode: 'solid', solid: '#EF4444' }),
                    backgroundColor: colorValueToCss(styles?.invalidBackgroundColor || (styles?.backgroundColor || { mode: 'solid', solid: '#f9fafb' })),
                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)' 
                }
            default:
                if (isFocused) {
                    return { 
                        borderColor: colorValueToCss(styles?.focusBorderColor || styles?.borderColor || { mode: 'solid', solid: '#3B82F6' }),
                        backgroundColor: colorValueToCss(styles?.focusBackgroundColor || (styles?.backgroundColor || { mode: 'solid', solid: '#f9fafb' })),
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' 
                    }
                }
                return {}
        }
    }
    
    return (
        <div className="w-full max-w-xs space-y-3">
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Email Address</label>
                <div className="relative flex items-center">
                    {styles?.icon && styles.iconPosition !== 'right' && (
                        <div className="absolute left-3">
                            <RenderIcon style={styles} />
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="name@example.com"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={clsx(
                            "w-full py-3 text-sm outline-none transition-all",
                            styles?.icon && styles.iconPosition !== 'right' ? "pl-11 pr-4" : "px-4",
                            styles?.icon && styles.iconPosition === 'right' ? "pr-11 pl-4" : "px-4"
                        )}
                        style={{
                            ...baseStyle,
                            backgroundColor: styles?.backgroundColor?.solid || '#f9fafb',
                            ...getStateStyles()
                        }}
                    />
                    {styles?.icon && styles.iconPosition === 'right' && (
                        <div className="absolute right-3">
                            <RenderIcon style={styles} />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-1">
                {(['default', 'valid', 'invalid'] as const).map((state) => (
                    <button
                        key={state}
                        onClick={() => setInputState(state)}
                        className={clsx(
                            "px-2 py-1 text-[10px] font-medium rounded transition-all capitalize",
                            inputState === state 
                                ? "bg-gray-900 text-white" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {state}
                    </button>
                ))}
            </div>
        </div>
    )
}

// Interactive Tabbar Preview
export const InteractiveTabbarPreview = ({ styles }: { styles: any }) => {
    const [activeTab, setActiveTab] = React.useState(0)
    const tabs = ['Home', 'Profile', 'Settings']
    
    return (
        <div 
            className="flex gap-1 p-1 rounded-xl"
            style={{ backgroundColor: styles?.backgroundColor?.solid || '#f1f5f9' }}
        >
            {tabs.map((tab, i) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={clsx(
                        "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                        activeTab === i ? "bg-white" : "hover:bg-white/50"
                    )}
                    style={{ color: activeTab === i ? styles?.textColor?.solid || '#000' : '#64748b' }}
                >
                    {tab}
                </button>
            ))}
        </div>
    )
}

// Interactive Accordion Preview
export const InteractiveAccordionPreview = ({ styles, baseStyle, componentName }: { styles: any, baseStyle: React.CSSProperties, componentName: string }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    
    return (
        <div className="w-full max-w-sm" style={baseStyle}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors"
                style={{ color: styles?.textColor?.solid || '#000' }}
            >
                <div className="flex items-center gap-2">
                    <RenderIcon style={styles} />
                    <span className="text-sm font-medium">Click to expand</span>
                </div>
                <svg 
                    className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="px-4 pb-3 text-xs text-gray-600 animate-in slide-in-from-top-2 duration-200">
                    This is the accordion content that shows when expanded.
                </div>
            )}
        </div>
    )
}

// Type-specific preview renderer
export const renderPreview = (component: ComponentConfig, styles: any) => {
    const bgValue = styles?.backgroundColor
    const bgCss = bgValue ? colorValueToCss(bgValue) : 'transparent'
    
    const baseStyle = {
        background: bgCss,
        color: styles?.textColor?.solid || '#000',
        borderRadius: styles?.borderRadius || 0,
        border: `${styles?.borderWidth || 1}px solid ${styles?.borderColor?.solid || 'transparent'}`,
        padding: styles?.padding !== undefined ? `${styles.padding}px` : '12px 24px',
        boxShadow: getShadowStyle(styles),
        opacity: (styles?.opacity !== undefined ? styles.opacity : 100) / 100,
        transition: 'all 0.3s ease'
    }

    // Force type inference if missing
    let componentType = component.type
    if (!componentType) {
        const id = component.id?.toLowerCase() || ''
        const name = component.name?.toLowerCase() || ''
        
        if (id.includes('button') || name.includes('button')) componentType = 'button'
        else if (id.includes('input') || name.includes('input') || id.includes('form') || id.includes('field')) componentType = 'input'
        else if (id.includes('card') || name.includes('card') || id.includes('toast') || id.includes('modal') || id.includes('sheet')) componentType = 'card'
        else if (id.includes('tab') || id.includes('nav')) componentType = 'tabbar'
        else if (id.includes('accordion') || id.includes('menu')) componentType = 'accordion'
        else if (id.includes('badge') || id.includes('status') || id.includes('indicator') || id.includes('dot')) componentType = 'badge'
        else componentType = 'generic'
    }

    switch (componentType) {
        case 'button':
            return <AnimatedButtonPreview 
                key={`btn-${styles?.clickAnimation || 'default'}`}
                component={component} 
                styles={styles} 
                baseStyle={baseStyle} 
            />

        case 'input':
            return <InteractiveInputPreview styles={styles} baseStyle={baseStyle} />

        case 'card':
            return (
                <div 
                    className="w-full max-w-xs"
                    style={{
                        ...baseStyle,
                        padding: 0,
                        overflow: 'hidden'
                    }}
                >
                    <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <RenderIcon style={styles} />
                            <h4 className="font-semibold text-sm" style={{ color: styles?.textColor?.solid || '#1f2937' }}>
                                Card Title
                            </h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            Sample card description with preview content.
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-300" />
                            <span className="text-xs text-gray-600">John Doe</span>
                        </div>
                    </div>
                </div>
            )

        case 'badge':
            return (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-2.5 h-2.5 rounded-full animate-pulse"
                            style={{ backgroundColor: styles?.backgroundColor?.solid || '#10B981' }}
                        />
                        <span className="text-sm font-medium" style={{ color: styles?.textColor?.solid || '#059669' }}>
                            Online
                        </span>
                    </div>
                    <span 
                        className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5"
                        style={{ 
                            backgroundColor: styles?.backgroundColor?.solid || '#10B981',
                            color: styles?.textColor?.solid || '#FFFFFF'
                        }}
                    >
                        <RenderIcon style={styles} />
                        New
                    </span>
                </div>
            )

        case 'tabbar':
            // Robust check for Icon Selection Tabs
            if (component.id === 'selection-tabs' || component.mobileConfig?.componentName === 'CircleSelectionTabs') {
                return (
                   <div style={{ padding: 8, borderRadius: 12, boxShadow: 'none' }}>
                        <SelectionTabs 
                            activeTab="personal"
                            onChange={() => {}}
                            tabs={[
                                { id: 'personal', label: 'Personal', icon: <HeroIcons.UserIcon className="w-6 h-6" /> },
                                { id: 'finance', label: 'Finance', icon: <HeroIcons.BanknotesIcon className="w-6 h-6" /> },
                                { id: 'health', label: 'Health', icon: <HeroIcons.HeartIcon className="w-6 h-6" /> },
                            ]}
                            activeColor={component.config?.activeColor}
                            inactiveColor={component.config?.inactiveColor}
                            activeTextColor={component.config?.activeTextColor}
                            inactiveTextColor={component.config?.inactiveTextColor}
                            activeIconColor={component.config?.activeIconColor}
                            inactiveIconColor={component.config?.inactiveIconColor}
                            menuBackgroundColor={component.config?.menuBackgroundColor}
                            borderRadius={styles?.borderRadius}
                            fit={component.config?.fit ?? true}
                            menuShowShadow={component.config?.menuShowShadow}
                            activeShowShadow={component.config?.activeShowShadow}
                            inactiveShowShadow={component.config?.inactiveShowShadow}
                        />
                   </div>
                )
            }
            return <InteractiveTabbarPreview styles={styles} />

        case 'accordion':
            return <InteractiveAccordionPreview styles={styles} baseStyle={baseStyle} componentName={component.name} />

        default:
            if (component.id?.includes('toast') || component.name?.toLowerCase().includes('toast')) {
                return (
                    <div 
                        className="w-full max-w-xs flex items-start gap-3 p-4 shadow-xl"
                        style={baseStyle}
                    >
                        <div className="flex-shrink-0">
                            <RenderIcon style={styles} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: styles?.textColor?.solid || '#FFFFFF' }}>Success!</p>
                            <p className="text-xs opacity-80" style={{ color: styles?.textColor?.solid || '#FFFFFF' }}>Your changes have been saved.</p>
                        </div>
                    </div>
                )
            }
            return (
                <div 
                    className="px-6 py-4 text-sm font-medium rounded-lg flex items-center gap-2"
                    style={baseStyle}
                >
                    <RenderIcon style={styles} />
                    {component.name}
                </div>
            )
    }
}
