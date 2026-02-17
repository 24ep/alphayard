'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  ShieldCheck, 
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
  Eye,
  EyeOff,
  Users,
  Target,
  AlertTriangle,
  CheckSquare,
  XSquare,
  Keyboard,
  Volume2,
  MousePointer
} from 'lucide-react'

export default function SandboxAccessibilityPage() {
  const [testRunning, setTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [accessibilityData, setAccessibilityData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real accessibility data
  React.useEffect(() => {
    const fetchAccessibilityData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/sandbox/accessibility?action=recent')
        if (!response.ok) {
          throw new Error('Failed to fetch accessibility data')
        }
        
        const data = await response.json()
        if (data.success) {
          setAccessibilityData(data.data)
        } else {
          throw new Error(data.error || 'Failed to load accessibility data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Accessibility fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccessibilityData()
  }, [])

  const runAccessibilityTest = async () => {
    setTestRunning(true)
    try {
      const response = await fetch('/api/sandbox/accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'http://localhost:3001/login',
          wcagLevel: 'AA'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTestResults([...testResults, data.data])
        }
      }
    } catch (err) {
      console.error('Accessibility test error:', err)
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
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Accessibility Testing</h1>
                <p className="text-sm text-gray-600">Ensure your login forms meet accessibility standards</p>
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
        {/* Accessibility Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility Test
              </span>
              <Button onClick={runAccessibilityTest} disabled={testRunning}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center">
                <Keyboard className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-lg font-bold text-gray-900">Keyboard</div>
                <div className="text-sm text-gray-600">Navigation</div>
              </div>
              <div className="text-center">
                <Volume2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-lg font-bold text-gray-900">Screen Reader</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-lg font-bold text-gray-900">Color</div>
                <div className="text-sm text-gray-600">Contrast</div>
              </div>
              <div className="text-center">
                <MousePointer className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-lg font-bold text-gray-900">Focus</div>
                <div className="text-sm text-gray-600">Indicators</div>
              </div>
              <div className="text-center">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-lg font-bold text-gray-900">ARIA</div>
                <div className="text-sm text-gray-600">Labels</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-lg font-bold text-gray-900">WCAG</div>
                <div className="text-sm text-gray-600">Compliance</div>
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
