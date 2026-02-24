'use client'

import React, { useState, useEffect } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription, Input, Badge } from '../../../components/ui'
import { Label } from '../../../components/ui/Label'
import { useToast } from '@/hooks/use-toast'
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  domain?: string
  logo?: string | null
  settings: {
    maxUsers: number
    maxStorage: string
    features: string[]
  }
  status: 'active' | 'inactive' | 'suspended'
  userCount: number
  createdAt: string
  updatedAt: string
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    domain: '',
    maxUsers: 100,
    maxStorage: '10GB',
    features: ['user-management', 'analytics']
  })
  const { toast } = useToast()

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      // Mock data for now - in real implementation, this would call the API
      const mockOrganizations: Organization[] = [
        {
          id: '1',
          name: 'Acme Corporation',
          slug: 'acme-corp',
          description: 'Leading technology solutions provider',
          domain: 'acme.com',
          logo: null,
          settings: {
            maxUsers: 100,
            maxStorage: '100GB',
            features: ['user-management', 'analytics', 'api-access']
          },
          status: 'active',
          userCount: 25,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-02-20T14:22:00Z'
        },
        {
          id: '2',
          name: 'Tech Startup Inc',
          slug: 'tech-startup',
          description: 'Innovative startup focused on AI solutions',
          domain: 'techstartup.com',
          logo: null,
          settings: {
            maxUsers: 50,
            maxStorage: '50GB',
            features: ['user-management', 'analytics']
          },
          status: 'active',
          userCount: 12,
          createdAt: '2024-02-01T09:15:00Z',
          updatedAt: '2024-02-18T11:45:00Z'
        },
        {
          id: '3',
          name: 'Global Enterprises',
          slug: 'global-enterprises',
          description: 'Multinational corporation with global presence',
          domain: 'global.com',
          logo: null,
          settings: {
            maxUsers: 500,
            maxStorage: '1TB',
            features: ['user-management', 'analytics', 'api-access', 'advanced-security']
          },
          status: 'suspended',
          userCount: 156,
          createdAt: '2023-12-10T16:20:00Z',
          updatedAt: '2024-02-15T08:30:00Z'
        }
      ]
      
      setOrganizations(mockOrganizations)
    } catch (error) {
      console.error('Failed to load organizations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast({
          title: 'Validation Error',
          description: 'Name and slug are required',
          variant: 'destructive'
        })
        return
      }

      // In real implementation, this would call the API
      const newOrg: Organization = {
        id: Date.now().toString(),
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        domain: formData.domain,
        logo: null,
        settings: {
          maxUsers: formData.maxUsers,
          maxStorage: formData.maxStorage,
          features: formData.features
        },
        status: 'active',
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setOrganizations([...organizations, newOrg])
      setShowCreateModal(false)
      resetForm()
      
      toast({
        title: 'Success',
        description: 'Organization created successfully'
      })
    } catch (error) {
      console.error('Failed to create organization:', error)
      toast({
        title: 'Error',
        description: 'Failed to create organization',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateOrganization = async () => {
    try {
      if (!editingOrg || !formData.name || !formData.slug) {
        toast({
          title: 'Validation Error',
          description: 'Name and slug are required',
          variant: 'destructive'
        })
        return
      }

      // In real implementation, this would call the API
      const updatedOrg: Organization = {
        ...editingOrg,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        domain: formData.domain,
        settings: {
          maxUsers: formData.maxUsers,
          maxStorage: formData.maxStorage,
          features: formData.features
        },
        updatedAt: new Date().toISOString()
      }

      setOrganizations(organizations.map(org => 
        org.id === editingOrg.id ? updatedOrg : org
      ))
      setEditingOrg(null)
      resetForm()
      
      toast({
        title: 'Success',
        description: 'Organization updated successfully'
      })
    } catch (error) {
      console.error('Failed to update organization:', error)
      toast({
        title: 'Error',
        description: 'Failed to update organization',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteOrganization = async (orgId: string) => {
    try {
      // In real implementation, this would call the API
      setOrganizations(organizations.filter(org => org.id !== orgId))
      
      toast({
        title: 'Success',
        description: 'Organization deleted successfully'
      })
    } catch (error) {
      console.error('Failed to delete organization:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete organization',
        variant: 'destructive'
      })
    }
  }

  const handleStatusChange = async (orgId: string, newStatus: Organization['status']) => {
    try {
      // In real implementation, this would call the API
      setOrganizations(organizations.map(org => 
        org.id === orgId ? { ...org, status: newStatus, updatedAt: new Date().toISOString() } : org
      ))
      
      toast({
        title: 'Success',
        description: `Organization ${newStatus === 'active' ? 'activated' : newStatus === 'suspended' ? 'suspended' : 'deactivated'} successfully`
      })
    } catch (error) {
      console.error('Failed to update organization status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update organization status',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      domain: '',
      maxUsers: 100,
      maxStorage: '10GB',
      features: ['user-management', 'analytics']
    })
  }

  const openEditModal = (org: Organization) => {
    setEditingOrg(org)
    setFormData({
      name: org.name,
      slug: org.slug,
      description: org.description || '',
      domain: org.domain || '',
      maxUsers: org.settings.maxUsers,
      maxStorage: org.settings.maxStorage,
      features: org.settings.features
    })
  }

  const getStatusBadge = (status: Organization['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700">Suspended</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: Organization['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'inactive':
        return <ClockIcon className="w-5 h-5 text-gray-500" />
      case 'suspended':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
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
            <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            Organizations Management
          </h1>
          <p className="text-gray-500 text-xs mt-1">Manage organizations, their settings, and user limits for AppKit applications.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
              </div>
              <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {organizations.filter(org => org.status === 'active').length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {organizations.reduce((sum, org) => sum + org.userCount, 0)}
                </p>
              </div>
              <UsersIcon className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">
                  {organizations.filter(org => org.status === 'suspended').length}
                </p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Organization List</CardTitle>
          <CardDescription>Manage all organizations and their configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {org.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{org.name}</p>
                      {getStatusIcon(org.status)}
                    </div>
                    <p className="text-sm text-gray-600">{org.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{org.domain}</span>
                      <span>•</span>
                      <span>{org.userCount} users</span>
                      <span>•</span>
                      <span>{org.settings.maxUsers} max users</span>
                      <span>•</span>
                      <span>{org.settings.maxStorage} storage</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(org.status)}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditModal(org)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusChange(org.id, org.status === 'active' ? 'inactive' : 'active')}
                  >
                    {org.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteOrganization(org.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingOrg) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingOrg ? 'Edit Organization' : 'Create Organization'}</CardTitle>
              <CardDescription>
                {editingOrg ? 'Update organization details and settings' : 'Add a new organization to AppKit'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input 
                  placeholder="Acme Corporation"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input 
                  placeholder="acme-corp"
                  value={formData.slug}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Brief description of the organization"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Domain</Label>
                <Input 
                  placeholder="acme.com"
                  value={formData.domain}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, domain: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input 
                    type="number"
                    placeholder="100"
                    value={formData.maxUsers}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Storage Limit</Label>
                  <Input 
                    placeholder="10GB"
                    value={formData.maxStorage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxStorage: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingOrg(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingOrg ? handleUpdateOrganization : handleCreateOrganization}
              >
                {editingOrg ? 'Update' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
