import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

// GET /api/v1/admin/dashboard - Get dashboard statistics
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
      sessionCount,
      auditCount,
      recentLogins
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.application.count({ where: { isActive: true } }),
      prisma.adminUser.count({ where: { isActive: true } }),
      prisma.userSession.count({ where: { isActive: true } }),
      prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.user.count({ 
        where: { 
          lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          isActive: true 
        } 
      })
    ])

    // Get recent activity
    const recentActivity = await prisma.auditLog.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        createdAt: true,
        userId: true
      }
    })

    return NextResponse.json({
      stats: {
        users: userCount,
        applications: applicationCount,
        admins: adminCount,
        activeSessions: sessionCount,
        auditLogs24h: auditCount,
        recentLogins24h: recentLogins
      },
      recentActivity,
      admin: {
        id: auth.admin.id,
        email: auth.admin.email,
        isSuperAdmin: auth.admin.isSuperAdmin
      }
    })

  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
