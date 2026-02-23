'use client'

import React from 'react'

export default function DevelopersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Developers</h1>
        <p className="text-gray-600 mt-2">Developer tools and API documentation</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Developer Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">API Documentation</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm font-medium">REST API</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">View Docs</button>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm font-medium">GraphQL API</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">View Docs</button>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm font-medium">Webhook API</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">View Docs</button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Development Tools</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm font-medium">API Keys</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">Manage</button>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm font-medium">SDK Downloads</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm font-medium">Test Console</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">Open</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
