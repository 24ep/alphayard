'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { UserGroupIcon, CalendarIcon, ChatBubbleLeftRightIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function AdvancedSocialPage() {
  const [activeTab, setActiveTab] = useState<'groups' | 'events' | 'forums' | 'polls'>('groups')

  const tabs = [
    { key: 'groups' as const, label: 'Groups', icon: UserGroupIcon },
    { key: 'events' as const, label: 'Events', icon: CalendarIcon },
    { key: 'forums' as const, label: 'Forums', icon: ChatBubbleLeftRightIcon },
    { key: 'polls' as const, label: 'Polls', icon: ChartBarIcon },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Social</h1>
          <p className="text-gray-600 mt-1">Groups, events, forums, and more</p>
        </div>
        <Button variant="primary">Create</Button>
      </div>

      <Card>
        <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-macos ${
                  activeTab === tab.key
                    ? 'border-macos-blue-500 text-macos-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'groups' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-macos hover:bg-gray-100 cursor-pointer transition-macos">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-macos-blue-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-macos-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Circle Planning Committee</h3>
                  <p className="text-sm text-gray-600 mt-1">12 members • Private group</p>
                </div>
                <Button variant="outline" size="sm">Join</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-macos hover:bg-gray-100 cursor-pointer transition-macos">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Summer Circle Reunion 2024</h3>
                  <p className="text-sm text-gray-600 mt-1">July 15-17, 2024 • 24 attendees</p>
                </div>
                <div className="text-right">
                  <Button variant="outline" size="sm">RSVP</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forums' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-macos hover:bg-gray-100 cursor-pointer transition-macos">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Circle Recipes Discussion</h3>
                  <p className="text-sm text-gray-600 mt-1">45 topics • 128 replies</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'polls' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-macos">
              <h3 className="font-semibold text-gray-900 mb-3">Where should we go for vacation?</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                  <span className="text-sm text-gray-700">Beach Resort</span>
                  <span className="text-sm font-medium text-gray-900">45% (12 votes)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                  <span className="text-sm text-gray-700">Mountain Cabin</span>
                  <span className="text-sm font-medium text-gray-900">35% (9 votes)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                  <span className="text-sm text-gray-700">City Tour</span>
                  <span className="text-sm font-medium text-gray-900">20% (5 votes)</span>
                </div>
              </div>
              <Button variant="outline" size="sm">Vote</Button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Graph</h2>
          <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-macos overflow-hidden">
            <svg className="w-full h-full">
              {/* Sample network graph visualization */}
              {[
                { id: 1, x: 100, y: 100, name: 'You' },
                { id: 2, x: 250, y: 80, name: 'John' },
                { id: 3, x: 400, y: 120, name: 'Jane' },
                { id: 4, x: 200, y: 200, name: 'Mike' },
                { id: 5, x: 350, y: 220, name: 'Sarah' },
              ].map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={node.id === 1 ? '#0d7eff' : '#10b981'}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <text
                    x={node.x}
                    y={node.y + 35}
                    textAnchor="middle"
                    className="text-xs fill-gray-700"
                  >
                    {node.name}
                  </text>
                </g>
              ))}
              {/* Connections */}
              <line x1="100" y1="100" x2="250" y2="80" stroke="#d1d5db" strokeWidth="2" />
              <line x1="100" y1="100" x2="200" y2="200" stroke="#d1d5db" strokeWidth="2" />
              <line x1="250" y1="80" x2="400" y2="120" stroke="#d1d5db" strokeWidth="2" />
              <line x1="200" y1="200" x2="350" y2="220" stroke="#d1d5db" strokeWidth="2" />
              <line x1="400" y1="120" x2="350" y2="220" stroke="#d1d5db" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-macos-blue-500"></div>
                <span>You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Connections</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Feed</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-macos">
              <p className="text-sm text-gray-700">
                <span className="font-medium">John Doe</span> created a new event
              </p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-macos">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Jane Smith</span> joined Circle Planning Committee
              </p>
              <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


