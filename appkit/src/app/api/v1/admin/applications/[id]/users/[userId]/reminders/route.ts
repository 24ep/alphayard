import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const appId = params.id
    const userId = params.userId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: 'Invalid application ID or user ID format' }, { status: 400 })
    }

    const reminders = await prisma.userReminder.findMany({
      where: { applicationId: appId, userId },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { remindAt: 'asc' },
    })

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error('Failed to fetch user reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch user reminders' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const appId = params.id
    const userId = params.userId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: 'Invalid application ID or user ID format' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const note = typeof body.note === 'string' ? body.note.trim() : null
    const remindAtRaw = typeof body.remindAt === 'string' ? body.remindAt : ''
    const attachments = Array.isArray(body.attachments) ? body.attachments : []
    const remindAt = new Date(remindAtRaw)

    if (!title) {
      return NextResponse.json({ error: 'Reminder title is required' }, { status: 400 })
    }
    if (Number.isNaN(+remindAt)) {
      return NextResponse.json({ error: 'Valid reminder datetime is required' }, { status: 400 })
    }

    const reminder = await prisma.userReminder.create({
      data: {
        applicationId: appId,
        userId,
        title,
        note,
        remindAt,
        attachments,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json({ reminder }, { status: 201 })
  } catch (error) {
    console.error('Failed to create user reminder:', error)
    return NextResponse.json({ error: 'Failed to create user reminder' }, { status: 500 })
  }
}
