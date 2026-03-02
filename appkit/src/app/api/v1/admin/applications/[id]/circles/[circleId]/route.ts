import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ALLOWED_CIRCLE_TYPES = new Set([
  'organization',
  'department',
  'team',
  'family',
  'household',
  'friend-group',
  'custom',
])

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; circleId: string } }
) {
  try {
    const appId = params.id
    const circleId = params.circleId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(circleId)) {
      return NextResponse.json({ error: 'Invalid application or circle ID format' }, { status: 400 })
    }

    const circle = await prisma.circle.findFirst({
      where: { id: circleId, applicationId: appId },
      include: {
        parent: { select: { id: true, name: true, circleType: true } },
        children: { select: { id: true, name: true, circleType: true, parentId: true } },
        members: {
          orderBy: { joinedAt: 'desc' },
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        },
        owners: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        },
        billingAssignees: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        },
      },
    })
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })

    return NextResponse.json({ circle })
  } catch (error) {
    console.error('Failed to fetch circle detail:', error)
    return NextResponse.json({ error: 'Failed to fetch circle detail' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; circleId: string } }
) {
  try {
    const appId = params.id
    const circleId = params.circleId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(circleId)) {
      return NextResponse.json({ error: 'Invalid application or circle ID format' }, { status: 400 })
    }

    const circle = await prisma.circle.findFirst({
      where: { id: circleId, applicationId: appId },
      select: { id: true, parentId: true },
    })
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : undefined
    const description = typeof body.description === 'string' ? body.description.trim() : undefined
    const nextParentId =
      body.parentId === null
        ? null
        : typeof body.parentId === 'string' && UUID_REGEX.test(body.parentId)
          ? body.parentId
          : undefined
    const typeRaw = typeof body.circleType === 'string' ? body.circleType.trim().toLowerCase() : undefined
    const circleType = typeRaw && ALLOWED_CIRCLE_TYPES.has(typeRaw) ? typeRaw : undefined

    if (nextParentId === circleId) {
      return NextResponse.json({ error: 'Circle cannot be parent of itself' }, { status: 400 })
    }

    if (typeof nextParentId === 'string') {
      const parent = await prisma.circle.findFirst({
        where: { id: nextParentId, applicationId: appId },
        select: { id: true },
      })
      if (!parent) {
        return NextResponse.json({ error: 'Parent circle not found in this application' }, { status: 400 })
      }
    }

    const updated = await prisma.circle.update({
      where: { id: circleId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(nextParentId !== undefined ? { parentId: nextParentId } : {}),
        ...(circleType !== undefined ? { circleType } : {}),
      },
    })

    return NextResponse.json({ circle: updated })
  } catch (error) {
    console.error('Failed to update circle:', error)
    return NextResponse.json({ error: 'Failed to update circle' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; circleId: string } }
) {
  try {
    const appId = params.id
    const circleId = params.circleId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(circleId)) {
      return NextResponse.json({ error: 'Invalid application or circle ID format' }, { status: 400 })
    }

    const circle = await prisma.circle.findFirst({
      where: { id: circleId, applicationId: appId },
      select: { id: true },
    })
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })

    await prisma.circle.delete({ where: { id: circleId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete circle:', error)
    return NextResponse.json({ error: 'Failed to delete circle' }, { status: 500 })
  }
}
