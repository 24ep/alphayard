'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { FolderIcon, DocumentIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'

interface File {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  mime_type?: string
  created_at: string
  updated_at: string
}

export default function StoragePage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STORAGE.FILES)
      setFiles(response.data || [])
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'folder') return FolderIcon
    if (file.mime_type?.startsWith('image/')) return PhotoIcon
    return DocumentIcon
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
          <h1 className="text-3xl font-bold text-gray-900">Storage</h1>
          <p className="text-gray-600 mt-1">Circle files and documents</p>
        </div>
        <Button variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Upload File
        </Button>
      </div>

      {files.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-600 mb-4">Upload your first file to get started</p>
            <Button variant="primary">Upload File</Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="space-y-2">
            {files.map((file) => {
              const Icon = getFileIcon(file)
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-macos cursor-pointer transition-macos"
                >
                  <Icon className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {file.size && <span>{formatFileSize(file.size)}</span>}
                      <span>Updated {new Date(file.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}


