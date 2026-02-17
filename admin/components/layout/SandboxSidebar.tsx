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
  Eye,
  Activity,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Lock,
  Key,
  Server,
  Chat,
  Shield
} from 'lucide-react'
import { Button } from '../ui/Button'

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<any>
  badge?: string
  children?: SidebarItem[]
}

interface SandboxSidebarProps {
  activeModule?: string
  setActiveModule?: (module: string) => void
}

export function SandboxSidebar({ activeModule = 'sandbox', setActiveModule }: SandboxSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['sandbox'])
  const [isLive, setIsLive] = useState(true) // Mock live status

  const sandboxItems: SidebarItem[] = [
    {
      id: 'sandbox',
      label: 'Sandbox Testing',
      href: '/sandbox',
      icon: Beaker,
      children: [
        {
          id: 'main',
          label: 'Main Sandbox',
          href: '/sandbox',
          icon: Home
        },
        {
          id: 'analytics',
          label: 'Analytics',
          href: '/sandbox/analytics',
          icon: BarChart3
        },
        {
          id: 'api-playground',
          label: 'API Playground',
          href: '/sandbox/api-playground',
          icon: Terminal
        },
        {
          id: 'ab-testing',
          label: 'A/B Testing',
          href: '/sandbox/ab-testing',
          icon: GitBranch
        },
        {
          id: 'config-sync',
          label: 'Config Sync',
          href: '/sandbox/config-sync',
          icon: Settings,
          badge: isLive ? 'Live' : undefined
        },
        {
          id: 'integration-guide',
          label: 'Integration Guide',
          href: '/sandbox/integration-guide',
          icon: BookOpen
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
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isItemActive
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  toggleExpanded(item.id)
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </div>
        </Link>
        
        {hasChildren && isExpanded && (
          <div className="bg-gray-50 border-l-2 border-gray-200 ml-6">
            {item.children.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Beaker className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Login Sandbox</h2>
            <p className="text-sm text-gray-600">Testing Environment</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {sandboxItems.map((item) => renderSidebarItem(item))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.open('/sandbox/integration-guide', '_blank')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Integration Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.open('/identity/login-config', '_blank')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Login Config
          </Button>
        </div>
      </div>
    </div>
  )
}
