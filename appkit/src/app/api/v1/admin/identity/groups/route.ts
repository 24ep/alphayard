// User Groups Management - Local implementation with database integration and security checks
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { authenticate, hasPermission } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'users:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    
    let whereClause: any = {}
    if (applicationId) {
      whereClause.applicationId = applicationId
    }
    
    const groups = await prisma.userGroup.findMany({
      where: whereClause,
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' }
      ],
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        application: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
    
    // Format response
    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      isSystem: group.isSystem,
      isDefault: group.isDefault,
      permissions: Array.isArray(group.permissions) ? group.permissions : [],
      userCount: group.members.length,
      color: group.color,
      icon: group.icon,
      applicationId: group.applicationId,
      applicationName: group.application?.name,
      metadata: group.metadata || {},
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: group.members.map(member => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        user: member.user,
        addedAt: member.createdAt
      }))
    }))
    
    return NextResponse.json({
      success: true,
      groups: formattedGroups,
      total: formattedGroups.length
    })
  } catch (error) {
    console.error('Failed to get user groups:', error)
    return NextResponse.json(
      { error: 'Failed to get user groups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'users:edit')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, permissions, color, icon, applicationId, isDefault = false } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }
    
    const groupSlug = slug || name.toLowerCase().replace(/\s+/g, '-')
    
    const newGroup = await prisma.userGroup.create({
      data: {
        name,
        slug: groupSlug,
        description: description || '',
        permissions: permissions || [],
        isSystem: false,
        isDefault: isDefault,
        color: color || '#64748b',
        icon: icon || 'users',
        applicationId: applicationId || null
      }
    })
    
    return NextResponse.json({
      success: true,
      group: newGroup,
      message: 'Group created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}
