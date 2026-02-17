'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  Terminal, 
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
  GitBranch,
  BookOpen,
  Beaker,
  Home,
  Settings,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react'

export default function SandboxAPIPlaygroundPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('login')
  const [requestBody, setRequestBody] = useState('')
  const [requestHeaders, setRequestHeaders] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const apiTemplates = {
    login: {
      name: 'Login API',
      method: 'POST',
      endpoint: '/api/sandbox/test-login',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <token>'
      },
      body: {
        email: 'test@example.com',
        password: 'Test123456!',
        rememberMe: true
      },
      description: 'Test the login authentication endpoint'
    },
    token: {
      name: 'Token Verification',
      method: 'GET',
      endpoint: '/api/sandbox/verify-token',
      headers: {
        'Authorization': 'Bearer <token>'
      },
      body: null,
      description: 'Verify and validate authentication tokens'
    },
    profile: {
      name: 'User Profile',
      method: 'GET',
      endpoint: '/api/sandbox/user/profile',
      headers: {
        'Authorization': 'Bearer <token>'
      },
      body: null,
      description: 'Get user profile information'
    },
    config: {
      name: 'Configuration',
      method: 'GET',
      endpoint: '/api/sandbox/config',
      headers: {
        'Content-Type': 'application/json'
      },
      body: null,
      description: 'Get current sandbox configuration'
    },
    logout: {
      name: 'Logout',
      method: 'POST',
      endpoint: '/api/sandbox/logout',
      headers: {
        'Authorization': 'Bearer <token>',
        'Content-Type': 'application/json'
      },
      body: {
        token: '<token>'
      },
      description: 'Logout and invalidate session'
    }
  }

  const currentTemplate = apiTemplates[selectedTemplate as keyof typeof apiTemplates]

  const handleExecuteRequest = async () => {
    setIsLoading(true)
    setResponse('')

    try {
      const headers = JSON.parse(requestHeaders || '{}')
      const body = requestBody ? JSON.parse(requestBody) : undefined

      const response = await fetch(currentTemplate.endpoint, {
        method: currentTemplate.method,
        headers: {
          ...currentTemplate.headers,
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      })

      const data = await response.json()
      setResponse(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      }, null, 2))
    } catch (error) {
      setResponse(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'ERROR'
      }, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadTemplate = () => {
    setRequestBody(JSON.stringify(currentTemplate.body, null, 2))
    setRequestHeaders(JSON.stringify(currentTemplate.headers, null, 2))
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportRequest = () => {
    const requestData = {
      method: currentTemplate.method,
      endpoint: currentTemplate.endpoint,
      headers: JSON.parse(requestHeaders || '{}'),
      body: requestBody ? JSON.parse(requestBody) : undefined
    }
    
    const blob = new Blob([JSON.stringify(requestData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-request-${selectedTemplate}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Terminal className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">API Playground</h1>
                <p className="text-sm text-gray-600">Test authentication APIs interactively</p>
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
        {/* Template Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(apiTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedTemplate === key
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                      {template.method}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <code className="text-xs text-gray-500">{template.endpoint}</code>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Request Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Request Configuration
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleLoadTemplate}>
                    Load Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportRequest}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Method and Endpoint */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-md text-sm font-medium">
                    {currentTemplate.method}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-md text-sm font-mono">
                    {currentTemplate.endpoint}
                  </div>
                </div>
              </div>

              {/* Headers */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Headers</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(requestHeaders)}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy
                  </Button>
                </div>
                <textarea
                  value={requestHeaders}
                  onChange={(e) => setRequestHeaders(e.target.value)}
                  placeholder='{"Content-Type": "application/json"}'
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Body */}
              {currentTemplate.method !== 'GET' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Body</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(requestBody)}
                      className="flex items-center gap-1"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      Copy
                    </Button>
                  </div>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder='{"email": "test@example.com", "password": "password"}'
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Execute Button */}
              <Button
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Response */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Response
                </span>
                {response && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(response)}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response ? (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm max-h-96">
                  {response}
                </pre>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Terminal className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Execute a request to see the response</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
              <Button variant="outline" onClick={() => window.location.href = '/sandbox/integration-guide'}>
                <BookOpen className="h-4 w-4 mr-2" />
                Integration Guide
              </Button>
              <Button variant="outline" onClick={() => window.location.href = 'http://localhost:3001/identity/users'}>
                <Settings className="h-4 w-4 mr-2" />
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
