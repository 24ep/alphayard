import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; circleId: string } }
) {
  try {
    const appId = params.id
    const circleId = params.circleId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(circleId)) {
      return NextResponse.json({ error: 'Invalid application or circle ID format' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    const role = typeof body.role === 'string' && body.role.trim() ? body.role.trim() : 'owner'
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 })
    }

    const circle = await prisma.circle.findFirst({
      where: { id: circleId, applicationId: appId },
      select: { id: true },
    })
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.circleOwner.upsert({
        where: { circleId_userId: { circleId, userId } },
        update: { role },
        create: { circleId, userId, role },
      })

      await tx.circleMember.upsert({
        where: { circleId_userId: { circleId, userId } },
        update: { role: 'owner', isInherited: false, sourceCircleId: null },
        create: { circleId, userId, role: 'owner', isInherited: false, sourceCircleId: null },
      })
    })

    const owners = await prisma.circleOwner.findMany({
      where: { circleId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ owners })
  } catch (error) {
    console.error('Failed to assign circle owner:', error)
    return NextResponse.json({ error: 'Failed to assign circle owner' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; circleId: string } }
) {
  try {
    const appId = params.id
    const circleId = params.circleId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(circleId)) {
      return NextResponse.json({ error: 'Invalid application or circle ID format' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 })
    }

    await prisma.circleOwner.deleteMany({
      where: { circleId, userId, circle: { applicationId: appId } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove circle owner:', error)
    return NextResponse.json({ error: 'Failed to remove circle owner' }, { status: 500 })
  }
}
