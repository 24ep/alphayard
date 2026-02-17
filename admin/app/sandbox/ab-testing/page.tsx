'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  GitBranch, 
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
  Settings,
  AlertTriangle,
  Eye,
  EyeOff,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Target,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  FileText,
  Settings2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Pause,
  Square,
  Circle
} from 'lucide-react'

export default function SandboxABTestingPage() {
  const [selectedTest, setSelectedTest] = useState('login-form')
  const [testStatus, setTestStatus] = useState<'draft' | 'running' | 'paused' | 'completed'>('draft')
  const [showResults, setShowResults] = useState(false)
  const [abTests, setAbTests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real A/B test data
  React.useEffect(() => {
    const fetchABTestData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/sandbox/ab-testing?action=list')
        if (!response.ok) {
          throw new Error('Failed to fetch A/B test data')
        }
        
        const data = await response.json()
        if (data.success) {
          setAbTests(data.data)
        } else {
          throw new Error(data.error || 'Failed to load A/B tests')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('A/B testing fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchABTestData()
  }, [])
  const [copied, setCopied] = useState(false)

  const currentTest = abTests.find(test => test.id === selectedTest)

  const handleStartTest = () => {
    setTestStatus('running')
  }

  const handlePauseTest = () => {
    setTestStatus('paused')
  }

  const handleStopTest = () => {
    setTestStatus('completed')
  }

  const handleCopyConfig = () => {
    const config = JSON.stringify(currentTest, null, 2)
    navigator.clipboard.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />
      case 'running':
        return <Activity className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">A/B Testing</h1>
                <p className="text-sm text-gray-500">Test and optimize your login experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Test
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Tests</h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {abTests.map((test: any) => (
                  <option key={test.id} value={test.id}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {abTests.map((test: any) => (
              <Card key={test.id} className={`cursor-pointer transition-all ${
                selectedTest === test.id ? 'ring-2 ring-purple-500' : ''
              }`} onClick={() => setSelectedTest(test.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-500">{test.description}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {getStatusIcon(test.status)}
                    <span>{test.duration}</span>
                    <span>•</span>
                    <span>{test.confidence}% confidence</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Test Details */}
        {currentTest && (
          <div className="space-y-6">
            {/* Test Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(currentTest.status)}
                    {currentTest.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyConfig}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Config'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {testStatus === 'draft' && (
                      <Button size="sm" onClick={handleStartTest}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Test
                      </Button>
                    )}
                    {testStatus === 'running' && (
                      <Button variant="outline" size="sm" onClick={handlePauseTest}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    {testStatus === 'paused' && (
                      <Button size="sm" onClick={handleStartTest}>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    {testStatus === 'running' && (
                      <Button variant="outline" size="sm" onClick={handleStopTest}>
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Test Details</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Status:</dt>
                        <dd className="font-medium">{currentTest.status}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Duration:</dt>
                        <dd className="font-medium">{currentTest.duration}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Confidence:</dt>
                        <dd className="font-medium">{currentTest.confidence}%</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Traffic Split</h4>
                    <dl className="space-y-1 text-sm">
                      {currentTest.variants?.map((variant: any, index: number) => (
                        <div key={variant.id} className="flex justify-between">
                          <dt className="text-gray-500">{variant.name}:</dt>
                          <dd className="font-medium">{variant.users} users</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                    <dl className="space-y-1 text-sm">
                      {currentTest.variants?.map((variant: any, index: number) => (
                        <div key={variant.id} className="flex justify-between">
                          <dt className="text-gray-500">{variant.name}:</dt>
                          <dd className="font-medium">{variant.conversion}% conversion</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Test Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentTest.variants?.map((variant: any, index: number) => (
                    <div key={variant.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{variant.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{variant.users} users</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{variant.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <dt className="text-gray-500">Conversion</dt>
                          <dd className="font-semibold text-lg">{variant.conversion}%</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Users</dt>
                          <dd className="font-semibold text-lg">{variant.users}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Revenue</dt>
                          <dd className="font-semibold text-lg">${(variant.users * variant.conversion / 100 * 10).toFixed(0)}</dd>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {showResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Conversion Rate</h4>
                        <div className="space-y-2">
                          {currentTest.variants?.map((variant: any, index: number) => (
                            <div key={variant.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{variant.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full" 
                                    style={{ width: `${variant.conversion}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{variant.conversion}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">User Distribution</h4>
                        <div className="space-y-2">
                          {currentTest.variants?.map((variant: any, index: number) => (
                            <div key={variant.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{variant.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${(variant.users / currentTest.variants.reduce((sum: number, v: any) => sum + v.users, 0)) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{variant.users}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setShowResults(!showResults)}>
            {showResults ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showResults ? 'Hide Results' : 'Show Results'}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
