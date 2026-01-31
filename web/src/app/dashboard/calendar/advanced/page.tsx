'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'

type View = 'month' | 'week' | 'day' | 'agenda' | 'timeline'

export default function AdvancedCalendarPage() {
  const [currentView, setCurrentView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const views: { key: View; label: string }[] = [
    { key: 'month', label: 'Month' },
    { key: 'week', label: 'Week' },
    { key: 'day', label: 'Day' },
    { key: 'agenda', label: 'Agenda' },
    { key: 'timeline', label: 'Timeline' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Calendar</h1>
          <p className="text-gray-600 mt-1">Multi-view calendar with advanced planning features</p>
        </div>
        <Button variant="primary">Create Event</Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {views.map((view) => (
              <Button
                key={view.key}
                variant={currentView === view.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCurrentView(view.key)}
              >
                {view.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDate = new Date(currentDate)
                  if (currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1)
                  } else if (currentView === 'week') {
                    newDate.setDate(newDate.getDate() - 7)
                  } else {
                    newDate.setDate(newDate.getDate() - 1)
                  }
                  setCurrentDate(newDate)
                }}
              >
                ←
              </Button>
              <span className="font-medium text-gray-900 min-w-[200px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDate = new Date(currentDate)
                  if (currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1)
                  } else if (currentView === 'week') {
                    newDate.setDate(newDate.getDate() + 7)
                  } else {
                    newDate.setDate(newDate.getDate() + 1)
                  }
                  setCurrentDate(newDate)
                }}
              >
                →
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          {currentView === 'month' && (
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
              {(() => {
                const year = currentDate.getFullYear()
                const month = currentDate.getMonth()
                const firstDay = new Date(year, month, 1)
                const startDate = new Date(firstDay)
                startDate.setDate(startDate.getDate() - firstDay.getDay())
                const days: Date[] = []
                for (let i = 0; i < 42; i++) {
                  const date = new Date(startDate)
                  date.setDate(startDate.getDate() + i)
                  days.push(date)
                }
                return days.map((date, idx) => {
                  const isCurrentMonth = date.getMonth() === month
                  const isToday = date.toDateString() === new Date().toDateString()
                  return (
                    <div
                      key={idx}
                      className={`min-h-[100px] p-2 border border-gray-200 rounded-macos cursor-pointer hover:bg-gray-50 transition-macos ${
                        !isCurrentMonth ? 'bg-gray-50 opacity-50' : ''
                      } ${isToday ? 'ring-2 ring-macos-blue-500' : ''}`}
                      onClick={() => setCurrentDate(date)}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-macos-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {currentView === 'week' && (
            <div className="space-y-2">
              <div className="grid grid-cols-8 gap-2 border-b border-gray-200 pb-2">
                <div className="text-sm font-medium text-gray-600">Time</div>
                {(() => {
                  const weekStart = new Date(currentDate)
                  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1)
                  const weekDays: Date[] = []
                  for (let i = 0; i < 7; i++) {
                    const date = new Date(weekStart)
                    date.setDate(weekStart.getDate() + i)
                    weekDays.push(date)
                  }
                  return weekDays.map((date, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-sm font-medium text-gray-600">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                      </div>
                      <div className="text-xs text-gray-500">{date.getDate()}</div>
                    </div>
                  ))
                })()}
              </div>
              <div className="grid grid-cols-8 gap-2">
                <div className="text-xs text-gray-500 space-y-1">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="h-12 border-b border-gray-100">
                      {i.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                {Array.from({ length: 7 }, (_, colIdx) => (
                  <div key={colIdx} className="space-y-1">
                    {Array.from({ length: 24 }, (_, rowIdx) => (
                      <div
                        key={rowIdx}
                        className="h-12 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-macos"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'day' && (
            <div className="space-y-2">
              <div className="text-center text-sm font-medium text-gray-600 mb-4">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="space-y-1">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-macos"
                  >
                    <div className="w-20 text-sm text-gray-600">
                      {i.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 min-h-[60px]"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'agenda' && (
            <div className="space-y-4">
              <div className="p-4 bg-macos-blue-50 rounded-macos">
                <div className="flex items-start gap-4">
                  <CalendarIcon className="w-5 h-5 text-macos-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Circle Meeting</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        Jan 20, 2024 2:00 PM - 3:00 PM
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        Home
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="w-32">Event</div>
                <div className="flex-1 relative">
                  <div className="flex gap-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="flex-1 text-center border-r border-gray-200">
                        {new Date(currentDate.getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {[
                { name: 'Circle Vacation', start: 2, duration: 2 },
                { name: 'Home Renovation', start: 5, duration: 3 },
                { name: 'Birthday Party', start: 8, duration: 1 },
              ].map((event, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-900">{event.name}</div>
                  <div className="flex-1 relative h-8 bg-gray-100 rounded-macos">
                    <div
                      className="absolute h-full bg-macos-blue-500 rounded-macos flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        left: `${(event.start / 12) * 100}%`,
                        width: `${(event.duration / 12) * 100}%`,
                      }}
                    >
                      {event.duration} month{event.duration > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Templates</h2>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-macos hover:bg-gray-100 cursor-pointer transition-macos">
              <p className="font-medium text-gray-900">Weekly Circle Meeting</p>
              <p className="text-sm text-gray-600">Recurring every Monday</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-macos hover:bg-gray-100 cursor-pointer transition-macos">
              <p className="font-medium text-gray-900">Birthday Celebration</p>
              <p className="text-sm text-gray-600">Annual event template</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Zones</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-macos">
              <span className="text-sm font-medium text-gray-900">UTC-5 (EST)</span>
              <span className="text-xs text-gray-500">Primary</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-macos">
              <span className="text-sm font-medium text-gray-900">UTC+0 (GMT)</span>
              <Button variant="ghost" size="sm">Add</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


