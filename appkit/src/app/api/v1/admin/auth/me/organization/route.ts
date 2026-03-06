import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const adminId = auth.admin.adminId || auth.admin.id

    const memberships = await prisma.adminUserApplication.findMany({
      where: { adminUserId: adminId },
      include: {
        application: {
          select: { id: true, name: true, slug: true, description: true, isActive: true, createdAt: true },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    })

    const organizations = memberships.map(m => ({
      id: m.applicationId,
      name: m.application.name,
      slug: m.application.slug,
      description: m.application.description,
      isActive: m.application.isActive,
      createdAt: m.application.createdAt,
      role: m.role,
      isPrimary: m.isPrimary,
    }))

    return NextResponse.json({
      organizations,
      hasOrganization: organizations.length > 0,
    })
  } catch (error: any) {
    console.error('[me/organization] Error:', error)
    return NextResponse.json({ error: 'Failed to get organizations' }, { status: 500 })
  }
}
