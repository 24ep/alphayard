'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../../components/ui'
import { Badge } from '../../../../components/ui'
import { Button } from '../../../../components/ui'
import { useToast } from '@/hooks/use-toast'
import { 
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  LockClosedIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface SSOProvider {
  id: string
  name: string
  displayName: string
  providerType: 'google' | 'microsoft' | 'facebook' | 'whatsapp' | 'twitter' | 'github'
  isEnabled: boolean
  clientId: string
  clientSecret: string
  authorizationUrl: string
  tokenUrl: string
  userinfoUrl: string
  scopes: string[]
  claimsMapping: Record<string, string | null>
  allowSignup: boolean
  requireEmailVerified: boolean
  autoLinkByEmail: boolean
  iconUrl?: string
  buttonColor?: string
  buttonText?: string
  jwksUrl?: string
  allowedDomains: string[]
  defaultRole?: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export default function AuthPage() {
  const [providers, setProviders] = useState<SSOProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/identity/sso-providers')
      if (!response.ok) {
        throw new Error('Failed to fetch providers')
      }
      
      const data = await response.json()
      
      // Transform API response to component format
      const transformedProviders: SSOProvider[] = data.providers.map((provider: any) => ({
        id: provider.id,
        name: provider.name,
        displayName: provider.displayName,
        providerType: provider.type as SSOProvider['providerType'],
        isEnabled: provider.enabled,
        clientId: provider.config.clientId || '',
        clientSecret: '', // Never expose client secret from API
        authorizationUrl: provider.config.authorizationUrl || '',
        tokenUrl: provider.config.tokenUrl || '',
        userinfoUrl: provider.config.userinfoUrl || '',
        scopes: provider.config.scopes || [],
        claimsMapping: provider.config.claimsMapping || {},
        allowSignup: provider.metadata?.allowSignup || false,
        requireEmailVerified: provider.metadata?.requireEmailVerified || true,
        autoLinkByEmail: provider.metadata?.autoLinkByEmail || false,
        iconUrl: provider.icon || '',
        buttonColor: provider.color || '#000000',
        buttonText: `Sign in with ${provider.displayName}`,
        allowedDomains: provider.config.allowedDomains || [],
        defaultRole: provider.metadata?.defaultRole || 'user',
        displayOrder: 0,
        createdAt: provider.statistics?.createdAt || new Date().toISOString(),
        updatedAt: provider.statistics?.updatedAt || new Date().toISOString()
      }))
      
      setProviders(transformedProviders)
    } catch (err: any) {
      console.error('Failed to load providers:', err)
      setError('Failed to load authentication providers')
      toast({
        title: 'Error',
        description: 'Failed to load authentication providers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProvider = async (providerId: string) => {
    try {
      const provider = providers.find(p => p.id === providerId)
      if (!provider) return

      const response = await fetch('/api/admin/identity/sso-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          enabled: !provider.isEnabled
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle provider')
      }

      const data = await response.json()
      
      // Update local state with response
      const updatedProviders = providers.map(p => 
        p.id === providerId ? { ...p, isEnabled: !p.isEnabled, updatedAt: new Date().toISOString() } : p
      )
      
      setProviders(updatedProviders)
      
      toast({
        title: 'Success',
        description: `${provider.displayName} ${!provider.isEnabled ? 'enabled' : 'disabled'} successfully`
      })
    } catch (err: any) {
      console.error('Failed to toggle provider:', err)
      setError('Failed to toggle provider')
      toast({
        title: 'Error',
        description: 'Failed to toggle provider',
        variant: 'destructive'
      })
    }
  }

  const handleSaveProvider = async (providerId: string, updates: Partial<SSOProvider>) => {
    try {
      const provider = providers.find(p => p.id === providerId)
      if (!provider) return

      // Prepare config object for API
      const config = {
        clientId: updates.clientId || provider.clientId,
        clientSecret: updates.clientSecret || provider.clientSecret,
        authorizationUrl: updates.authorizationUrl || provider.authorizationUrl,
        tokenUrl: updates.tokenUrl || provider.tokenUrl,
        userinfoUrl: updates.userinfoUrl || provider.userinfoUrl,
        scopes: updates.scopes || provider.scopes,
        claimsMapping: updates.claimsMapping || provider.claimsMapping,
        allowedDomains: updates.allowedDomains || provider.allowedDomains,
        iconUrl: updates.iconUrl || provider.iconUrl,
        buttonColor: updates.buttonColor || provider.buttonColor,
        allowSignup: updates.allowSignup !== undefined ? updates.allowSignup : provider.allowSignup,
        requireEmailVerified: updates.requireEmailVerified !== undefined ? updates.requireEmailVerified : provider.requireEmailVerified,
        autoLinkByEmail: updates.autoLinkByEmail !== undefined ? updates.autoLinkByEmail : provider.autoLinkByEmail,
        defaultRole: updates.defaultRole || provider.defaultRole
      }

      const response = await fetch('/api/admin/identity/sso-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          config,
          enabled: updates.isEnabled !== undefined ? updates.isEnabled : provider.isEnabled
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save provider configuration')
      }

      const data = await response.json()
      
      // Update local state with response
      const updatedProviders = providers.map(p => 
        p.id === providerId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
      
      setProviders(updatedProviders)
      setIsEditing(null)
      
      toast({
        title: 'Success',
        description: 'Provider configuration saved successfully'
      })
    } catch (err: any) {
      console.error('Failed to save provider:', err)
      setError('Failed to save provider configuration')
      toast({
        title: 'Error',
        description: 'Failed to save provider configuration',
        variant: 'destructive'
      })
    }
  }

  const getProviderIcon = (providerType: string) => {
    const icons = {
      google: '🔍',
      microsoft: '🪟',
      facebook: '📘',
      twitter: '𝕏',
      whatsapp: '💬',
      github: '🐙'
    }
    return icons[providerType as keyof typeof icons] || '🔑'
  }

  const getStatusBadge = (enabled: boolean) => {
    return enabled 
      ? <Badge className="bg-green-100 text-green-700">Enabled</Badge>
      : <Badge className="bg-gray-100 text-gray-700">Disabled</Badge>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            Authentication Methods
          </h1>
          <p className="text-gray-500 text-xs mt-1">Configure authentication methods and SSO providers</p>
        </div>
      </div>

      {/* Email & Password Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Email & Password Authentication</CardTitle>
          <CardDescription>
            Traditional email-based authentication with password policies and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <KeyIcon className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="text-md font-semibold text-gray-900">Email & Password</h3>
                <p className="text-sm text-gray-600">Traditional email-based authentication</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              <Button variant="outline" size="sm">
                <CogIcon className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Password Policy:</span>
                <span className="font-medium text-gray-900">8+ chars, mixed case</span>
              </div>
              <div className="flex justify-between">
                <span>Session Timeout:</span>
                <span className="font-medium text-gray-900">1 hour</span>
              </div>
              <div className="flex justify-between">
                <span>Max Attempts:</span>
                <span className="font-medium text-gray-900">5 attempts</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Require Email Verification:</span>
                <Badge className="bg-green-100 text-green-700">Yes</Badge>
              </div>
              <div className="flex justify-between">
                <span>Two-Factor Auth:</span>
                <Badge className="bg-yellow-100 text-yellow-700">Optional</Badge>
              </div>
              <div className="flex justify-between">
                <span>Remember Me:</span>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SSO Providers */}
      <Card>
        <CardHeader>
          <CardTitle>SSO Providers</CardTitle>
          <CardDescription>
            Configure Single Sign-On providers for seamless authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => (
            <div key={provider.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getProviderIcon(provider.providerType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.displayName}
                      </h3>
                      {getStatusBadge(provider.isEnabled)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {provider.providerType === 'google' && 'Google OAuth 2.0 for Google accounts'}
                      {provider.providerType === 'microsoft' && 'Microsoft Azure AD for Microsoft accounts'}
                      {provider.providerType === 'facebook' && 'Facebook Login for Facebook accounts'}
                      {provider.providerType === 'twitter' && 'X (Twitter) OAuth for Twitter accounts'}
                      {provider.providerType === 'whatsapp' && 'WhatsApp Business API for WhatsApp accounts'}
                      {provider.providerType === 'github' && 'GitHub OAuth for GitHub accounts'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleToggleProvider(provider.id)}
                    variant={provider.isEnabled ? "outline" : "primary"}
                    size="sm"
                  >
                    {provider.isEnabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(isEditing === provider.id ? null : provider.id)}
                    variant="outline"
                    size="sm"
                  >
                    {isEditing === provider.id ? 'Cancel' : 'Configure'}
                  </Button>
                </div>
              </div>

              {/* Provider Configuration Details */}
              {isEditing === provider.id && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">Basic Configuration</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                          <input
                            type="text"
                            value={provider.clientId}
                            onChange={(e) => {
                              const updatedProviders = providers.map(p => 
                                p.id === provider.id ? { ...p, clientId: e.target.value } : p
                              );
                              setProviders(updatedProviders);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter client ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                          <div className="relative">
                            <input
                              type={provider.clientSecret.includes('mock') ? 'text' : 'password'}
                              value={provider.clientSecret}
                              onChange={(e) => {
                                const updatedProviders = providers.map(p => 
                                  p.id === provider.id ? { ...p, clientSecret: e.target.value } : p
                                );
                                setProviders(updatedProviders);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter client secret"
                            />
                            {provider.clientSecret.includes('mock') && (
                              <div className="absolute right-3 top-2.5">
                                <EyeIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                          <input
                            type="text"
                            value={provider.displayName}
                            onChange={(e) => {
                              const updatedProviders = providers.map(p => 
                                p.id === provider.id ? { ...p, displayName: e.target.value } : p
                              );
                              setProviders(updatedProviders);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter display name"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">OAuth Settings</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Authorization URL</label>
                          <input
                            type="text"
                            value={provider.authorizationUrl}
                            onChange={(e) => {
                              const updatedProviders = providers.map(p => 
                                p.id === provider.id ? { ...p, authorizationUrl: e.target.value } : p
                              );
                              setProviders(updatedProviders);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter authorization URL"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Token URL</label>
                          <input
                            type="text"
                            value={provider.tokenUrl}
                            onChange={(e) => {
                              const updatedProviders = providers.map(p => 
                                p.id === provider.id ? { ...p, tokenUrl: e.target.value } : p
                              );
                              setProviders(updatedProviders);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter token URL"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Userinfo URL</label>
                          <input
                            type="text"
                            value={provider.userinfoUrl}
                            onChange={(e) => {
                              const updatedProviders = providers.map(p => 
                                p.id === provider.id ? { ...p, userinfoUrl: e.target.value } : p
                              );
                              setProviders(updatedProviders);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter userinfo URL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">Security Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Allow Signup</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const updatedProviders = providers.map(p => 
                                  p.id === provider.id ? { ...p, allowSignup: !p.allowSignup } : p
                                );
                                setProviders(updatedProviders);
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                provider.allowSignup
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                              role="switch"
                              aria-checked={provider.allowSignup}
                              aria-label="Allow Signup"
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full ${
                                  provider.allowSignup
                                    ? 'bg-white translate-x-[-1px]'
                                    : 'bg-gray-300 translate-x-[1px]'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-gray-600">
                              {provider.allowSignup ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Require Email Verified</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const updatedProviders = providers.map(p => 
                                  p.id === provider.id ? { ...p, requireEmailVerified: !p.requireEmailVerified } : p
                                );
                                setProviders(updatedProviders);
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                provider.requireEmailVerified
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                              role="switch"
                              aria-checked={provider.requireEmailVerified}
                              aria-label="Require Email Verified"
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full ${
                                  provider.requireEmailVerified
                                    ? 'bg-white translate-x-[-1px]'
                                    : 'bg-gray-300 translate-x-[1px]'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-gray-600">
                              {provider.requireEmailVerified ? 'Required' : 'Not Required'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Auto Link by Email</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const updatedProviders = providers.map(p => 
                                  p.id === provider.id ? { ...p, autoLinkByEmail: !p.autoLinkByEmail } : p
                                );
                                setProviders(updatedProviders);
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                provider.autoLinkByEmail
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                              role="switch"
                              aria-checked={provider.autoLinkByEmail}
                              aria-label="Auto Link by Email"
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full ${
                                  provider.autoLinkByEmail
                                    ? 'bg-white translate-x-[-1px]'
                                    : 'bg-gray-300 translate-x-[1px]'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-gray-600">
                              {provider.autoLinkByEmail ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">UI Settings</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={provider.buttonText || ''}
                            onChange={(e) => {
                              const updatedProviders = providers.map(p => 
                                p.id === provider.id ? { ...p, buttonText: e.target.value } : p
                              );
                              setProviders(updatedProviders);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter button text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Button Color</label>
                          <input
                            type="text"
                            value={provider.buttonColor || ''}
                            onChange={(e) => {
                              const updatedProviders = providers.map(p => 
                                p.id === provider.id ? { ...p, buttonColor: e.target.value } : p
                              );
                              setProviders(updatedProviders);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter button color (hex)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Default Role</label>
                          <select
                            value={provider.defaultRole || ''}
                            onChange={(e) => {
                              const updatedProviders = providers.map(p => 
                                p.id === provider.id ? { ...p, defaultRole: e.target.value } : p
                              );
                              setProviders(updatedProviders);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Default Role"
                            title="Default user role for new signups"
                          >
                            <option value="">Select role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="developer">Developer</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">Allowed Domains</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allowed Domains (one per line)
                      </label>
                      <textarea
                        value={provider.allowedDomains.join('\n')}
                        onChange={(e) => {
                          const updatedProviders = providers.map(p => 
                            p.id === provider.id ? { ...p, allowedDomains: e.target.value.split('\n').filter(d => d.trim()) } : p
                          );
                          setProviders(updatedProviders);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="example.com&#10;company.com"
                      />
                      <p className="text-xs text-gray-500">
                        Only users from these domains can authenticate with this provider
                      </p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setIsEditing(null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveProvider(provider.id, providers.find(p => p.id === provider.id)!)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Provider Status Summary */}
              {isEditing !== provider.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      {getStatusBadge(provider.isEnabled)}
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Created:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(provider.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About SSO Configuration</CardTitle>
          <CardDescription>
            Understanding SSO provider setup and best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">OAuth 2.0 Flow</h4>
              <p className="text-sm text-gray-600">
                All providers use OAuth 2.0 for secure authentication. Users are redirected to the provider's authorization page and return with an access token.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <LockClosedIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Security Best Practices</h4>
              <p className="text-sm text-gray-600">
                Always use HTTPS for redirect URIs, validate ID tokens, and implement proper session management for security.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <UserGroupIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">User Provisioning</h4>
              <p className="text-sm text-gray-600">
                Configure automatic user creation for new users or require manual approval for enterprise environments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
