import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

// GET /api/v1/admin/preferences - Get admin preferences
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const adminId = auth.admin.adminId || auth.admin.id

    // Get admin preferences
    const preferences = await prisma.adminUserPreference.findMany({
      where: { userId: adminId }
    })

    // Convert to key-value format
    const prefsObj: any = {}
    preferences.forEach(pref => {
      prefsObj[pref.preferenceKey] = pref.preferenceValue
    })

    // Return default preferences if none exist
    const defaultPreferences = {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      dashboard: {
        layout: 'grid',
        widgets: ['users', 'applications', 'analytics']
      }
    }

    return NextResponse.json({ 
      preferences: Object.keys(prefsObj).length > 0 ? prefsObj : defaultPreferences 
    })

  } catch (error: any) {
    console.error('Get preferences error:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// PUT /api/v1/admin/preferences - Update admin preferences
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const adminId = auth.admin.adminId || auth.admin.id
    const { preferences } = await request.json()

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences are required' }, { status: 400 })
    }

    // Delete existing preferences and create new ones
    await prisma.adminUserPreference.deleteMany({
      where: { userId: adminId }
    })

    // Create new preferences
    const prefsData = Object.entries(preferences).map(([key, value]) => ({
      userId: adminId,
      preferenceKey: key,
      preferenceValue: value as any
    }))

    await prisma.adminUserPreference.createMany({
      data: prefsData
    })

    return NextResponse.json({ preferences })

  } catch (error: any) {
    console.error('Update preferences error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
