'use client'

import React from 'react'

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-600 mt-2">Configure webhooks for real-time event notifications</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Webhooks</h2>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">User Created Webhook</p>
                <p className="text-sm text-gray-600 mt-1">https://example.com/webhook/user-created</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Active</span>
                  <span className="text-xs text-gray-500">Last triggered: 2 hours ago</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Create Webhook
          </button>
        </div>
      </div>
    </div>
  )
}
