'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  due_date?: string
  assigned_to?: string
  priority?: 'low' | 'medium' | 'high'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    loadTasks()
    
    // Listen for task updates
    const handleTaskUpdate = (event: CustomEvent) => {
      loadTasks()
    }
    
    window.addEventListener('task:update', handleTaskUpdate as EventListener)
    return () => window.removeEventListener('task:update', handleTaskUpdate as EventListener)
  }, [])

  const loadTasks = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TASKS.LIST)
      setTasks(response.data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    if (filter === 'pending') return task.status !== 'completed'
    if (filter === 'completed') return task.status === 'completed'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-macos-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your Circle tasks</p>
        </div>
        <Button variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Task
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">Create your first task to get started</p>
            <Button variant="primary">Create Task</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} hover>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    className="w-5 h-5 rounded border-gray-300 text-macos-blue-600 focus:ring-macos-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {task.due_date && (
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                    {task.priority && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


