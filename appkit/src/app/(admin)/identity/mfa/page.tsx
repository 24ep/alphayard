'use client'

import React from 'react'

export default function MFAPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security & MFA</h1>
        <p className="text-gray-600 mt-2">Multi-factor authentication and security settings</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Multi-Factor Authentication</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Time-based OTP (TOTP)</p>
              <p className="text-sm text-gray-600">Authenticator apps like Google Authenticator</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Enabled</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm">Configure</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">SMS Authentication</p>
              <p className="text-sm text-gray-600">Verification codes via SMS</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">Disabled</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm">Enable</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Authentication</p>
              <p className="text-sm text-gray-600">Verification codes via email</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Enabled</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm">Configure</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Policies</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Require MFA for Admin Users</p>
              <p className="text-sm text-gray-600">All admin accounts must use MFA</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600" title="Toggle MFA requirement">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Login Attempt Limits</p>
              <p className="text-sm text-gray-600">Lock account after 5 failed attempts</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm">Configure</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">IP Whitelist</p>
              <p className="text-sm text-gray-600">Restrict access to specific IP ranges</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm">Configure</button>
          </div>
        </div>
      </div>
    </div>
  )
}
