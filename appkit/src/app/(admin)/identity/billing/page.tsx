'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../../components/ui'
import { Badge } from '../../../../components/ui'
import { Button } from '../../../../components/ui'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCardIcon,
  UserIcon,
  ServerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface BillingAccount {
  id: string
  userId: string
  applicationId: string
  planType: 'free' | 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended' | 'cancelled'
  subscriptionId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEndsAt?: string
  cancelAtPeriodEnd: boolean
  billingEmail: string
  paymentMethod?: {
    type: 'card' | 'bank' | 'paypal'
    last4?: string
    brand?: string
    expiryMonth?: number
    expiryYear?: number
  }
  usage: {
    apiCalls: number
    storage: number // in MB
    bandwidth: number // in GB
    users: number
  }
  limits: {
    apiCalls: number
    storage: number // in MB
    bandwidth: number // in GB
    users: number
  }
  createdAt: string
  updatedAt: string
}

interface BillingPlan {
  id: string
  name: string
  type: 'free' | 'basic' | 'pro' | 'enterprise'
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    apiCalls: number
    storage: number
    bandwidth: number
    users: number
  }
  popular?: boolean
}

export default function BillingPage() {
  const [billingAccount, setBillingAccount] = useState<BillingAccount | null>(null)
  const [availablePlans, setAvailablePlans] = useState<BillingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - in real implementation, this would call the API
      const mockBillingAccount: BillingAccount = {
        id: 'billing-1',
        userId: 'user-1',
        applicationId: 'app-1',
        planType: 'basic',
        status: 'active',
        subscriptionId: 'sub_1234567890',
        currentPeriodStart: '2024-02-01T00:00:00Z',
        currentPeriodEnd: '2024-03-01T00:00:00Z',
        trialEndsAt: '2024-02-15T00:00:00Z',
        cancelAtPeriodEnd: false,
        billingEmail: 'user@example.com',
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025
        },
        usage: {
          apiCalls: 15420,
          storage: 2048,
          bandwidth: 15.6,
          users: 3
        },
        limits: {
          apiCalls: 50000,
          storage: 5120,
          bandwidth: 50,
          users: 5
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z'
      }

      const mockPlans: BillingPlan[] = [
        {
          id: 'free',
          name: 'Free',
          type: 'free',
          price: 0,
          currency: 'USD',
          interval: 'month',
          features: [
            '1 Application',
            '1 User',
            '10,000 API calls/month',
            '1 GB Storage',
            '10 GB Bandwidth',
            'Community Support'
          ],
          limits: {
            apiCalls: 10000,
            storage: 1024,
            bandwidth: 10,
            users: 1
          }
        },
        {
          id: 'basic',
          name: 'Basic',
          type: 'basic',
          price: 29,
          currency: 'USD',
          interval: 'month',
          features: [
            '1 Application',
            '5 Users',
            '50,000 API calls/month',
            '5 GB Storage',
            '50 GB Bandwidth',
            'Email Support',
            'Basic Analytics'
          ],
          limits: {
            apiCalls: 50000,
            storage: 5120,
            bandwidth: 50,
            users: 5
          },
          popular: true
        },
        {
          id: 'pro',
          name: 'Pro',
          type: 'pro',
          price: 99,
          currency: 'USD',
          interval: 'month',
          features: [
            '1 Application',
            '20 Users',
            '200,000 API calls/month',
            '20 GB Storage',
            '200 GB Bandwidth',
            'Priority Support',
            'Advanced Analytics',
            'Custom Domains'
          ],
          limits: {
            apiCalls: 200000,
            storage: 20480,
            bandwidth: 200,
            users: 20
          }
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          type: 'enterprise',
          price: 299,
          currency: 'USD',
          interval: 'month',
          features: [
            '1 Application',
            'Unlimited Users',
            '1,000,000 API calls/month',
            '100 GB Storage',
            '1 TB Bandwidth',
            '24/7 Phone Support',
            'Custom Integrations',
            'SLA Guarantee',
            'Dedicated Account Manager'
          ],
          limits: {
            apiCalls: 1000000,
            storage: 102400,
            bandwidth: 1024,
            users: 999999
          }
        }
      ]
      
      setBillingAccount(mockBillingAccount)
      setAvailablePlans(mockPlans)
    } catch (err: any) {
      console.error('Failed to load billing data:', err)
      setError('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradePlan = async (planId: string) => {
    try {
      setIsChangingPlan(true)
      
      // Mock upgrade - in real implementation, this would call the API
      const selectedPlan = availablePlans.find(p => p.id === planId)
      if (!selectedPlan) return
      
      const updatedAccount: BillingAccount = {
        ...billingAccount!,
        planType: selectedPlan.type,
        limits: selectedPlan.limits,
        updatedAt: new Date().toISOString()
      }
      
      setBillingAccount(updatedAccount)
      
      toast({
        title: 'Success',
        description: `Successfully upgraded to ${selectedPlan.name} plan`
      })
    } catch (err: any) {
      console.error('Failed to upgrade plan:', err)
      setError('Failed to upgrade plan')
    } finally {
      setIsChangingPlan(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setIsChangingPlan(true)
      
      // Mock cancellation - in real implementation, this would call the API
      const updatedAccount: BillingAccount = {
        ...billingAccount!,
        cancelAtPeriodEnd: true,
        updatedAt: new Date().toISOString()
      }
      
      setBillingAccount(updatedAccount)
      
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will be cancelled at the end of the current billing period'
      })
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err)
      setError('Failed to cancel subscription')
    } finally {
      setIsChangingPlan(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-700', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-700', label: 'Inactive' },
      suspended: { color: 'bg-red-100 text-red-700', label: 'Suspended' },
      cancelled: { color: 'bg-yellow-100 text-yellow-700', label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (!billingAccount) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Account</h3>
          <p className="text-gray-500">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <CreditCardIcon className="w-6 h-6 text-blue-600" />
            Billing & Plans
          </h1>
          <p className="text-gray-500 text-xs mt-1">Manage your subscription and billing settings</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(billingAccount.status)}
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your current billing plan and usage information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {billingAccount.planType} Plan
              </h3>
              <p className="text-sm text-gray-500">
                ${availablePlans.find(p => p.type === billingAccount.planType)?.price || 0} / month
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Next billing date: {new Date(billingAccount.currentPeriodEnd).toLocaleDateString()}
              </p>
              {billingAccount.cancelAtPeriodEnd && (
                <Badge className="bg-yellow-100 text-yellow-700 mt-1">
                  Cancels at period end
                </Badge>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900">Usage Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Calls</span>
                  <span className="text-sm font-medium">
                    {billingAccount.usage.apiCalls.toLocaleString()} / {billingAccount.limits.apiCalls.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingAccount.usage.apiCalls, billingAccount.limits.apiCalls))}`}
                    style={{ width: `${getUsagePercentage(billingAccount.usage.apiCalls, billingAccount.limits.apiCalls)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-sm font-medium">
                    {(billingAccount.usage.storage / 1024).toFixed(1)} GB / {(billingAccount.limits.storage / 1024).toFixed(1)} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingAccount.usage.storage, billingAccount.limits.storage))}`}
                    style={{ width: `${getUsagePercentage(billingAccount.usage.storage, billingAccount.limits.storage)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bandwidth</span>
                  <span className="text-sm font-medium">
                    {billingAccount.usage.bandwidth.toFixed(1)} GB / {billingAccount.limits.bandwidth} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingAccount.usage.bandwidth, billingAccount.limits.bandwidth))}`}
                    style={{ width: `${getUsagePercentage(billingAccount.usage.bandwidth, billingAccount.limits.bandwidth)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Users</span>
                  <span className="text-sm font-medium">
                    {billingAccount.usage.users} / {billingAccount.limits.users === 999999 ? 'Unlimited' : billingAccount.limits.users}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingAccount.usage.users, billingAccount.limits.users))}`}
                    style={{ width: `${getUsagePercentage(billingAccount.usage.users, billingAccount.limits.users)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {billingAccount.paymentMethod && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Payment Method</h4>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCardIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {billingAccount.paymentMethod.brand?.toUpperCase()} •••• {billingAccount.paymentMethod.last4}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires {billingAccount.paymentMethod.expiryMonth}/{billingAccount.paymentMethod.expiryYear}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Upgrade or downgrade your plan at any time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availablePlans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative p-6 border rounded-lg ${
                  plan.type === billingAccount.planType 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/{plan.interval}</span>
                  </div>
                </div>
                
                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6">
                  <Button
                    onClick={() => handleUpgradePlan(plan.id)}
                    disabled={plan.type === billingAccount.planType || isChangingPlan}
                    className="w-full"
                    variant={plan.type === billingAccount.planType ? "outline" : "primary"}
                  >
                    {plan.type === billingAccount.planType 
                      ? 'Current Plan' 
                      : isChangingPlan 
                        ? 'Processing...' 
                        : `Upgrade to ${plan.name}`
                    }
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Your billing details and account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Account Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account ID:</span>
                  <span className="text-sm font-medium">{billingAccount.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">User ID:</span>
                  <span className="text-sm font-medium">{billingAccount.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Application ID:</span>
                  <span className="text-sm font-medium">{billingAccount.applicationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Billing Email:</span>
                  <span className="text-sm font-medium">{billingAccount.billingEmail}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Subscription Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subscription ID:</span>
                  <span className="text-sm font-medium">{billingAccount.subscriptionId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Period:</span>
                  <span className="text-sm font-medium">
                    {new Date(billingAccount.currentPeriodStart).toLocaleDateString()} - {new Date(billingAccount.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                {billingAccount.trialEndsAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trial Ends:</span>
                    <span className="text-sm font-medium">{new Date(billingAccount.trialEndsAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium">{new Date(billingAccount.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {!billingAccount.cancelAtPeriodEnd && billingAccount.planType !== 'free' && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleCancelSubscription}
                variant="outline"
                disabled={isChangingPlan}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Billing Model</CardTitle>
          <CardDescription>
            Understanding the 1 User 1 App 1 Billing structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">1 User 1 App 1 Billing</h4>
              <p className="text-sm text-gray-600">
                Each billing account is tied to a specific user and application combination. This ensures clear ownership and billing responsibility.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <ServerIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Application-Specific Resources</h4>
              <p className="text-sm text-gray-600">
                All resource limits (API calls, storage, bandwidth, users) are specific to your application and cannot be shared across multiple applications.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <UserIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">User-Based Billing</h4>
              <p className="text-sm text-gray-600">
                Billing is tied to the user account, ensuring that each user has their own separate billing and subscription management.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CurrencyDollarIcon className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Flexible Pricing</h4>
              <p className="text-sm text-gray-600">
                Upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated for billing periods.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
