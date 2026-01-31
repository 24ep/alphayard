'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Photo {
  id: string
  url: string
  thumbnail_url?: string
  caption?: string
  uploaded_by: string
  created_at: string
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GALLERY.PHOTOS)
      setPhotos(response.data || [])
    } catch (error) {
      console.error('Error loading photos:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-1">Circle photos and memories</p>
        </div>
        <Button variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Upload Photo
        </Button>
      </div>

      {photos.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
            <p className="text-gray-600 mb-4">Start building your Circle gallery</p>
            <Button variant="primary">Upload Photo</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="p-0 overflow-hidden hover" onClick={() => {/* Open photo modal */}}>
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full h-48 object-cover"
              />
              {photo.caption && (
                <div className="p-3">
                  <p className="text-sm text-gray-700 truncate">{photo.caption}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


