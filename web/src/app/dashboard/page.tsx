'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card } from '@/components/ui'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'

interface DashboardStats {
  families: number
  posts: number
  events: number
  tasks: number
  photos: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    families: 0,
    posts: 0,
    events: 0,
    tasks: 0,
    photos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Load stats from various endpoints
      const [familiesRes, socialRes, calendarRes, tasksRes, galleryRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.Circle.LIST),
        apiClient.get(API_ENDPOINTS.SOCIAL.POSTS),
        apiClient.get(API_ENDPOINTS.CALENDAR.EVENTS),
        apiClient.get(API_ENDPOINTS.TASKS.LIST),
        apiClient.get(API_ENDPOINTS.GALLERY.PHOTOS),
      ])

      setStats({
        families: familiesRes.status === 'fulfilled' ? familiesRes.value.data?.length || 0 : 0,
        posts: socialRes.status === 'fulfilled' ? socialRes.value.data?.length || 0 : 0,
        events: calendarRes.status === 'fulfilled' ? calendarRes.value.data?.length || 0 : 0,
        tasks: tasksRes.status === 'fulfilled' ? tasksRes.value.data?.length || 0 : 0,
        photos: galleryRes.status === 'fulfilled' ? galleryRes.value.data?.length || 0 : 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your Circle</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-macos-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Families</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.families}</p>
              </div>
              <div className="w-12 h-12 bg-macos-blue-100 rounded-macos flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-macos-blue-600" />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.posts}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-macos flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.events}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-macos flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.tasks}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-macos flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Photos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.photos}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-macos flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


