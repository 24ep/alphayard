'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  Zap, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  BarChart3,
  Settings,
  Beaker,
  Home,
  Activity,
  Terminal,
  GitBranch,
  BookOpen,
  Settings2,
  Cpu,
  Clock,
  Download,
  Upload,
  Copy,
  FileText,
  Users,
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Gauge,
  Timer
} from 'lucide-react'

export default function SandboxPerformancePage() {
  const [testRunning, setTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real performance data
  React.useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/sandbox/performance')
        if (!response.ok) {
          throw new Error('Failed to fetch performance data')
        }
        
        const data = await response.json()
        if (data.success) {
          setPerformanceData(data.data)
        } else {
          throw new Error(data.error || 'Failed to load performance data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Performance fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerformanceData()
  }, [])

  const runPerformanceTest = async () => {
    setTestRunning(true)
    try {
      const response = await fetch('/api/sandbox/performance?action=analyze', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTestResults([...testResults, data.data])
        }
      }
    } catch (err) {
      console.error('Performance test error:', err)
    } finally {
      setTestRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance Testing</h1>
                <p className="text-sm text-gray-600">Analyze login performance and optimization</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/sandbox'}>
                <Beaker className="h-4 w-4 mr-2" />
                Sandbox
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = 'http://localhost:3001/identity/users'}>
                <Settings2 className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => window.location.href = '/sandbox'}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Main Sandbox
            </button>
            <button
              onClick={() => window.location.href = '/sandbox/analytics'}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => window.location.href = '/sandbox/api-playground'}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              <Terminal className="h-4 w-4 mr-2" />
              API Playground
            </button>
            <button
              onClick={() => window.location.href = '/sandbox/ab-testing'}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              A/B Testing
            </button>
            <button
              onClick={() => window.location.href = '/sandbox/config-sync'}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Config Sync
            </button>
            <button
              onClick={() => window.location.href = '/sandbox/integration-guide'}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Integration Guide
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Test
              </span>
              <Button onClick={runPerformanceTest} disabled={testRunning}>
                {testRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Test
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <Timer className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-900">1.2s</div>
                <div className="text-sm text-gray-600">Load Time</div>
              </div>
              <div className="text-center">
                <Cpu className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-gray-900">0.8s</div>
                <div className="text-sm text-gray-600">Render Time</div>
              </div>
              <div className="text-center">
                <Download className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-gray-900">250ms</div>
                <div className="text-sm text-gray-600">API Response</div>
              </div>
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-gray-900">45MB</div>
                <div className="text-sm text-gray-600">Memory Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Performance Test #{index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Load Time:</span>
                        <span className="ml-2 font-medium">{result.metrics.loadTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Render Time:</span>
                        <span className="ml-2 font-medium">{result.metrics.renderTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">API Response:</span>
                        <span className="ml-2 font-medium">{result.metrics.apiResponse}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Score:</span>
                        <span className="ml-2 font-medium">{result.metrics.score}/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
              <Button variant="outline" onClick={() => window.location.href = '/sandbox/tools'}>
                <Target className="h-4 w-4 mr-2" />
                All Tools
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/sandbox/analytics'}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" onClick={() => window.location.href = 'http://localhost:3001/identity/users'}>
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
              <Button variant="outline" size="sm" onClick={() => window.location.href = 'http://localhost:3001/identity/users'}>
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
