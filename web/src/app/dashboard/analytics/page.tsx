'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const socialData = [
  { name: 'Jan', posts: 12, likes: 45, comments: 23 },
  { name: 'Feb', posts: 19, likes: 78, comments: 34 },
  { name: 'Mar', posts: 15, likes: 56, comments: 28 },
  { name: 'Apr', posts: 22, likes: 89, comments: 41 },
  { name: 'May', posts: 18, likes: 67, comments: 32 },
]

const taskData = [
  { name: 'Completed', value: 65, color: '#10b981' },
  { name: 'In Progress', value: 25, color: '#f59e0b' },
  { name: 'Pending', value: 10, color: '#ef4444' },
]

const CircleActivity = [
  { name: 'Circle A', events: 12, tasks: 8, posts: 15 },
  { name: 'Circle B', events: 8, tasks: 12, posts: 10 },
  { name: 'Circle C', events: 15, tasks: 6, posts: 18 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const handleExport = () => {
    // Export functionality
    console.log('Exporting analytics data...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Circle insights and engagement metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 rounded-macos border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-macos-blue-500/50 focus:border-macos-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button variant="outline" onClick={handleExport}>
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
              <p className="text-sm text-green-600 mt-1">+12% from last month</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-macos-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">68%</p>
              <p className="text-sm text-green-600 mt-1">+5% from last month</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">48</p>
              <p className="text-sm text-green-600 mt-1">+8 from last month</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-purple-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Task Completion</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">82%</p>
              <p className="text-sm text-green-600 mt-1">+3% from last month</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-yellow-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Engagement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={socialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="posts" stroke="#0d7eff" name="Posts" />
              <Line type="monotone" dataKey="likes" stroke="#10b981" name="Likes" />
              <Line type="monotone" dataKey="comments" stroke="#f59e0b" name="Comments" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Circle Activity Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={CircleActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="events" fill="#0d7eff" name="Events" />
            <Bar dataKey="tasks" fill="#10b981" name="Tasks" />
            <Bar dataKey="posts" fill="#f59e0b" name="Posts" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}


