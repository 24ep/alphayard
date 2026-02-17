'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoginEmulator } from '../../components/settings/LoginEmulator'
import { SignupEmulator } from '../../components/settings/SignupEmulator'
import { LoginConfig } from '../../components/settings/LoginConfigTypes'
import { useConfigSync } from './hooks/useConfigSync'
import { 
  Play, 
  Settings, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Smartphone, 
  Monitor,
  ArrowRight,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  Terminal,
  BookOpen,
  AlertTriangle,
  Activity,
  Beaker,
  Home,
  Tablet,
  Cpu,
  Shield,
  Zap,
  Settings2,
  X,
  User,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon
} from 'lucide-react'

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [platformMode, setPlatformMode] = useState<'web-desktop' | 'web-mobile' | 'mobile-app'>('web-desktop')
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop')
  const [showConfig, setShowConfig] = useState(false)
  const [showUnifiedDrawer, setShowUnifiedDrawer] = useState(false)
  const [copiedConfig, setCopiedConfig] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState('')
  const [activeDrawerTab, setActiveDrawerTab] = useState<'credentials' | 'configuration'>('credentials')
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@example.com',
    password: 'Test123456!',
    username: 'testuser',
    company: 'Test Company'
  })

  // Use the config sync hook to get the actual configuration
  const { 
    config: sandboxConfig, 
    isLoading: configLoading, 
    error: configError,
    isLive,
    refresh: refreshConfig 
  } = useConfigSync()

  // Default configuration if config sync fails
  const defaultConfig: Partial<LoginConfig> = {
    branding: {
      appName: 'Boundary Sandbox',
      logoUrl: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#10b981',
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      showBranding: true,
      tagline: 'Test your login integration here',
      providerLogos: {}
    },
    layout: {
      layout: 'centered',
      maxWidth: '400px',
      padding: '2rem',
      borderRadius: '0.5rem',
      shadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      backdropBlur: false,
      showBranding: true,
      showFooter: true,
      footerText: 'Powered by Boundary',
      horizontalPosition: 'center',
      verticalPosition: 'center',
      useCustomPosition: false,
      buttonAlignment: 'center',
      buttonGroupLayout: 'vertical',
      buttonSpacing: 'medium',
      showButtonDivider: true,
      cardFloat: 'none',
      cardZIndex: '10',
      cardTransform: '',
      stickyPosition: false,
      responsivePositioning: true,
      ssoIconOnly: false,
      ssoButtonShape: 'default'
    },
    form: {
      showEmailField: true,
      showUsernameField: false,
      showPhoneField: false,
      showCompanyField: false,
      showPasswordField: true,
      showRememberMe: true,
      showForgotPassword: true,
      showSocialLogin: true,
      showSSO: true,
      showLanguageSelector: false,
      showThemeToggle: false,
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      signInButtonText: 'Sign In',
      rememberMeText: 'Remember me',
      forgotPasswordText: 'Forgot password?',
      socialLoginText: 'Or continue with',
      ssoButtonText: 'Continue with SSO',
      buttonStyle: 'solid',
      buttonSize: 'medium',
      buttonFullWidth: true,
      showButtonIcons: true,
      socialProviders: ['Google', 'Microsoft', 'GitHub'],
      ssoLayout: 'vertical'
    },
    background: {
      type: 'gradient',
      value: '#3b82f6',
      opacity: 1,
      blur: 0,
      gradientStops: [
        { color: '#3b82f6', position: 0 },
        { color: '#8b5cf6', position: 100 }
      ],
      gradientDirection: 'to right',
      patternType: 'dots',
      patternColor: '#f3f4f6',
      patternSize: '20px',
      videoUrl: '',
      imageUrl: ''
    },
    security: {
      enableTwoFactor: false,
      enableCaptcha: false,
      enableRateLimit: true,
      enableSessionManagement: true,
      enablePasswordStrength: true,
      enableAccountLockout: false,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: false,
      twoFactorMethods: ['email', 'sms'],
      captchaProvider: 'recaptcha',
      encryptionAlgorithm: 'AES-256',
      securityHeaders: {}
    },
    signup: {
      showNameField: true,
      showEmailField: true,
      showPhoneField: false,
      showCompanyField: false,
      showPasswordField: true,
      showConfirmPasswordField: true,
      showTermsCheckbox: true,
      showPrivacyCheckbox: true,
      namePlaceholder: 'Full name',
      emailPlaceholder: 'Email address',
      passwordPlaceholder: 'Password',
      confirmPasswordPlaceholder: 'Confirm password',
      submitButtonText: 'Create Account',
      signInLinkText: 'Already have an account? Sign in',
      buttonStyle: 'solid',
      buttonSize: 'medium',
      buttonFullWidth: true,
      showSocialLogin: true,
      socialLoginText: 'Or sign up with',
      socialProviders: ['Google', 'Microsoft', 'GitHub'],
      pageTitle: 'Create Account',
      pageSubtitle: 'Join our platform today',
      cardWidth: '400px',
      cardPadding: '2rem',
      borderRadius: '0.5rem',
      buttonAlignment: 'center',
      buttonGroupLayout: 'vertical',
      showButtonDivider: true,
      ssoLayout: 'vertical',
      ssoIconOnly: false,
      ssoButtonShape: 'default'
    }
  }

  // Use the synced config or fallback to default
  const currentConfig = sandboxConfig || defaultConfig

  const handleTestLogin = () => {
    const testUrl = `/api/sandbox/test-login?redirect=${encodeURIComponent(redirectUrl || '/sandbox/success')}`
    window.open(testUrl, '_blank')
  }

  const handleCopyConfig = async () => {
    const configJson = JSON.stringify(currentConfig, null, 2)
    await navigator.clipboard.writeText(configJson)
    setCopiedConfig(true)
    setTimeout(() => setCopiedConfig(false), 2000)
  }

  const handleExportConfig = () => {
    const configJson = JSON.stringify(currentConfig, null, 2)
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'boundary-login-config.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string)
          console.log('Imported config:', config)
          refreshConfig()
        } catch (error) {
          console.error('Invalid config file:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Configuration</h2>
            <p className="text-gray-600">Syncing with Login Configuration Manager...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h2>
            <p className="text-gray-600 mb-4">{configError}</p>
            <Button onClick={refreshConfig}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-full">
          {/* Configuration Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isLive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <Activity className="h-4 w-4 mr-1" />
              {isLive ? 'Live Sync' : 'Using Default'}
            </div>
            <Button variant="outline" size="sm" onClick={refreshConfig}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Config
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowUnifiedDrawer(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings & Credentials
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/admin', '_blank')}>
              <Settings2 className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          </div>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Live Preview
                  <span className="text-sm font-normal text-gray-500">
                    ({platformMode} - {deviceMode})
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    isLive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isLive ? 'Live Config' : 'Default Config'}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
                    {showConfig ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
                {/* Device Frame */}
                <div className={`mx-auto ${
                  deviceMode === 'mobile' ? 'max-w-sm' : 
                  deviceMode === 'tablet' ? 'max-w-2xl' : 
                  'max-w-4xl'
                }`}>
                  {/* Emulator Content */}
                  <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                    {activeTab === 'login' ? (
                      <LoginEmulator 
                        config={currentConfig} 
                        platformMode={platformMode}
                        deviceMode={deviceMode}
                      />
                    ) : (
                      <SignupEmulator 
                        config={currentConfig} 
                        platformMode={platformMode}
                        deviceMode={deviceMode}
                      />
                    )}
                  </div>
                </div>
                
                {/* Configuration Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-800">
                      <strong>Active Configuration:</strong> {isLive ? 'Live Sync' : 'Default'}
                    </div>
                    <div className="text-sm text-blue-600">
                      Theme: {currentConfig.branding?.primaryColor || '#3b82f6'}
                    </div>
                  </div>
                  {currentConfig.layout && (
                    <div className="mt-2 text-xs text-blue-700">
                      Layout: {currentConfig.layout.layout || 'centered'} • 
                      Max Width: {currentConfig.layout.maxWidth || '400px'} • 
                      Border Radius: {currentConfig.layout.borderRadius || '0.5rem'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Unified Settings & Credentials Drawer */}
      {showUnifiedDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowUnifiedDrawer(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Settings & Credentials</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowUnifiedDrawer(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveDrawerTab('credentials')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeDrawerTab === 'credentials'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Test Credentials
                </button>
                <button
                  onClick={() => setActiveDrawerTab('configuration')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeDrawerTab === 'configuration'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configuration
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Test Credentials Tab */}
                {activeDrawerTab === 'credentials' && (
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="unified-test-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          id="unified-test-email"
                          type="email"
                          value={testCredentials.email}
                          onChange={(e) => setTestCredentials({...testCredentials, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="unified-test-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                          id="unified-test-password"
                          type="password"
                          value={testCredentials.password}
                          onChange={(e) => setTestCredentials({...testCredentials, password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="unified-test-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          id="unified-test-username"
                          type="text"
                          value={testCredentials.username}
                          onChange={(e) => setTestCredentials({...testCredentials, username: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="unified-test-company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          id="unified-test-company"
                          type="text"
                          value={testCredentials.company}
                          onChange={(e) => setTestCredentials({...testCredentials, company: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Test Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Button onClick={handleTestLogin} className="w-full mb-2">
                        <Play className="h-4 w-4 mr-2" />
                        Test Login
                      </Button>
                      <div className="text-xs text-gray-500 text-center">
                        These credentials can be used to test the login flow
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Tab */}
                {activeDrawerTab === 'configuration' && (
                  <div className="p-4">
                    {/* Platform Mode */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Mode</label>
                      <div className="flex gap-2">
                        <Button
                          variant={platformMode === 'web-desktop' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setPlatformMode('web-desktop')}
                          className="flex items-center gap-1"
                        >
                          <MonitorIcon className="h-4 w-4" />
                          Web
                        </Button>
                        <Button
                          variant={platformMode === 'web-mobile' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setPlatformMode('web-mobile')}
                          className="flex items-center gap-1"
                        >
                          <SmartphoneIcon className="h-4 w-4" />
                          Mobile
                        </Button>
                        <Button
                          variant={platformMode === 'mobile-app' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setPlatformMode('mobile-app')}
                          className="flex items-center gap-1"
                        >
                          <SmartphoneIcon className="h-4 w-4" />
                          App
                        </Button>
                      </div>
                    </div>

                    {/* Device Mode */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Device Mode</label>
                      <div className="flex gap-2">
                        <Button
                          variant={deviceMode === 'desktop' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setDeviceMode('desktop')}
                        >
                          Desktop
                        </Button>
                        <Button
                          variant={deviceMode === 'tablet' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setDeviceMode('tablet')}
                        >
                          Tablet
                        </Button>
                        <Button
                          variant={deviceMode === 'mobile' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setDeviceMode('mobile')}
                        >
                          Mobile
                        </Button>
                      </div>
                    </div>

                    {/* Form Type */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Form Type</label>
                      <div className="flex gap-2">
                        <Button
                          variant={activeTab === 'login' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setActiveTab('login')}
                        >
                          Login
                        </Button>
                        <Button
                          variant={activeTab === 'signup' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setActiveTab('signup')}
                        >
                          Signup
                        </Button>
                      </div>
                    </div>

                    {/* Redirect URL */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={redirectUrl}
                          onChange={(e) => setRedirectUrl(e.target.value)}
                          placeholder="https://your-app.com/callback"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button onClick={handleTestLogin} className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          Test
                        </Button>
                      </div>
                    </div>

                    {/* Configuration JSON */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Configuration JSON</label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCopyConfig}>
                            {copiedConfig ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleExportConfig}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm max-h-96">
                        {JSON.stringify(currentConfig, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
