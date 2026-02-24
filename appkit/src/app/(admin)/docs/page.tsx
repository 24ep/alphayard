'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui'
import { Badge } from '../../../components/ui'
import { Button } from '../../../components/ui'
import { 
  BookOpenIcon, 
  DocumentTextIcon, 
  CodeBracketIcon, 
  RocketLaunchIcon,
  ShieldCheckIcon,
  CogIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface DocSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
  category: string
  status: 'complete' | 'in-progress' | 'planned'
  lastUpdated: string
}

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const docSections: DocSection[] = [
    // Identity Gateway Documentation
    {
      id: 'identity-gateway-guide',
      title: 'Identity Gateway Guide',
      description: 'Comprehensive guide for implementing centralized authentication and user management',
      icon: ShieldCheckIcon,
      href: '/docs/IDENTITY_GATEWAY_GUIDE.md',
      category: 'identity',
      status: 'complete',
      lastUpdated: '2024-02-24'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Complete API documentation for all identity endpoints with examples',
      icon: CodeBracketIcon,
      href: '/docs/API_REFERENCE.md',
      category: 'identity',
      status: 'complete',
      lastUpdated: '2024-02-24'
    },
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      description: 'Get started with AppKit identity system in 5 minutes',
      icon: RocketLaunchIcon,
      href: '/docs/QUICK_START.md',
      category: 'identity',
      status: 'complete',
      lastUpdated: '2024-02-24'
    },
    {
      id: 'missing-features',
      title: 'Missing Features Analysis',
      description: 'Analysis of missing features and implementation roadmap',
      icon: DocumentTextIcon,
      href: '/docs/MISSING_FEATURES_ANALYSIS.md',
      category: 'planning',
      status: 'complete',
      lastUpdated: '2024-02-24'
    },
    // Additional planned documentation
    {
      id: 'user-guide',
      title: 'User Guide',
      description: 'Complete user manual for end-users of AppKit applications',
      icon: UserGroupIcon,
      href: '/docs/USER_GUIDE.md',
      category: 'user',
      status: 'planned',
      lastUpdated: '2024-02-24'
    },
    {
      id: 'admin-guide',
      title: 'Administrator Guide',
      description: 'Guide for system administrators managing AppKit deployments',
      icon: CogIcon,
      href: '/docs/ADMIN_GUIDE.md',
      category: 'admin',
      status: 'planned',
      lastUpdated: '2024-02-24'
    },
    {
      id: 'deployment-guide',
      title: 'Deployment Guide',
      description: 'Step-by-step deployment instructions for various environments',
      icon: GlobeAltIcon,
      href: '/docs/DEPLOYMENT_GUIDE.md',
      category: 'deployment',
      status: 'planned',
      lastUpdated: '2024-02-24'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Documentation', count: docSections.length },
    { id: 'identity', label: 'Identity Gateway', count: docSections.filter(doc => doc.category === 'identity').length },
    { id: 'user', label: 'User Guides', count: docSections.filter(doc => doc.category === 'user').length },
    { id: 'admin', label: 'Administration', count: docSections.filter(doc => doc.category === 'admin').length },
    { id: 'deployment', label: 'Deployment', count: docSections.filter(doc => doc.category === 'deployment').length },
    { id: 'planning', label: 'Planning', count: docSections.filter(doc => doc.category === 'planning').length }
  ]

  const filteredDocs = docSections.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status: DocSection['status']) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-700">Complete</Badge>
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
      case 'planned':
        return <Badge className="bg-gray-100 text-gray-700">Planned</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: DocSection['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <CogIcon className="w-5 h-5 text-yellow-500" />
      case 'planned':
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <BookOpenIcon className="w-6 h-6 text-blue-600" />
            AppKit Documentation
          </h1>
          <p className="text-gray-500 text-xs mt-1">Complete documentation for AppKit identity gateway and management system.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{docSections.length}</p>
              </div>
              <BookOpenIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Complete</p>
                <p className="text-2xl font-bold text-green-600">
                  {docSections.filter(doc => doc.status === 'complete').length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {docSections.filter(doc => doc.status === 'in-progress').length}
                </p>
              </div>
              <CogIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-2xl font-bold text-gray-600">
                  {docSections.filter(doc => doc.status === 'planned').length}
                </p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation List */}
      <div className="space-y-4">
        {filteredDocs.map((doc) => {
          const Icon = doc.icon
          return (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                        {getStatusBadge(doc.status)}
                        {getStatusIcon(doc.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{doc.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="capitalize">{doc.category}</span>
                        <span>•</span>
                        <span>Last updated: {doc.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.status === 'complete' ? (
                      <Button
                        onClick={() => window.open(doc.href, '_blank')}
                        className="flex items-center gap-2"
                      >
                        View
                        <ArrowRightIcon className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled
                        className="flex items-center gap-2"
                      >
                        Coming Soon
                        <ArrowRightIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredDocs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documentation found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No documentation available for this category'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Most frequently accessed documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.open('/docs/IDENTITY_GATEWAY_GUIDE.md', '_blank')}
              variant="outline"
              className="flex items-center justify-center gap-2 h-auto p-4"
            >
              <ShieldCheckIcon className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Identity Gateway</div>
                <div className="text-sm text-gray-600">Complete guide</div>
              </div>
            </Button>
            <Button
              onClick={() => window.open('/docs/API_REFERENCE.md', '_blank')}
              variant="outline"
              className="flex items-center justify-center gap-2 h-auto p-4"
            >
              <CodeBracketIcon className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">API Reference</div>
                <div className="text-sm text-gray-600">All endpoints</div>
              </div>
            </Button>
            <Button
              onClick={() => window.open('/docs/QUICK_START.md', '_blank')}
              variant="outline"
              className="flex items-center justify-center gap-2 h-auto p-4"
            >
              <RocketLaunchIcon className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Quick Start</div>
                <div className="text-sm text-gray-600">5 minutes</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
