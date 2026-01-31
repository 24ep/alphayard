'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand you want help with: ' + userMessage.content + '. How can I assist you further?',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-600 mt-1">Get help with your Circle management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-600">Ask me anything about your Circle management</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-macos-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-macos-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-macos-lg p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button variant="primary" onClick={handleSend} disabled={loading}>
                <PaperAirplaneIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-macos">
              <p className="font-medium text-gray-900 text-sm">Circle Management</p>
              <p className="text-xs text-gray-600 mt-1">Help with Circle organization</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-macos">
              <p className="font-medium text-gray-900 text-sm">Calendar Planning</p>
              <p className="text-xs text-gray-600 mt-1">Assist with event scheduling</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-macos">
              <p className="font-medium text-gray-900 text-sm">Task Management</p>
              <p className="text-xs text-gray-600 mt-1">Help organize tasks</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


