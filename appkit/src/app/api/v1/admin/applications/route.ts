import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }
    
    // Check permission (optional, depending on requirements, but config checks 'applications:view')
    // if (!hasPermission(auth.admin, 'applications:view')) {
    //   return NextResponse.json({ error: 'Permission denied', userRoles: auth.admin }, { status: 403 })
    // }

    // Fetch applications
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { userApplications: true }
        }
      }
    })

    const formattedApps = applications.map(app => ({
      id: app.id,
      name: app.name,
      description: app.description || 'No description provided.',
      status: app.isActive ? 'active' : 'inactive',
      users: app._count.userApplications,
      createdAt: app.createdAt.toISOString(),
      lastModified: app.updatedAt.toISOString(),
      plan: 'free',
      domain: app.slug ? `${app.slug}.appkit.com` : undefined
    }))

    return NextResponse.json({ applications: formattedApps })
  } catch (error: any) {
    console.error('GET applications error:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
