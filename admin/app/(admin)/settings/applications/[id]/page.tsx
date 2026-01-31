'use client'

import React, { useState, useEffect } from 'react'
import { adminService, Application } from '../../../../../services/adminService'
import { useParams, useRouter } from 'next/navigation'

interface AppVersion {
    id: string
    version_number: number
    status: 'draft' | 'published' | 'archived'
    created_at: string
    published_at?: string
    branding: any
    settings: any
}

export default function ApplicationDetail() {
    const params = useParams()
    const router = useRouter()
    const [app, setApp] = useState<Application | null>(null)
    const [versions, setVersions] = useState<AppVersion[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        if (!params || !params.id) return
        try {
            const appId = params.id as string
            const appData = await adminService.getApplications()
            const foundApp = appData.applications.find((a: Application) => a.id === appId)
            if (foundApp) setApp(foundApp)

            const verData = await adminService.getApplicationVersions(appId)
            setVersions(verData.versions)
        } catch (error) {
            console.error('Failed to fetch app details', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (params && params.id) fetchData()
    }, [params])

    const handleCreateDraft = async () => {
        if (!app) return
        try {
            await adminService.createApplicationVersion(app.id)
            await fetchData()
        } catch (error) {
            alert('Failed to create draft')
        }
    }

    const handlePublish = async (version: AppVersion) => {
        if (!app) return
        if (!confirm(`Are you sure you want to publish version ${version.version_number}?`)) return
        try {
            await adminService.publishApplicationVersion(app.id, version.id)
            await fetchData()
        } catch (error) {
            alert('Failed to publish version')
        }
    }

    if (isLoading) return <div>Loading...</div>
    if (!app) return <div>Application not found</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mb-2">← Back</button>
                    <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
                    <div className="text-sm text-gray-500">{app.slug}</div>
                </div>
                <button
                    onClick={handleCreateDraft}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Create New Draft
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Version History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {versions.map((ver) => (
                                <tr key={ver.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">v{ver.version_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${ver.status === 'published' ? 'bg-green-100 text-green-800' : 
                                              ver.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-gray-100 text-gray-800'}`}>
                                            {ver.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(ver.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {ver.published_at ? new Date(ver.published_at).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {ver.status === 'draft' && (
                                            <>
                                                <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                                <button 
                                                    onClick={() => handlePublish(ver)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Publish
                                                </button>
                                            </>
                                        )}
                                        {ver.status === 'published' && (
                                            <span className="text-gray-400">Current Live</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
