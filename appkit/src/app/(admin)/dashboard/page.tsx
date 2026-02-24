'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  ServerIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ActivityIcon,
  CogIcon,
  GlobeIcon,
  CreditCardIcon,
  ArrowUpIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from 'lucide-react'

interface SystemStats {
  totalApplications: number
  activeApplications: number
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  uptime: number
  apiCalls: number
  storageUsed: number
  bandwidthUsed: number
}

interface RecentActivity {
  id: string
  type: 'application_created' | 'user_registered' | 'payment_received' | 'system_alert'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

interface TopApplication {
  id: string
  name: string
  users: number
  revenue: number
  growth: number
  status: 'active' | 'inactive'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topApplications, setTopApplications] = useState<TopApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockStats: SystemStats = {
      totalApplications: 24,
      activeApplications: 18,
      totalUsers: 15420,
      activeUsers: 8750,
      totalRevenue: 48500,
      monthlyRevenue: 12500,
      systemHealth: 'excellent',
      uptime: 99.9,
      apiCalls: 2500000,
      storageUsed: 750,
      bandwidthUsed: 2500
    }

    const mockRecentActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'application_created',
        title: 'New Application Created',
        description: 'Mobile App Backend was created by John Doe',
        timestamp: '2024-02-22T10:30:00Z',
        status: 'success'
      },
      {
        id: '2',
        type: 'user_registered',
        title: 'New User Registration',
        description: '125 new users registered in the last 24 hours',
        timestamp: '2024-02-22T09:15:00Z',
        status: 'info'
      },
      {
        id: '3',
        type: 'payment_received',
        title: 'Payment Received',
        description: '$2,500 payment received from Acme Corporation',
        timestamp: '2024-02-22T08:45:00Z',
        status: 'success'
      },
      {
        id: '4',
        type: 'system_alert',
        title: 'High API Usage',
        description: 'API usage approaching limit for E-Commerce Platform',
        timestamp: '2024-02-22T07:30:00Z',
        status: 'warning'
      }
    ]

    const mockTopApplications: TopApplication[] = [
      {
        id: '1',
        name: 'E-Commerce Platform',
        users: 5250,
        revenue: 18500,
        growth: 15.2,
        status: 'active'
      },
      {
        id: '2',
        name: 'Customer Portal',
        users: 3200,
        revenue: 12500,
        growth: 8.7,
        status: 'active'
      },
      {
        id: '3',
        name: 'Analytics Dashboard',
        users: 2100,
        revenue: 6500,
        growth: -2.3,
        status: 'active'
      },
      {
        id: '4',
        name: 'Mobile App Backend',
        users: 850,
        revenue: 3200,
        growth: 45.8,
        status: 'active'
      }
    ]

    setTimeout(() => {
      setStats(mockStats)
      setRecentActivity(mockRecentActivity)
      setTopApplications(mockTopApplications)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application_created': return <ServerIcon className="w-4 h-4" />
      case 'user_registered': return <UsersIcon className="w-4 h-4" />
      case 'payment_received': return <CreditCardIcon className="w-4 h-4" />
      case 'system_alert': return <ShieldCheckIcon className="w-4 h-4" />
      default: return <ActivityIcon className="w-4 h-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'info': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your AppKit system performance and metrics</p>
      </div>

      {/* System Health */}
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-medium text-green-900">System Health: Excellent</h3>
            <p className="text-sm text-green-700">All systems operational • {stats?.uptime || 0}% uptime</p>
          </div>
        </div>
        <Badge className={getHealthColor(stats?.systemHealth || 'excellent')}>
          {stats?.systemHealth?.toUpperCase()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalApplications}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  {stats?.activeApplications} active
                </p>
              </div>
              <ServerIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  {stats?.activeUsers.toLocaleString()} active
                </p>
              </div>
              <UsersIcon className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUpIcon className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <CreditCardIcon className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls</p>
                <p className="text-2xl font-bold text-gray-900">{stats && (stats.apiCalls / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <ActivityIcon className="w-3 h-3 mr-1" />
                  This month
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Applications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Applications</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topApplications.map((app, index) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.name}</p>
                        <p className="text-sm text-gray-600">{app.users.toLocaleString()} users</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${app.revenue.toLocaleString()}</p>
                        <p className={`text-sm flex items-center ${
                          app.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {app.growth > 0 ? <TrendingUpIcon className="w-3 h-3 mr-1" /> : <TrendingDownIcon className="w-3 h-3 mr-1" />}
                          {Math.abs(app.growth)}%
                        </p>
                      </div>
                      <Badge className={app.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="text-gray-900">{stats?.storageUsed} GB / 1000 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats ? ((stats.storageUsed / 1000) * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">75% of storage used</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bandwidth Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="text-gray-900">{stats && (stats.bandwidthUsed / 1000).toFixed(1)} TB / 10 TB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats ? ((stats.bandwidthUsed / 10000) * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">25% of bandwidth used</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <ServerIcon className="w-4 h-4 mr-2" />
              Create Application
            </Button>
            <Button className="w-full" variant="outline">
              <UsersIcon className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
            <Button className="w-full" variant="outline">
              <CogIcon className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
