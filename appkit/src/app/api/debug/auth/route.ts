import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/server/config/env'
import { prisma } from '@/server/lib/prisma'

// GET /api/debug/auth - Debug authentication status
export async function GET(request: NextRequest) {
  try {
    const debug = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
        JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
        JWT_SECRET_PLACEHOLDER: config.JWT_SECRET === 'placeholder-jwt-secret-at-least-32-characters-long'
      },
      database: {
        connected: false,
        adminUsers: 0,
        adminEmails: [] as Array<{email: string, active: boolean, superAdmin: boolean}>,
        error: undefined as string | undefined
      }
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      debug.database.connected = true
      
      // Count admin users
      const adminCount = await prisma.adminUser.count()
      debug.database.adminUsers = adminCount
      
      // Get admin emails (without passwords)
      const admins = await prisma.adminUser.findMany({
        select: { id: true, email: true, isActive: true, isSuperAdmin: true }
      })
      debug.database.adminEmails = admins.map(a => ({ email: a.email, active: a.isActive, superAdmin: a.isSuperAdmin }))
      
    } catch (dbError) {
      debug.database.connected = false
      debug.database.error = dbError instanceof Error ? dbError.message : 'Database connection failed'
    }

    return NextResponse.json(debug)

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      message: error.message 
    }, { status: 500 })
  }
}
