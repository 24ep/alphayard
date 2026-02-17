'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Beaker, 
  BarChart3, 
  Terminal, 
  GitBranch, 
  BookOpen,
  Settings,
  Home,
  Users,
  ChevronDown,
  ChevronRight,
  Menu,
  ChevronLeft,
  Activity,
  TestTube,
  Smartphone,
  Zap,
  ShieldCheck,
  Shield,
  Settings2
} from 'lucide-react'
import { Button } from '../ui/Button'

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: any
  description?: string
  badge?: string
  badgeColor?: 'green' | 'blue'
  children?: SidebarItem[]
}

interface SandboxSidebarVerticalProps {
  isOpen: boolean
  onToggle: () => void
}

export default function SandboxSidebarVertical({ isOpen, onToggle }: SandboxSidebarVerticalProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const sandboxItems: SidebarItem[] = [
    {
      id: 'main',
      label: 'Main Sandbox',
      href: '/sandbox',
      icon: Home,
      description: 'Primary testing interface'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/sandbox/analytics',
      icon: BarChart3,
      description: 'Usage metrics and insights'
    },
    {
      id: 'api-playground',
      label: 'API Playground',
      href: '/sandbox/api-playground',
      icon: Terminal,
      description: 'Interactive API testing'
    },
    {
      id: 'ab-testing',
      label: 'A/B Testing',
      href: '/sandbox/ab-testing',
      icon: GitBranch,
      description: 'Conversion optimization'
    },
    {
      id: 'config-sync',
      label: 'Config Sync',
      href: '/sandbox/config-sync',
      icon: Settings,
      badge: 'Live',
      badgeColor: 'green',
      description: 'Configuration management'
    },
    {
      id: 'integration-guide',
      label: 'Integration Guide',
      href: '/sandbox/integration-guide',
      icon: BookOpen,
      description: 'Developer documentation'
    },
    {
      id: 'tools',
      label: 'Testing Tools',
      href: '/sandbox/tools',
      icon: TestTube,
      children: [
        {
          id: 'device-testing',
          label: 'Device Testing',
          href: '/sandbox/device-testing',
          icon: Smartphone,
          description: 'Multi-device testing'
        },
        {
          id: 'performance',
          label: 'Performance',
          href: '/sandbox/performance',
          icon: Zap,
          description: 'Performance analysis'
        },
        {
          id: 'accessibility',
          label: 'Accessibility',
          href: '/sandbox/accessibility',
          icon: ShieldCheck,
          description: 'Accessibility testing'
        },
        {
          id: 'security',
          label: 'Security',
          href: '/sandbox/security',
          icon: Shield,
          description: 'Security testing'
        }
      ]
    }
  ]

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === '/sandbox') {
      return pathname === '/sandbox' || pathname.startsWith('/sandbox/') && !pathname.startsWith('/sandbox/analytics') && !pathname.startsWith('/sandbox/api-playground') && !pathname.startsWith('/sandbox/ab-testing') && !pathname.startsWith('/sandbox/config-sync') && !pathname.startsWith('/sandbox/integration-guide')
    }
    return pathname === href
  }

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const isItemActive = isActive(item.href)

    return (
      <div key={item.id} className="w-full">
        <Link
          href={item.href}
          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
            isItemActive
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
              item.badgeColor === 'green' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleExpanded(item.id)
              }}
              className="ml-1 p-1 rounded hover:bg-gray-200"
              aria-label={`Toggle ${item.label} submenu`}
              title={`Toggle ${item.label} submenu`}
            >
              <ChevronDown 
                className={`h-3 w-3 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </Link>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Beaker className="h-5 w-5 text-white" />
            </div>
            {isOpen && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sandbox</h2>
                <p className="text-xs text-gray-500">Testing Environment</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {sandboxItems.map((item) => renderSidebarItem(item))}
        </div>
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3 w-3" />
              <span>Live Sync Active</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => window.open('/admin', '_blank')}
            >
              Admin Panel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { SandboxSidebarVertical }
