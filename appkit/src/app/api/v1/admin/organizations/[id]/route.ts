import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function getAdminOrgIds(adminId: string): Promise<string[]> {
  const memberships = await prisma.adminUserApplication.findMany({
    where: { adminUserId: adminId },
    select: { applicationId: true },
  })
  return memberships.map(m => m.applicationId)
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const org = await prisma.application.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, slug: true, description: true, isActive: true, createdAt: true },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Non-superadmins can only view their own orgs
    if (!auth.admin.isSuperAdmin) {
      const orgIds = await getAdminOrgIds(auth.admin.adminId || auth.admin.id)
      if (!orgIds.includes(params.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json({ organization: org })
  } catch (error: any) {
    console.error('[organizations GET/:id]', error)
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    // Only members (with owner/admin role) or superadmins can update
    if (!auth.admin.isSuperAdmin) {
      const membership = await prisma.adminUserApplication.findFirst({
        where: {
          adminUserId: auth.admin.adminId || auth.admin.id,
          applicationId: params.id,
          role: { in: ['owner', 'admin'] },
        },
      })
      if (!membership) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { name, slug: rawSlug, description } = body

    const updateData: Record<string, any> = {}

    if (name !== undefined) {
      if (!name.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      updateData.name = name.trim()
    }

    if (rawSlug !== undefined) {
      const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/(^-|-$)/g, '')
      if (!slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })

      const conflict = await prisma.application.findFirst({ where: { slug, NOT: { id: params.id } } })
      if (conflict) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })

      updateData.slug = slug
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, slug: true, description: true, isActive: true },
    })

    return NextResponse.json({ organization: updated })
  } catch (error: any) {
    console.error('[organizations PATCH/:id]', error)
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}
