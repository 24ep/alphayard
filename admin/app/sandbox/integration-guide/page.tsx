'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  BookOpen, 
  Code, 
  Copy, 
  Check, 
  Download, 
  Upload,
  Terminal,
  Globe,
  Smartphone,
  Monitor,
  BarChart3,
  Settings,
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
  Key,
  Lock,
  ExternalLink,
  Play,
  TestTube,
  Cpu,
  Package,
  Rocket,
  Target,
  Lightbulb,
  Book,
  FileCode,
  FileCheck,
  FilePlus,
  FileMinus,
  FolderOpen,
  FolderTree
} from 'lucide-react'

export default function SandboxIntegrationGuidePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('overview')

  const handleCopyCode = (codeId: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(codeId)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'quickstart', label: 'Quick Start', icon: Rocket },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'examples', label: 'Code Examples', icon: FileCode },
    { id: 'testing', label: 'Testing', icon: TestTube },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle }
  ]

  const codeExamples = {
    basicAuth: `// Basic Authentication
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})

const { token, user } = await loginResponse.json()`,
    
    socialAuth: `// Social Authentication
const socialLogin = async (provider) => {
  window.location.href = \`/api/auth/\${provider}?redirect_uri=\${encodeURIComponent(window.location.origin)}\`
}

// Handle callback
const handleAuthCallback = async (code, state) => {
  const response = await fetch('/api/auth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state })
  })
  return response.json()
}`,
    
    tokenValidation: `// Token Validation
const validateToken = async (token) => {
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const { valid, user, expires } = await response.json()
      return { valid, user, expires }
    }
    return { valid: false }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Integration Guide</h1>
                <p className="text-sm text-gray-600">Complete guide to integrate Boundary authentication</p>
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
        {/* Section Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Guide Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-2"
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content based on active section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What is Boundary Authentication?</h3>
                  <p className="text-gray-600">
                    Boundary Authentication is a comprehensive authentication system that provides secure login, 
                    signup, and user management capabilities for your applications.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Secure password-based authentication</li>
                    <li>Social login integration (Google, Microsoft, GitHub)</li>
                    <li>SSO support with SAML and OpenID Connect</li>
                    <li>Multi-factor authentication (MFA)</li>
                    <li>Session management and security</li>
                    <li>Real-time configuration updates</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
                  <p className="text-gray-600 mb-4">
                    Follow these steps to integrate Boundary Authentication into your application:
                  </p>
                  <ol className="list-decimal list-inside text-gray-600 space-y-2">
                    <li>Set up your Boundary account and create an application</li>
                    <li>Configure your authentication settings in the admin panel</li>
                    <li>Integrate the Boundary SDK or API into your application</li>
                    <li>Test your integration using the sandbox environment</li>
                    <li>Deploy to production</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'quickstart' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Installation</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <code>npm install @boundary/auth</code>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Basic Setup</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <pre>{`import { BoundaryAuth } from '@boundary/auth'

const auth = new BoundaryAuth({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/callback'
})`}</pre>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Login Component</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <pre>{`function Login() {
  const handleLogin = async (email, password) => {
    try {
      const result = await auth.signIn(email, password)
      // Handle successful login
      console.log('User logged in:', result.user)
    } catch (error) {
      // Handle error
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      handleLogin(formData.get('email'), formData.get('password'))
    }}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  )
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'api' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Endpoints</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="font-mono text-sm text-gray-900">POST /api/auth/login</div>
                      <p className="text-gray-600 text-sm mt-1">Authenticate user with email and password</p>
                      <div className="bg-gray-100 p-3 rounded-md mt-2">
                        <code className="text-xs">
                          {`{
  "email": "user@example.com",
  "password": "password123"
}`}
                        </code>
                      </div>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="font-mono text-sm text-gray-900">POST /api/auth/register</div>
                      <p className="text-gray-600 text-sm mt-1">Register a new user account</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <div className="font-mono text-sm text-gray-900">POST /api/auth/refresh</div>
                      <p className="text-gray-600 text-sm mt-1">Refresh access token</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <div className="font-mono text-sm text-gray-900">POST /api/auth/logout</div>
                      <p className="text-gray-600 text-sm mt-1">Logout user and invalidate session</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'examples' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Code Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Authentication</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                      <code>{codeExamples.basicAuth}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopyCode('basicAuth', codeExamples.basicAuth)}
                    >
                      {copiedCode === 'basicAuth' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Authentication</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                      <code>{codeExamples.socialAuth}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopyCode('socialAuth', codeExamples.socialAuth)}
                    >
                      {copiedCode === 'socialAuth' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Token Validation</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                      <code>{codeExamples.tokenValidation}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopyCode('tokenValidation', codeExamples.tokenValidation)}
                    >
                      {copiedCode === 'tokenValidation' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'testing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sandbox Testing</h3>
                  <p className="text-gray-600 mb-4">
                    Use the sandbox environment to test your integration before deploying to production.
                  </p>
                  <Button onClick={() => window.location.href = '/sandbox'} className="flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    Open Sandbox
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Scenarios</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Successful login and logout</li>
                    <li>Invalid credentials handling</li>
                    <li>Social login flows</li>
                    <li>Token refresh scenarios</li>
                    <li>Session management</li>
                    <li>Error handling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'troubleshooting' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Troubleshooting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Common Issues</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-medium text-gray-900">CORS Errors</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Ensure your application's domain is whitelisted in the Boundary admin panel.
                      </p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-medium text-gray-900">Invalid Redirect URI</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Check that the redirect URI in your app matches exactly what's configured in Boundary.
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900">Token Expired</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Implement automatic token refresh before the token expires.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <Button variant="outline" onClick={() => window.location.href = '/sandbox/api-playground'}>
                <Terminal className="h-4 w-4 mr-2" />
                API Playground
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
