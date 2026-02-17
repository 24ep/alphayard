import { NextRequest, NextResponse } from 'next/server'

// Mock database for analytics data (in production, this would be a real database)
const analyticsData = {
  pageViews: [
    { date: '2024-02-10', views: 1250, unique: 980 },
    { date: '2024-02-11', views: 1380, unique: 1050 },
    { date: '2024-02-12', views: 1420, unique: 1120 },
    { date: '2024-02-13', views: 1560, unique: 1280 },
    { date: '2024-02-14', views: 1680, unique: 1350 },
    { date: '2024-02-15', views: 1820, unique: 1480 },
    { date: '2024-02-16', views: 1950, unique: 1580 },
    { date: '2024-02-17', views: 2100, unique: 1720 }
  ],
  userSessions: [
    { date: '2024-02-10', sessions: 450, avgDuration: 320 },
    { date: '2024-02-11', sessions: 480, avgDuration: 340 },
    { date: '2024-02-12', sessions: 520, avgDuration: 355 },
    { date: '2024-02-13', sessions: 580, avgDuration: 370 },
    { date: '2024-02-14', sessions: 620, avgDuration: 385 },
    { date: '2024-02-15', sessions: 680, avgDuration: 400 },
    { date: '2024-02-16', sessions: 720, avgDuration: 415 },
    { date: '2024-02-17', sessions: 780, avgDuration: 430 }
  ],
  conversions: [
    { date: '2024-02-10', rate: 3.2, total: 40 },
    { date: '2024-02-11', rate: 3.5, total: 48 },
    { date: '2024-02-12', rate: 3.8, total: 54 },
    { date: '2024-02-13', rate: 4.1, total: 64 },
    { date: '2024-02-14', rate: 4.3, total: 72 },
    { date: '2024-02-15', rate: 4.6, total: 83 },
    { date: '2024-02-16', rate: 4.8, total: 94 },
    { date: '2024-02-17', rate: 5.1, total: 108 }
  ],
  deviceBreakdown: {
    mobile: 45.2,
    tablet: 18.7,
    desktop: 36.1
  },
  topPages: [
    { path: '/login', views: 3420, bounceRate: 32.4 },
    { path: '/signup', views: 2150, bounceRate: 28.7 },
    { path: '/dashboard', views: 1890, bounceRate: 15.2 },
    { path: '/profile', views: 1230, bounceRate: 22.8 },
    { path: '/settings', views: 890, bounceRate: 41.3 }
  ]
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const metric = searchParams.get('metric')
  const timeRange = searchParams.get('timeRange') || '7d'
  const device = searchParams.get('device')

  try {
    // Calculate date range based on timeRange
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    let data = {}

    switch (metric) {
      case 'pageViews':
        data = analyticsData.pageViews.slice(-days)
        break
      case 'userSessions':
        data = analyticsData.userSessions.slice(-days)
        break
      case 'conversions':
        data = analyticsData.conversions.slice(-days)
        break
      case 'deviceBreakdown':
        data = analyticsData.deviceBreakdown
        break
      case 'topPages':
        data = analyticsData.topPages
        break
      default:
        // Return all metrics
        data = {
          pageViews: analyticsData.pageViews.slice(-days),
          userSessions: analyticsData.userSessions.slice(-days),
          conversions: analyticsData.conversions.slice(-days),
          deviceBreakdown: analyticsData.deviceBreakdown,
          topPages: analyticsData.topPages,
          summary: {
            totalPageViews: analyticsData.pageViews.slice(-days).reduce((sum, item) => sum + item.views, 0),
            totalSessions: analyticsData.userSessions.slice(-days).reduce((sum, item) => sum + item.sessions, 0),
            avgConversionRate: analyticsData.conversions.slice(-days).reduce((sum, item) => sum + item.rate, 0) / Math.min(days, analyticsData.conversions.length),
            avgSessionDuration: analyticsData.userSessions.slice(-days).reduce((sum, item) => sum + item.avgDuration, 0) / Math.min(days, analyticsData.userSessions.length)
          }
        }
    }

    return NextResponse.json({
      success: true,
      data,
      timeRange,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data, timestamp } = body

    // In a real implementation, this would store the event in a database
    console.log('Analytics Event:', { event, data, timestamp })

    // Simulate processing the event
    await new Promise(resolve => setTimeout(resolve, 100))

    return NextResponse.json({
      success: true,
      message: 'Event recorded successfully',
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record analytics event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
