'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  CogIcon,
  UsersIcon,
  GroupIcon,
  BookOpenIcon,
  ScaleIcon,
  KeyIcon,
  LinkIcon,
  TerminalIcon,
  GlobeIcon,
  ShieldCheckIcon,
  BuildingIcon,
  ServerIcon,
  ActivityIcon
} from 'lucide-react'

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure your AppKit system preferences and integrations</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CogIcon className="w-5 h-5 text-gray-500" />
              <CardTitle>General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BuildingIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">System Information</h3>
                    <p className="text-sm text-gray-600">Configure basic system settings</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <GlobeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Regional Settings</h3>
                    <p className="text-sm text-gray-600">Time zones and localization</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-gray-500" />
              <CardTitle>Team Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <UsersIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Team Members</h3>
                    <p className="text-sm text-gray-600">Manage system users and roles</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <GroupIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Groups & Circles</h3>
                    <p className="text-sm text-gray-600">Organize users into groups</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="w-5 h-5 text-gray-500" />
              <CardTitle>Documentation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BookOpenIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">API Documentation</h3>
                    <p className="text-sm text-gray-600">Developer resources and guides</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <ScaleIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Legal Terms</h3>
                    <p className="text-sm text-gray-600">Terms of service and privacy</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secrets Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <KeyIcon className="w-5 h-5 text-gray-500" />
              <CardTitle>Secrets Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <KeyIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">API Keys</h3>
                    <p className="text-sm text-gray-600">Manage API access keys</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Environment Variables</h3>
                    <p className="text-sm text-gray-600">System configuration</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-5 h-5 text-gray-500" />
              <CardTitle>Webhooks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <LinkIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Webhook Endpoints</h3>
                    <p className="text-sm text-gray-600">Configure webhook URLs</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <ActivityIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Event Logs</h3>
                    <p className="text-sm text-gray-600">View webhook activity</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-5 h-5 text-gray-500" />
              <CardTitle>Connected Services</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <GlobeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Third-party Integrations</h3>
                    <p className="text-sm text-gray-600">Connect external services</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <ServerIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Service Status</h3>
                    <p className="text-sm text-gray-600">Monitor service health</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developers */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TerminalIcon className="w-5 h-5 text-gray-500" />
              <CardTitle>Developers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <TerminalIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">API Playground</h3>
                    <p className="text-sm text-gray-600">Test API endpoints</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Open
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <KeyIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">SDK Downloads</h3>
                    <p className="text-sm text-gray-600">Developer SDKs and tools</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ServerIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">24 Applications</h3>
              <p className="text-sm text-gray-600">Active systems</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">15,420 Users</h3>
              <p className="text-sm text-gray-600">Total users</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">99.9% Uptime</h3>
              <p className="text-sm text-gray-600">System reliability</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ActivityIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">2.5M API Calls</h3>
              <p className="text-sm text-gray-600">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
