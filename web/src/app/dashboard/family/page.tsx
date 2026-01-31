'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Circle {
  id: string
  name: string
  description: string | null
  created_at: string
  member_count?: number
}

export default function CirclePage() {
  const [families, setFamilies] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFamilies()
  }, [])

  const loadFamilies = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.Circle.LIST)
      setFamilies(response.data || [])
    } catch (error) {
      console.error('Error loading families:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-macos-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Families</h1>
          <p className="text-gray-600 mt-1">Manage your Circle groups</p>
        </div>
        <Button variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Circle
        </Button>
      </div>

      {families.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No families yet</h3>
            <p className="text-gray-600 mb-4">Create your first Circle to get started</p>
            <Button variant="primary">Create Circle</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {families.map((Circle) => (
            <Card key={Circle.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-macos-blue-100 rounded-macos flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-macos-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{Circle.name}</h3>
              {Circle.description && (
                <p className="text-sm text-gray-600 mb-4">{Circle.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{Circle.member_count || 0} members</span>
                <span>{new Date(Circle.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


