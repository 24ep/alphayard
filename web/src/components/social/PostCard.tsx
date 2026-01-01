'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { ChatBubbleLeftRightIcon, HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { useAuth } from '@/contexts/AuthContext'

export interface Post {
    id: string
    content: string
    author: {
        id: string
        first_name: string
        last_name: string
        avatar_url?: string
    }
    created_at: string
    likes_count: number
    comments_count: number
    media_urls?: string[]
    family_id?: string
}

interface PostCardProps {
    post: Post
    onEdit: (post: Post) => void
    onDelete: (postId: string) => void
}

export function PostCard({ post: initialPost, onEdit, onDelete }: PostCardProps) {
    const [post, setPost] = useState(initialPost)
    const [isLiked, setIsLiked] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)

    const { user } = useAuth()
    const isAuthor = user?.id === post.author.id

    const handleLike = async () => {
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setPost(prev => ({
            ...prev,
            likes_count: prev.likes_count + (newIsLiked ? 1 : -1)
        }))

        try {
            if (newIsLiked) {
                await apiClient.post(API_ENDPOINTS.SOCIAL.LIKE(post.id), {})
            } else {
                await apiClient.delete(API_ENDPOINTS.SOCIAL.LIKE(post.id))
            }
        } catch (error) {
            setIsLiked(!newIsLiked)
            setPost(prev => ({
                ...prev,
                likes_count: prev.likes_count + (!newIsLiked ? 1 : -1)
            }))
            console.error('Error liking post:', error)
        }
    }

    const toggleComments = async () => {
        if (!showComments) {
            setShowComments(true)
            fetchComments()
        } else {
            setShowComments(false)
        }
    }

    const fetchComments = async () => {
        setLoadingComments(true)
        try {
            const response = await apiClient.get(API_ENDPOINTS.SOCIAL.COMMENTS(post.id))
            setComments(response.data || [])
        } catch (error) {
            console.error('Error fetching comments:', error)
        } finally {
            setLoadingComments(false)
        }
    }

    const handleAddComment = async () => {
        if (!newComment.trim()) return
        try {
            await apiClient.post(API_ENDPOINTS.SOCIAL.COMMENTS(post.id), {
                content: newComment
            })
            setNewComment('')
            fetchComments()
            setPost(prev => ({ ...prev, comments_count: prev.comments_count + 1 }))
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this post!',
                text: post.content,
                url: window.location.href
            }).catch(console.error)
        } else {
            alert('Share feature requires secure context or mobile device. (Copied to clipboard mocked)')
        }
    }

    const authorName = `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Unknown'
    const postDate = new Date(post.created_at).toLocaleDateString()

    return (
        <Card>
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-macos-blue-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-macos-blue-600 font-medium">
                            {authorName.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{authorName}</span>
                            <span className="text-sm text-gray-500">{postDate}</span>
                        </div>
                        {isAuthor && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(post)}
                                    className="p-1 text-gray-400 hover:text-macos-blue-500 transition-colors rounded-full hover:bg-gray-100"
                                    title="Edit post"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(post.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                                    title="Delete post"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                    {post.media_urls && post.media_urls.length > 0 && (
                        <div className={`grid gap-2 mb-4 ${post.media_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {post.media_urls.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    alt={`Post media ${idx + 1}`}
                                    className="w-full h-48 object-cover rounded-macos"
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-6 mt-2">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 transition-macos ${isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}
                        >
                            {isLiked ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                            <span>{post.likes_count || 0}</span>
                        </button>
                        <button
                            onClick={toggleComments}
                            className="flex items-center gap-2 text-gray-600 hover:text-macos-blue-600 transition-macos"
                        >
                            <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                            <span>{post.comments_count || 0}</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-macos"
                        >
                            <ShareIcon className="w-5 h-5" />
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                    {loadingComments ? (
                        <div className="text-center text-sm text-gray-500 py-2">Loading comments...</div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {comments.length === 0 && <p className="text-sm text-gray-500 text-center">No comments yet</p>}
                            {comments.map(c => (
                                <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="font-semibold text-xs text-gray-900 mb-1">
                                        {c.author?.first_name} {c.author?.last_name}
                                    </div>
                                    <p className="text-sm text-gray-700">{c.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-macos-blue-500 focus:outline-none"
                        />
                        <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>Post</Button>
                    </div>
                </div>
            )}
        </Card>
    )
}
