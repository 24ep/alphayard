'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { ShieldCheckIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline'

interface Location {
  id: string
  user_id: string
  latitude: number
  longitude: number
  address?: string
  updated_at: string
}

interface EmergencyContact {
  id: string
  name: string
  phone_number: string
  relationship: string
  is_primary: boolean
}

export default function SafetyPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [locationsRes, contactsRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.SAFETY.LOCATIONS),
        apiClient.get(API_ENDPOINTS.SAFETY.EMERGENCY_CONTACTS),
      ])

      if (locationsRes.status === 'fulfilled') {
        setLocations(locationsRes.value.data || [])
      }
      if (contactsRes.status === 'fulfilled') {
        setContacts(contactsRes.value.data || [])
      }
    } catch (error) {
      console.error('Error loading safety data:', error)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Safety</h1>
        <p className="text-gray-600 mt-1">Circle safety and location tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Circle Locations</h2>
            <MapPinIcon className="w-6 h-6 text-macos-blue-600" />
          </div>
          {locations.length === 0 ? (
            <p className="text-gray-500 text-sm">No location data available</p>
          ) : (
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location.id} className="p-3 bg-gray-50 rounded-macos">
                  <p className="font-medium text-gray-900">
                    {location.address || `${location.latitude}, ${location.longitude}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {new Date(location.updated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
            <Button variant="outline" size="sm">Add Contact</Button>
          </div>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <PhoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">No emergency contacts</p>
              <Button variant="primary" size="sm">Add Contact</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-3 bg-gray-50 rounded-macos">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <p className="text-sm text-macos-blue-600 mt-1">{contact.phone_number}</p>
                    </div>
                    {contact.is_primary && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}


