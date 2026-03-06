import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { authenticate } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const adminGroups = await prisma.adminGroup.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { adminUsers: true }
        }
      }
    })

    return NextResponse.json({ success: true, groups: adminGroups })
  } catch (error: any) {
    console.error('Failed to fetch admin groups:', error)
    return NextResponse.json({ error: 'Failed to fetch admin groups' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const newGroup = await prisma.adminGroup.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json({ success: true, group: newGroup })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Group name already exists' }, { status: 400 })
    }
    console.error('Failed to create admin group:', error)
    return NextResponse.json({ error: 'Failed to create admin group' }, { status: 500 })
  }
}
