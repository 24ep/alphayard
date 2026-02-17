'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  TestTube, 
  Play, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Upload,
  Code,
  Send,
  Globe,
  Smartphone,
  Monitor,
  BarChart3,
  Terminal,
  BookOpen,
  Beaker,
  Home,
  Activity,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Database,
  Cloud,
  FileText,
  GitBranch,
  Server,
  Shield,
  Users,
  Settings2,
  Smartphone as Phone,
  Tablet as TabletIcon,
  Monitor as MonitorIcon,
  Cpu,
  ShieldCheck,
  Shield as ShieldIcon,
  Wrench,
  Settings as SettingsIcon
} from 'lucide-react'

export default function SandboxToolsPage() {
  const [activeTest, setActiveTest] = useState('device-testing')
  const [testRunning, setTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const tools = [
    {
      id: 'device-testing',
      label: 'Device Testing',
      description: 'Test your authentication across different devices and screen sizes',
      icon: Phone,
      href: '/sandbox/device-testing'
    },
    {
      id: 'performance',
      label: 'Performance Testing',
      description: 'Analyze login performance, load times, and optimization',
      icon: Cpu,
      href: '/sandbox/performance'
    },
    {
      id: 'accessibility',
      label: 'Accessibility Testing',
      description: 'Ensure your login forms meet accessibility standards',
      icon: ShieldCheck,
      href: '/sandbox/accessibility'
    },
    {
      id: 'security',
      label: 'Security Testing',
      description: 'Test security features and vulnerability scanning',
      icon: ShieldIcon,
      href: '/sandbox/security'
    }
  ]

  const runTest = (testId: string) => {
    setTestRunning(true)
    setTimeout(() => {
      setTestResults([
        ...testResults,
        {
          test: testId,
          status: 'success',
          timestamp: new Date(),
          results: {
            device: 'Desktop',
            browser: 'Chrome',
            passed: true,
            score: 95
          }
        }
      ])
      setTestRunning(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <TestTube className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Testing Tools</h1>
                <p className="text-sm text-gray-600">Comprehensive testing suite for authentication flows</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Testing Tools Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Available Testing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => window.location.href = tool.href}
                  className="p-4 border rounded-lg text-left hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <tool.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{tool.label}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Test Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  onClick={() => runTest(tool.id)}
                  disabled={testRunning}
                  className="flex items-center gap-2"
                >
                  {testRunning ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Run {tool.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Test Results
                </span>
                <Button variant="outline" size="sm" onClick={() => setTestResults([])}>
                  Clear Results
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tools.find(t => t.id === result.test)?.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Score: {result.results.score}/100
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
              <Button variant="outline" onClick={() => window.location.href = '/sandbox/analytics'}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/sandbox/api-playground'}>
                <Terminal className="h-4 w-4 mr-2" />
                API Playground
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
