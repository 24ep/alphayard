'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTES.LIST)
      setNotes(response.data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-1">Your Circle notes and thoughts</p>
        </div>
        <Button variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-4">Create your first note to get started</p>
            <Button variant="primary">Create Note</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} hover>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{note.content}</p>
              <div className="text-xs text-gray-500">
                Updated {new Date(note.updated_at).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


