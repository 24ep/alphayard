'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DataCollectionView } from '../../../../components/common/DataCollectionView'
import { COLLECTIONS } from '../../../../config/collectionConfig'
import { adminService } from '../../../../services/adminService'
import { useApp } from '../../../../contexts/AppContext'

export default function DynamicCollectionPage() {
    const params = useParams()
    const router = useRouter()
    
    // Get config from slug
    const slug = (params?.slug as string) || ''
    const config = COLLECTIONS[slug]

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        if (!config) return
        setLoading(true)
        setError(null)
        try {
            const data = await adminService.getEntities(config.apiEndpoint)
            
            // Handle different API response structures
            let items = []
            if (Array.isArray(data)) {
                items = data
            } else if (Array.isArray(data?.data)) {
                items = data.data
            } else if (data && typeof data === 'object') {
                // Try to find the array property
                if (data.families) items = data.families
                else if (data.users) items = data.users
                else if (data.posts) items = data.posts
                else {
                    const key = Object.keys(data).find(k => Array.isArray(data[k]))
                    if (key) items = data[key]
                }
            }

            // Apply custom mapper if defined
            if (config.mapData) {
                items = config.mapData(items)
            }

            setData(items)
        } catch (err: any) {
            console.error(`Failed to fetch ${slug}:`, err)
            setError(err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (item: any) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return
        try {
            await adminService.deleteEntity(config.apiEndpoint, item.id)
            fetchData() // Refresh list
        } catch (err: any) {
            alert('Failed to delete: ' + err.message)
        }
    }

    const handleSave = async (formData: any) => {
        setSubmitting(true)
        try {
            if (editingItem) {
                await adminService.updateEntity(config.apiEndpoint, editingItem.id, formData)
            } else {
                await adminService.createEntity(config.apiEndpoint, formData)
            }
            setIsModalOpen(false)
            setEditingItem(null)
            fetchData()
        } catch (err: any) {
            alert('Failed to save: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        if (slug && config) {
            fetchData()
        } else if (slug && !config) {
            setError(`Collection "${slug}" not found configuration`)
            setLoading(false)
        }
    }, [slug, config])

    if (!config) {
        return (
            <div className="p-8 text-center text-gray-500">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Collection Not Found</h1>
                <p>The collection "{slug}" is not configured.</p>
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go to Dashboard
                </button>
            </div>
        )
    }

    return (
        <DataCollectionView
            collectionName={config.id}
            title={config.title}
            description={config.description}
            columns={config.columns}
            data={data}
            loading={loading}
            error={error}
            searchable={config.searchable}
            searchPlaceholder={config.searchPlaceholder}
            
            // CRUD Props
            canCreate={config.canCreate}
            canUpdate={config.canUpdate}
            canDelete={config.canDelete}
            schema={config.schema}
            
            onAdd={config.canCreate ? () => {
                setEditingItem(null)
                setIsModalOpen(true)
            } : undefined}
            
            onEdit={config.canUpdate ? (item) => {
                setEditingItem(item)
                setIsModalOpen(true)
            } : undefined}
            
            onDelete={config.canDelete ? handleDelete : undefined}
            
            // Modal Props (Assuming DataCollectionView handles modal or passing props suitable for it)
            isModalOpen={isModalOpen}
            onCloseModal={() => setIsModalOpen(false)}
            onSave={handleSave}
            editingItem={editingItem}
            isSubmitting={submitting}
        />
    )
}
