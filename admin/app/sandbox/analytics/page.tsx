'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Download,
  Upload,
  Beaker,
  Home,
  Terminal,
  GitBranch,
  BookOpen,
  Settings
} from 'lucide-react'

export default function SandboxAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'usage' | 'performance' | 'errors'>('usage')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/sandbox/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        
        const data = await response.json()
        if (data.success) {
          setAnalyticsData(data.data)
        } else {
          throw new Error(data.error || 'Failed to load analytics')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Analytics fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }: { 
    title: string; 
    value: string | number; 
    icon: React.ComponentType<any>; 
    trend?: { value: number; isPositive: boolean; type?: 'up' | 'down' }; 
    color?: string 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {trend.value}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sandbox Analytics</h1>
                <p className="text-sm text-gray-600">Monitor usage, performance, and user behavior</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/sandbox'}>
                <Beaker className="h-4 w-4 mr-2" />
                Sandbox
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = 'http://localhost:3001/identity/users'}>
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </Button>
          ))}
        </div>

        {/* Metric Tabs */}
        <div className="mb-6 border-b">
          <div className="flex gap-4">
            {(['usage', 'performance', 'errors'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`pb-2 px-1 border-b-2 transition-colors ${
                  selectedMetric === metric
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Usage Metrics */}
        {selectedMetric === 'usage' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Tests"
                value={analyticsData.usage.totalTests.toLocaleString()}
                icon={Activity}
                trend={{ isPositive: true, value: 12, type: 'up' }}
                color="blue"
              />
              <MetricCard
                title="Unique Users"
                value={analyticsData.usage.uniqueUsers}
                icon={Users}
                trend={{ isPositive: true, value: 8, type: 'up' }}
                color="green"
              />
              <MetricCard
                title="Avg Session"
                value={analyticsData.usage.avgSessionDuration}
                icon={Clock}
                trend={{ isPositive: false, value: 5, type: 'down' }}
                color="purple"
              />
              <MetricCard
                title="Completion Rate"
                value={`${analyticsData.usage.completionRate}%`}
                icon={CheckCircle}
                trend={{ isPositive: true, value: 15, type: 'up' }}
                color="emerald"
              />
            </div>

            {/* Device Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Device Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.usage.deviceBreakdown).map(([device, percentage]) => (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {device === 'desktop' && <Monitor className="h-4 w-4" />}
                          {device === 'mobile' && <Smartphone className="h-4 w-4" />}
                          {device === 'tablet' && <Tablet className="h-4 w-4" />}
                          <span className="capitalize">{device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Platform Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.usage.platformBreakdown).map(([platform, percentage]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="capitalize">{platform.replace('-', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Daily Usage Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-1">
                      <div className="flex gap-1">
                        <div 
                          className="bg-blue-500 rounded-t" 
                          style={{ height: `${Math.random() * 40 + 10}px` }}
                        />
                        <div 
                          className="bg-purple-500 rounded-b" 
                          style={{ height: `${Math.random() * 40 + 10}px` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">Day {i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span className="text-xs text-gray-600">Tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span className="text-xs text-gray-600">Users</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Metrics */}
        {selectedMetric === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Avg Load Time"
                value={`${analyticsData.performance.avgLoadTime}s`}
                icon={Clock}
                trend={{ isPositive: false, value: 0.3, type: 'down' }}
                color="green"
              />
              <MetricCard
                title="Interaction Time"
                value={`${analyticsData.performance.avgInteractionTime}s`}
                icon={MousePointer}
                trend={{ isPositive: false, value: 0.1, type: 'down' }}
                color="blue"
              />
              <MetricCard
                title="Success Rate"
                value={`${analyticsData.performance.successRate}%`}
                icon={CheckCircle}
                trend={{ isPositive: true, value: 12, type: 'up' }}
                color="emerald"
              />
              <MetricCard
                title="Error Rate"
                value={`${analyticsData.performance.errorRate}%`}
                icon={AlertTriangle}
                trend={{ isPositive: false, value: 3, type: 'down' }}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Performance Improving</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Load times have decreased by 15% over the last month
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">Fastest Configuration</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        "Basic Email Only" loads in 0.8s average
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Optimization Needed</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        "Full Social Login Setup" takes 2.1s to load
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuration Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { config: 'Basic Email Only', time: 0.8, status: 'excellent' },
                      { config: 'Email + Social', time: 1.2, status: 'good' },
                      { config: 'Full Social Login', time: 1.8, status: 'fair' },
                      { config: 'SSO + Social', time: 2.1, status: 'slow' }
                    ].map(({ config, time, status }) => (
                      <div key={config} className="flex items-center justify-between">
                        <span className="text-sm">{config}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{time}s</span>
                          <div className={`w-2 h-2 rounded-full ${
                            status === 'excellent' ? 'bg-green-500' :
                            status === 'good' ? 'bg-blue-500' :
                            status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Error Metrics */}
        {selectedMetric === 'errors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Errors"
                value={analyticsData.errors.totalErrors}
                icon={AlertTriangle}
                trend={{ type: 'down', value: '-15%' }}
                color="red"
              />
              <MetricCard
                title="Critical Errors"
                value={analyticsData.errors.criticalErrors}
                icon={AlertTriangle}
                trend={{ type: 'down', value: '-2' }}
                color="red"
              />
              <MetricCard
                title="Resolved Errors"
                value={analyticsData.errors.resolvedErrors}
                icon={CheckCircle}
                trend={{ type: 'up', value: '+12' }}
                color="green"
              />
              <MetricCard
                title="Most Common"
                value={analyticsData.errors.mostCommon}
                icon={AlertTriangle}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Error Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.errors.errorTypes).map(([error, percentage]) => (
                      <div key={error} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{error}</span>
                          <span className="text-xs text-gray-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Resolved Today</span>
                        <span className="text-lg font-bold text-green-600">8</span>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-800">Pending Review</span>
                        <span className="text-lg font-bold text-yellow-600">6</span>
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">Critical Issues</span>
                        <span className="text-lg font-bold text-red-600">3</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline">
            Export Report
          </Button>
          <Button variant="outline">
            Schedule Reports
          </Button>
          <Button>
            View Full Analytics
          </Button>
        </div>
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
              <Button variant="outline" size="sm" onClick={() => window.location.href = 'http://localhost:3001/identity/users'}>
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
