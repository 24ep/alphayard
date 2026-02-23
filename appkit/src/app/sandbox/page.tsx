'use client'

import React from 'react'

export default function SandboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sandbox</h1>
        <p className="text-gray-600 mt-2">Experimental features and testing environment</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sandbox Environment</h2>
        <p className="text-gray-600 mb-4">
          This is a safe environment for testing new features and experimental functionality.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Feature Testing</h3>
            <p className="text-sm text-gray-600">Test new features before they go live</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">API Playground</h3>
            <p className="text-sm text-gray-600">Experiment with API endpoints</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Component Library</h3>
            <p className="text-sm text-gray-600">Preview and test UI components</p>
          </div>
        </div>
      </div>
    </div>
  )
}
