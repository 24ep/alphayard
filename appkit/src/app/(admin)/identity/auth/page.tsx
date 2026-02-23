'use client'

import React from 'react'

export default function AuthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Authentication</h1>
        <p className="text-gray-600 mt-2">Configure authentication methods and settings</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Methods</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email & Password</p>
              <p className="text-sm text-gray-600">Traditional email-based authentication</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Enabled</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm">Configure</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Social Login</p>
              <p className="text-sm text-gray-600">Login with Google, GitHub, etc.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Enabled</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm">Configure</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">SSO / SAML</p>
              <p className="text-sm text-gray-600">Enterprise single sign-on</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">Disabled</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm">Enable</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Password Requirements</p>
              <p className="text-sm text-gray-600">Minimum 8 characters, include uppercase, lowercase, numbers</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Session Timeout</p>
              <p className="text-sm text-gray-600">24 hours</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
          </div>
        </div>
      </div>
    </div>
  )
}
