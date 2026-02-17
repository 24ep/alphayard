'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Eye,
  EyeOff,
  BarChart3,
  Settings,
  Beaker,
  Home,
  Activity,
  Terminal,
  GitBranch,
  BookOpen,
  Settings2,
  Globe,
  Cpu,
  Shield,
  Zap,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  Copy,
  FileText,
  Users,
  Target
} from 'lucide-react'

export default function SandboxDeviceTestingPage() {
  const [selectedDevice, setSelectedDevice] = useState('desktop')
  const [testRunning, setTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real device data
  React.useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/sandbox/device-testing?action=devices')
        if (!response.ok) {
          throw new Error('Failed to fetch device data')
        }
        
        const data = await response.json()
        if (data.success) {
          setDevices(data.data)
        } else {
          throw new Error(data.error || 'Failed to load device data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Device testing fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeviceData()
  }, [])

  const runDeviceTest = async () => {
    setTestRunning(true)
    try {
      const response = await fetch('/api/sandbox/device-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: selectedDevice,
          url: 'http://localhost:3001/login'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTestResults([...testResults, data.data])
        }
      }
    } catch (err) {
      console.error('Device test error:', err)
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
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Device Testing</h1>
                <p className="text-sm text-gray-600">Test your authentication across different devices</p>
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
        {/* Device Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Device</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedDevice === device.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <device.icon className="h-6 w-6 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{device.label}</h3>
                      <p className="text-sm text-gray-500">{device.width} × {device.height}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Preview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Device Preview
              </span>
              <Button onClick={runDeviceTest} disabled={testRunning}>
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
            <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className={`mx-auto ${
                  selectedDevice === 'desktop' ? 'w-96 h-64' :
                  selectedDevice === 'tablet' ? 'w-48 h-64' :
                  'w-24 h-48'
                } bg-white rounded-lg shadow-lg flex items-center justify-center`}>
                  <div className="text-center">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {devices.find(d => d.id === selectedDevice)?.label} Preview
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Testing on {devices.find(d => d.id === selectedDevice)?.label} ({devices.find(d => d.id === selectedDevice)?.width})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mb-6">
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
                          {devices.find(d => d.id === result.device)?.label} Test
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Score: {result.results.performance}
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
