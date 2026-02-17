'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  Settings, 
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
  Settings2
} from 'lucide-react'

export default function SandboxConfigSyncPage() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [showConfig, setShowConfig] = useState(false)
  const [copied, setCopied] = useState(false)
  const [configData, setConfigData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real config data
  React.useEffect(() => {
    const fetchConfigData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/sandbox/config-persistence?action=recent')
        if (!response.ok) {
          throw new Error('Failed to fetch config data')
        }
        
        const data = await response.json()
        if (data.success) {
          setConfigData(data.data)
        } else {
          throw new Error(data.error || 'Failed to load config data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Config sync fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfigData()
  }, [])

  const handleSync = async () => {
    setSyncStatus('syncing')
    try {
      const response = await fetch('/api/sandbox/config-persistence', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'sync',
          targetConfigs: ['default']
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSyncStatus('synced')
          setLastSync(new Date())
        } else {
          setSyncStatus('error')
        }
      } else {
        setSyncStatus('error')
      }
    } catch (err) {
      setSyncStatus('error')
      console.error('Sync error:', err)
    }
  }

  const handleCopyConfig = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const syncHistory = [
    { time: '2 minutes ago', status: 'success', changes: 'Updated branding colors' },
    { time: '15 minutes ago', status: 'success', changes: 'Modified layout settings' },
    { time: '1 hour ago', status: 'success', changes: 'Added social login providers' },
    { time: '3 hours ago', status: 'error', changes: 'Failed validation' },
    { time: '5 hours ago', status: 'success', changes: 'Updated security settings' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Config Sync</h1>
                <p className="text-sm text-gray-600">Synchronize sandbox configuration with live settings</p>
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
        {/* Sync Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Configuration Sync Status
              </span>
              <Button onClick={handleSync} disabled={syncStatus === 'syncing'}>
                {syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                syncStatus === 'synced' ? 'bg-green-100 text-green-800' : 
                syncStatus === 'syncing' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {syncStatus === 'synced' && <CheckCircle className="h-4 w-4 mr-1" />}
                {syncStatus === 'syncing' && <RefreshCw className="h-4 w-4 mr-1 animate-spin" />}
                {syncStatus === 'error' && <XCircle className="h-4 w-4 mr-1" />}
                {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Error'}
              </div>
              <div className="text-sm text-gray-600">
                Last sync: {lastSync.toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sync History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.changes}</div>
                      <div className="text-xs text-gray-500">{item.time}</div>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'success' ? 'bg-green-100 text-green-800' :
                    item.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Current Configuration
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
                  {showConfig ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyConfig}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showConfig ? (
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm max-h-96">
                {`{
  "branding": {
    "appName": "Boundary Sandbox",
    "primaryColor": "#3b82f6",
    "showBranding": true
  },
  "layout": {
    "layout": "centered",
    "maxWidth": "400px",
    "borderRadius": "0.5rem"
  },
  "form": {
    "showEmailField": true,
    "showSocialLogin": true,
    "buttonStyle": "solid"
  },
  "background": {
    "type": "gradient",
    "gradientStops": [
      { "color": "#3b82f6", "position": 0 },
      { "color": "#8b5cf6", "position": 100 }
    ]
  }
}`}
              </pre>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Click the eye icon to view configuration</p>
              </div>
            )}
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
