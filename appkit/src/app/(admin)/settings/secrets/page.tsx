'use client'

import React from 'react'

export default function SecretsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Secrets Management</h1>
        <p className="text-gray-600 mt-2">Manage application secrets and API keys</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Variables</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">DATABASE_URL</p>
              <p className="text-sm text-gray-600">••••••••••••••••••••••••••••••••</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
              <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">API_SECRET_KEY</p>
              <p className="text-sm text-gray-600">••••••••••••••••••••••••••••••••</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
              <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Add New Secret
          </button>
        </div>
      </div>
    </div>
  )
}
