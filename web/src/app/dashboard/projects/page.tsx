'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { FolderIcon, PlusIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on-hold' | 'completed'
  start_date: string
  end_date: string
  progress: number
  members: number
  tasks: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Project planning and management</p>
        </div>
        <Button variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Create your first project to get started</p>
            <Button variant="primary">Create Project</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-700' :
                      project.status === 'planning' ? 'bg-yellow-100 text-yellow-700' :
                      project.status === 'on-hold' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{project.members} members</span>
                    </div>
                    <span>{project.tasks} tasks</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-macos-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{project.progress}% complete</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gantt Chart</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="w-40">Task</div>
              <div className="flex-1 relative">
                <div className="flex gap-1">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="flex-1 text-center border-r border-gray-200 text-xs">
                      {new Date(new Date().getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {[
              { name: 'Planning Phase', start: 0, duration: 2, progress: 100 },
              { name: 'Design Phase', start: 2, duration: 3, progress: 60 },
              { name: 'Development', start: 5, duration: 4, progress: 30 },
              { name: 'Testing', start: 9, duration: 2, progress: 0 },
            ].map((task, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-40 text-sm font-medium text-gray-900">{task.name}</div>
                <div className="flex-1 relative h-8 bg-gray-100 rounded-macos">
                  <div
                    className="absolute h-full bg-gray-300 rounded-macos"
                    style={{
                      left: `${(task.start / 12) * 100}%`,
                      width: `${(task.duration / 12) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute h-full bg-macos-blue-500 rounded-macos"
                    style={{
                      left: `${(task.start / 12) * 100}%`,
                      width: `${(task.duration / 12) * 100 * (task.progress / 100)}%`,
                    }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      left: `${(task.start / 12) * 100}%`,
                      width: `${(task.duration / 12) * 100}%`,
                    }}
                  >
                    {task.progress}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Templates</h2>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-macos hover:bg-gray-100 cursor-pointer transition-macos">
              <p className="font-medium text-gray-900">Circle Vacation Planning</p>
              <p className="text-sm text-gray-600">Pre-configured vacation project</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-macos hover:bg-gray-100 cursor-pointer transition-macos">
              <p className="font-medium text-gray-900">Home Renovation</p>
              <p className="text-sm text-gray-600">Home improvement project template</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


