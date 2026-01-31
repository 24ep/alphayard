'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'

interface Circle {
    id: string
    name: string
}

interface PostModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void // renamed from onPostCreated
    postToEdit?: { id: string, content: string, CircleId?: string } | null
}

export function PostModal({ isOpen, onClose, onSuccess, postToEdit }: PostModalProps) {
    const [content, setContent] = useState('')
    const [families, setFamilies] = useState<Circle[]>([])
    const [selectedCircleId, setSelectedCircleId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingFamilies, setLoadingFamilies] = useState(false)

    const isEditing = !!postToEdit

    useEffect(() => {
        if (isOpen) {
            if (isEditing && postToEdit) {
                setContent(postToEdit.content)
                // Set Circle if possible, or ignore (editing content usually doesn't change Circle)
                if (postToEdit.CircleId) setSelectedCircleId(postToEdit.CircleId)
            } else {
                setContent('')
                // fetch families if creating
                fetchFamilies()
            }
        }
    }, [isOpen, isEditing, postToEdit])

    const fetchFamilies = async () => {
        setLoadingFamilies(true)
        try {
            const response = await apiClient.get(API_ENDPOINTS.SOCIAL.FAMILIES)
            const familiesData = response.data || []
            setFamilies(familiesData)
            if (familiesData.length > 0 && !selectedCircleId) {
                setSelectedCircleId(familiesData[0].id)
            }
        } catch (error) {
            console.error('Failed to fetch families:', error)
        } finally {
            setLoadingFamilies(false)
        }
    }

    const handleSubmit = async () => {
        if (!content.trim()) return
        if (!isEditing && !selectedCircleId) return

        setIsSubmitting(true)
        try {
            if (isEditing && postToEdit) {
                await apiClient.put(API_ENDPOINTS.SOCIAL.POST(postToEdit.id), {
                    content,
                    // usually status or other fields can be updated
                })
            } else {
                await apiClient.post(API_ENDPOINTS.SOCIAL.POSTS, {
                    content,
                    Circle_id: selectedCircleId,
                    type: 'text'
                })
            }

            setContent('')
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Failed to save post:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Post' : 'Create Post'}
        >
            <div className="space-y-4">
                {!isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Circle
                        </label>
                        {loadingFamilies ? (
                            <div className="h-10 bg-gray-100 rounded animate-pulse" />
                        ) : (
                            <select
                                value={selectedCircleId}
                                onChange={(e) => setSelectedCircleId(e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:border-macos-blue-500 focus:outline-none"
                            >
                                <option value="" disabled>Select a Circle</option>
                                {families.map((f) => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 h-32 resize-none focus:border-macos-blue-500 focus:outline-none"
                        placeholder="What's on your mind?"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim() || (!isEditing && !selectedCircleId)}
                    >
                        {isSubmitting ? (isEditing ? 'Saving...' : 'Posting...') : (isEditing ? 'Save' : 'Post')}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

