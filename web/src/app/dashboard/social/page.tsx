'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { PostModal } from '@/components/social/PostModal' // Changed from CreatePostModal
import { PostCard, Post } from '@/components/social/PostCard'

export default function SocialPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false) // Renamed from isCreateModalOpen
  const [editingPost, setEditingPost] = useState<Post | null>(null) // New state for editing

  useEffect(() => {
    loadPosts()

    // Listen for new posts via socket
    const handleNewPost = (event: CustomEvent) => {
      setPosts((prev) => [event.detail, ...prev])
    }

    window.addEventListener('social:new_post', handleNewPost as EventListener)
    return () => window.removeEventListener('social:new_post', handleNewPost as EventListener)
  }, [])

  const loadPosts = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SOCIAL.POSTS)
      setPosts(response.data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await apiClient.delete(API_ENDPOINTS.SOCIAL.POST(postId))
      // Optimistic remove or reload
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Failed to delete post:', error)
      loadPosts() // Revert/Reload
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Feed</h1>
          <p className="text-gray-600 mt-1">Stay connected with your Circle</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>Create Post</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-macos-blue-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share something with your Circle</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>Create Post</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}

      <PostModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={loadPosts}
        postToEdit={editingPost ? {
          id: editingPost.id,
          content: editingPost.content,
          CircleId: editingPost.Circle_id
        } : null}
      />
    </div>
  )
}

