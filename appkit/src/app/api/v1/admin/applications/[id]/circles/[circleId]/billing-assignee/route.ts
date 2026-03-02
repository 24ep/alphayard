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
      await tx.circleBillingAssignment.updateMany({
        where: { circleId, isPrimary: true },
        data: { isPrimary: false },
      })

      await tx.circleBillingAssignment.upsert({
        where: { circleId_userId: { circleId, userId } },
        update: { isPrimary: true },
        create: { circleId, userId, isPrimary: true },
      })
    })

    const billingAssignees = await prisma.circleBillingAssignment.findMany({
      where: { circleId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ billingAssignees })
  } catch (error) {
    console.error('Failed to assign circle billing assignee:', error)
    return NextResponse.json({ error: 'Failed to assign billing assignee' }, { status: 500 })
  }
}
