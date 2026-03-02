import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getCircleAncestors(circleId: string) {
  const ancestors: string[] = []
  let cursor = await prisma.circle.findUnique({
    where: { id: circleId },
    select: { parentId: true },
  })
  let safety = 0
  while (cursor?.parentId && safety < 50) {
    ancestors.push(cursor.parentId)
    cursor = await prisma.circle.findUnique({
      where: { id: cursor.parentId },
      select: { parentId: true },
    })
    safety += 1
  }
  return ancestors
}

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
    const role = typeof body.role === 'string' && body.role.trim() ? body.role.trim() : 'member'
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 })
    }

    const [app, circle, user] = await Promise.all([
      prisma.application.findUnique({ where: { id: appId }, select: { id: true } }),
      prisma.circle.findFirst({ where: { id: circleId, applicationId: appId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    ])
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const ancestors = await getCircleAncestors(circleId)

    await prisma.$transaction(async (tx) => {
      await tx.circleMember.upsert({
        where: { circleId_userId: { circleId, userId } },
        update: { role, isInherited: false, sourceCircleId: null },
        create: { circleId, userId, role, isInherited: false, sourceCircleId: null },
      })

      for (const ancestorId of ancestors) {
        await tx.circleMember.upsert({
          where: { circleId_userId: { circleId: ancestorId, userId } },
          update: { isInherited: true, sourceCircleId: circleId },
          create: {
            circleId: ancestorId,
            userId,
            role: 'member',
            isInherited: true,
            sourceCircleId: circleId,
          },
        })
      }
    })

    const memberships = await prisma.circleMember.findMany({
      where: {
        userId,
        circle: { applicationId: appId },
      },
      include: {
        circle: { select: { id: true, name: true, parentId: true, circleType: true } },
      },
      orderBy: { joinedAt: 'desc' },
    })

    return NextResponse.json({ memberships })
  } catch (error) {
    console.error('Failed to assign circle membership:', error)
    return NextResponse.json({ error: 'Failed to assign circle membership' }, { status: 500 })
  }
}
