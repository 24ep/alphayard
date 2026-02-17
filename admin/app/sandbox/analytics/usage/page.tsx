'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { 
  Users, 
  BarChart3,
  Settings,
  Beaker,
  Home,
  Activity,
  Terminal,
  GitBranch,
  BookOpen,
  Settings2,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'

export default function SandboxUsageAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Usage Analytics</h1>
                <p className="text-sm text-gray-600">User behavior analysis and metrics</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/sandbox'}>
                <Beaker className="h-4 w-4 mr-2" />
                Sandbox
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                <Settings2 className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Usage Metrics
              </span>
              <div className="flex gap-2">
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  aria-label="Time range"
                  title="Select time range"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  {refreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-900">1,234</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-gray-900">5,678</div>
                <div className="text-sm text-gray-600">Page Views</div>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-gray-900">3:45</div>
                <div className="text-sm text-gray-600">Avg. Session</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-gray-900">78%</div>
                <div className="text-sm text-gray-600">Conversion</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/sandbox'}>
                <Beaker className="h-4 w-4 mr-2" />
                Test in Sandbox
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/sandbox/analytics'}>
                <BarChart3 className="h-4 w-4 mr-2" />
                All Analytics
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/sandbox/api-playground'}>
                <Terminal className="h-4 w-4 mr-2" />
                API Playground
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                <Settings2 className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 Boundary. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/sandbox'}>
                <Beaker className="h-4 w-4 mr-2" />
                Sandbox
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                <Settings2 className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
