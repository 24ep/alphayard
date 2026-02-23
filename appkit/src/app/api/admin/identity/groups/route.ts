// User Groups Management - Complete implementation with database integration
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    
    let whereClause: any = {}
    if (applicationId) {
      whereClause.applicationId = applicationId
    }
    
    let groups = await prisma.userGroup.findMany({
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
        addedBy: member.addedBy,
        user: member.user,
        addedAt: member.createdAt
      }))
    }))
    
    return NextResponse.json({
      success: true,
      groups: formattedGroups,
      total: formattedGroups.length,
      message: 'User groups retrieved successfully'
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
    const body = await request.json()
    const { name, slug, description, permissions, color, icon, applicationId, isDefault = false } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }
    
    // Generate slug if not provided
    const groupSlug = slug || name.toLowerCase().replace(/\s+/g, '-')
    
    // Check if group already exists
    const existingGroup = await prisma.userGroup.findFirst({
      where: {
        OR: [
          { name },
          { slug: groupSlug },
          ...(applicationId && { applicationId })
        ]
      }
    })
    
    if (existingGroup) {
      return NextResponse.json(
        { error: 'Group with this name already exists' },
        { status: 409 }
      )
    }
    
    // Create new group
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
        applicationId: applicationId || null,
        metadata: {
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        }
      }
    })
    
    console.log(`🔐 Group Created: ${newGroup.name}`, {
      groupId: newGroup.id,
      applicationId: newGroup.applicationId
    })
    
    return NextResponse.json({
      success: true,
      group: {
        id: newGroup.id,
        name: newGroup.name,
        slug: newGroup.slug,
        description: newGroup.description,
        isSystem: newGroup.isSystem,
        isDefault: newGroup.isDefault,
        permissions: Array.isArray(newGroup.permissions) ? newGroup.permissions : [],
        userCount: 0,
        color: newGroup.color,
        icon: newGroup.icon,
        applicationId: newGroup.applicationId,
        metadata: newGroup.metadata || {},
        createdAt: newGroup.createdAt,
        updatedAt: newGroup.updatedAt,
        members: []
      },
      message: 'User group created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create user group:', error)
    return NextResponse.json(
      { error: 'Failed to create user group' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, description, permissions, color, icon, isDefault } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      )
    }
    
    // Check if group exists
    const existingGroup = await prisma.userGroup.findUnique({
      where: { id }
    })
    
    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }
    
    // Don't allow modifying system groups
    if (existingGroup.isSystem) {
      return NextResponse.json(
        { error: 'Cannot modify system groups' },
        { status: 403 }
      )
    }
    
    // Check for duplicate name/slug if changing
    if (name || slug) {
      const duplicateCheck = await prisma.userGroup.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(name ? [{ name }] : []),
                ...(slug ? [{ slug }] : [])
              ]
            }
          ]
        }
      })
      
      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Group with this name or slug already exists' },
          { status: 409 }
        )
      }
    }
    
    // Update group
    const updatedGroup = await prisma.userGroup.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions }),
        ...(color && { color }),
        ...(icon && { icon }),
        ...(isDefault !== undefined && { isDefault }),
        updatedAt: new Date()
      }
    })
    
    console.log(`🔐 Group Updated: ${updatedGroup.name}`, {
      groupId: updatedGroup.id
    })
    
    return NextResponse.json({
      success: true,
      group: {
        id: updatedGroup.id,
        name: updatedGroup.name,
        slug: updatedGroup.slug,
        description: updatedGroup.description,
        isSystem: updatedGroup.isSystem,
        isDefault: updatedGroup.isDefault,
        permissions: Array.isArray(updatedGroup.permissions) ? updatedGroup.permissions : [],
        userCount: 0, // Would need to recalculate
        color: updatedGroup.color,
        icon: updatedGroup.icon,
        applicationId: updatedGroup.applicationId,
        metadata: updatedGroup.metadata || {},
        createdAt: updatedGroup.createdAt,
        updatedAt: updatedGroup.updatedAt
      },
      message: 'User group updated successfully'
    })
  } catch (error) {
    console.error('Failed to update user group:', error)
    return NextResponse.json(
      { error: 'Failed to update user group' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('id')
    
    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      )
    }
    
    // Check if group exists
    const existingGroup = await prisma.userGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: { id: true }
        }
      }
    })
    
    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }
    
    // Don't allow deleting system groups
    if (existingGroup.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system groups' },
        { status: 403 }
      )
    }
    
    // Check if group has users
    if (existingGroup.members.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete group with assigned users',
          details: `Group has ${existingGroup.members.length} assigned users`
        },
        { status: 400 }
      )
    }
    
    // Delete group
    await prisma.userGroup.delete({
      where: { id: groupId }
    })
    
    console.log(`🔐 Group Deleted: ${existingGroup.name}`, {
      groupId
    })
    
    return NextResponse.json({
      success: true,
      message: 'User group deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete user group:', error)
    return NextResponse.json(
      { error: 'Failed to delete user group' },
      { status: 500 }
    )
  }
}
