import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { authenticate } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, description } = body

    const updatedGroup = await prisma.adminGroup.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, group: updatedGroup })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Group name already exists' }, { status: 400 })
    }
    console.error('Failed to update admin group:', error)
    return NextResponse.json({ error: 'Failed to update admin group' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const { id } = params
    
    // Check if group is empty before deleting
    const count = await prisma.adminUser.count({ where: { groupId: id } })
    if (count > 0) {
      return NextResponse.json({ error: 'Cannot delete group with assigned users' }, { status: 400 })
    }

    await prisma.adminGroup.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Admin group deleted successfully' })
  } catch (error: any) {
    console.error('Failed to delete admin group:', error)
    return NextResponse.json({ error: 'Failed to delete admin group' }, { status: 500 })
  }
}
