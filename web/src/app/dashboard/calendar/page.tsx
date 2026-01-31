'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  location?: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CALENDAR.EVENTS)
      setEvents(response.data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your Circle events</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/calendar/advanced'}>
            View Advanced
          </Button>
          <Button variant="primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
              {(() => {
                const year = selectedDate.getFullYear()
                const month = selectedDate.getMonth()
                const firstDay = new Date(year, month, 1)
                const lastDay = new Date(year, month + 1, 0)
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
                  const dayEvents = events.filter((event) => {
                    const eventDate = new Date(event.start_date)
                    return eventDate.toDateString() === date.toDateString()
                  })
                  return (
                    <div
                      key={idx}
                      className={`min-h-[80px] p-1 border border-gray-200 rounded-macos cursor-pointer hover:bg-gray-50 transition-macos ${
                        !isCurrentMonth ? 'bg-gray-50 opacity-50' : ''
                      } ${isToday ? 'ring-2 ring-macos-blue-500' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-xs font-medium mb-1 ${
                        isToday ? 'text-macos-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs px-1 py-0.5 bg-macos-blue-100 text-macos-blue-700 rounded mb-1 truncate"
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-sm">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="p-3 bg-macos-blue-50 rounded-macos">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.start_date).toLocaleTimeString()} - {new Date(event.end_date).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}


