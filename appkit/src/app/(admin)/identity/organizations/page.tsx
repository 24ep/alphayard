'use client'

import React from 'react'

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <p className="text-gray-600 mt-2">Manage organizations and their settings</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization List</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                AC
              </div>
              <div>
                <p className="font-medium text-gray-900">Acme Corporation</p>
                <p className="text-sm text-gray-600">acme@example.com • 25 members</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Active</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm">Manage</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                TS
              </div>
              <div>
                <p className="font-medium text-gray-900">Tech Startup Inc</p>
                <p className="text-sm text-gray-600">contact@techstartup.com • 12 members</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Active</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm">Manage</button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Create Organization
          </button>
        </div>
      </div>
    </div>
  )
}
