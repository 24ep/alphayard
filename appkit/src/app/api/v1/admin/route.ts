import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

// POST /api/v1/admin/impersonate
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'admin-users:manage')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In a real implementation, you'd store impersonation in session or token
    // For now, return the user info for frontend to handle
    return NextResponse.json({ 
      message: 'Impersonation started', 
      userId,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim()
      }
    })

  } catch (error: any) {
    console.error('Impersonate error', error)
    return NextResponse.json({ error: 'Failed to impersonate' }, { status: 500 })
  }
}

// GET /api/v1/admin - Admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    // Get dashboard statistics
    const [
      userCount,
      applicationCount,
      adminCount,
      sessionCount
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.application.count({ where: { isActive: true } }),
      prisma.adminUser.count({ where: { isActive: true } }),
      prisma.userSession.count({ where: { isActive: true } })
    ])

    return NextResponse.json({
      stats: {
        users: userCount,
        applications: applicationCount,
        admins: adminCount,
        activeSessions: sessionCount
      },
      admin: {
        id: auth.admin.id,
        email: auth.admin.email,
        isSuperAdmin: auth.admin.isSuperAdmin
      }
    })

  } catch (error: any) {
    console.error('Admin dashboard error', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
