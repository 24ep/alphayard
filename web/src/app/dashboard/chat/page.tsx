'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card } from '@/components/ui'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

interface Conversation {
  id: string
  name: string
  last_message?: {
    content: string
    created_at: string
  }
  unread_count?: number
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
    
    // Listen for new messages
    const handleNewMessage = (event: CustomEvent) => {
      loadConversations()
    }
    
    window.addEventListener('chat:new_message', handleNewMessage as EventListener)
    return () => window.removeEventListener('chat:new_message', handleNewMessage as EventListener)
  }, [])

  const loadConversations = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS)
      setConversations(response.data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
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
        <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
        <p className="text-gray-600 mt-1">Circle conversations</p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600">Start a conversation with your Circle</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Card key={conversation.id} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-macos-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-macos-blue-600 font-medium">
                      {conversation.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
                    {conversation.last_message && (
                      <p className="text-sm text-gray-600 mt-1">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {conversation.last_message && (
                    <p className="text-xs text-gray-500">
                      {new Date(conversation.last_message.created_at).toLocaleDateString()}
                    </p>
                  )}
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <span className="inline-block mt-2 px-2 py-1 bg-macos-blue-500 text-white text-xs font-medium rounded-full">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


