import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    // Get full admin user details
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: auth.admin.id },
      include: {
        role: true,
        adminUserApplications: {
          include: { 
            application: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role?.name,
      isSuperAdmin: adminUser.isSuperAdmin,
      avatarUrl: adminUser.avatarUrl,
      permissions: auth.admin.permissions,
      applications: adminUser.adminUserApplications.map((aua: any) => ({
        id: aua.application.id,
        name: aua.application.name,
        slug: aua.application.slug,
        role: aua.role,
        isPrimary: aua.isPrimary
      })),
      lastLoginAt: adminUser.lastLoginAt
    })

  } catch (error: any) {
    console.error('Admin me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
