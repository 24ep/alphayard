'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { 
  ServerIcon, 
  UsersIcon,
  GlobeIcon,
  ShieldCheckIcon,
  LockIcon,
  MessageSquareIcon,
  CogIcon,
  ArrowLeftIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react'

interface Application {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'development'
  users: number
  createdAt: string
  lastModified: string
  plan: 'free' | 'pro' | 'enterprise'
  domain?: string
}

interface ApplicationUser {
  id: string
  email: string
  name: string
  status: 'active' | 'inactive' | 'suspended'
  plan: string
  joinedAt: string
  lastActive: string
  avatar?: string
}

export default function ApplicationConfigPage() {
  const params = useParams()
  const appId = (params?.id as string) || ''
  const [application, setApplication] = useState<Application | null>(null)
  const [users, setUsers] = useState<ApplicationUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockApplication: Application = {
      id: appId,
      name: 'E-Commerce Platform',
      description: 'Online shopping application with payment integration',
      status: 'active',
      users: 1250,
      createdAt: '2024-01-15',
      lastModified: '2024-02-20',
      plan: 'enterprise',
      domain: 'shop.example.com'
    }

    const mockUsers: ApplicationUser[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        status: 'active',
        plan: 'Enterprise',
        joinedAt: '2024-01-15',
        lastActive: '2024-02-22',
        avatar: '/avatars/john.jpg'
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        status: 'active',
        plan: 'Pro',
        joinedAt: '2024-01-20',
        lastActive: '2024-02-21'
      },
      {
        id: '3',
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        status: 'inactive',
        plan: 'Free',
        joinedAt: '2024-02-01',
        lastActive: '2024-02-10'
      }
    ]

    setTimeout(() => {
      setApplication(mockApplication)
      setUsers(mockUsers)
      setIsLoading(false)
    }, 1000)
  }, [appId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <ServerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
        <p className="text-gray-600 mb-4">The application you're looking for doesn't exist.</p>
        <Button onClick={() => window.history.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'development': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'free': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{application.name}</h1>
            <p className="text-gray-600">{application.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
          <Badge className={getPlanColor(application.plan)}>
            {application.plan}
          </Badge>
        </div>
      </div>

      {/* Application Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Users</p>
                <p className="text-xl font-bold">{application.users.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GlobeIcon className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Domain</p>
                <p className="text-sm font-bold truncate">{application.domain || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CogIcon className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm font-bold">{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Modified</p>
                <p className="text-sm font-bold">{new Date(application.lastModified).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <ServerIcon className="w-4 h-4" />
            <span>App Content</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <UsersIcon className="w-4 h-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="identity" className="flex items-center space-x-2">
            <GlobeIcon className="w-4 h-4" />
            <span>Identity Scope</span>
          </TabsTrigger>
          <TabsTrigger value="auth" className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Auth Methods</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <LockIcon className="w-4 h-4" />
            <span>Security & MFA</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center space-x-2">
            <MessageSquareIcon className="w-4 h-4" />
            <span>Communication</span>
          </TabsTrigger>
          <TabsTrigger value="sandbox" className="flex items-center space-x-2">
            <CogIcon className="w-4 h-4" />
            <span>Login Sandbox</span>
          </TabsTrigger>
        </TabsList>

        {/* App Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Content Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ServerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">App Content Settings</h3>
                <p className="text-gray-600 mb-4">Configure your application's content, pages, and appearance.</p>
                <Button>
                  <CogIcon className="w-4 h-4 mr-2" />
                  Configure App Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Application Users</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <FilterIcon className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Badge className={getPlanColor(user.plan)}>
                        {user.plan}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Identity Scope Tab */}
        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Identity Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <GlobeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Identity Scope Configuration</h3>
                <p className="text-gray-600 mb-4">Configure global identity settings and user attributes.</p>
                <Button>
                  <CogIcon className="w-4 h-4 mr-2" />
                  Configure Identity Scope
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Methods Tab */}
        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Configuration</h3>
                <p className="text-gray-600 mb-4">Configure SSO providers, OAuth, and other authentication methods.</p>
                <Button>
                  <CogIcon className="w-4 h-4 mr-2" />
                  Configure Authentication
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & MFA Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & MFA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <LockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Security Settings</h3>
                <p className="text-gray-600 mb-4">Configure MFA, password policies, and security settings.</p>
                <Button>
                  <CogIcon className="w-4 h-4 mr-2" />
                  Configure Security
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquareIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Configuration</h3>
                <p className="text-gray-600 mb-4">Configure email templates, notifications, and communication settings.</p>
                <Button>
                  <CogIcon className="w-4 h-4 mr-2" />
                  Configure Communication
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login Sandbox Tab */}
        <TabsContent value="sandbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Login Sandbox</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Login Sandbox</h3>
                <p className="text-gray-600 mb-4">Test and preview login flows in a sandbox environment.</p>
                <Button>
                  <CogIcon className="w-4 h-4 mr-2" />
                  Open Sandbox
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
