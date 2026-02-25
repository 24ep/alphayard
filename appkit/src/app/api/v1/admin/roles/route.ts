// Roles Management - Local implementation with database integration and security checks
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { authenticate, hasPermission } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'roles:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeSystem = searchParams.get('includeSystem') !== 'false'
    const applicationId = searchParams.get('applicationId')
    
    let whereClause: any = {}
    if (applicationId) {
      whereClause.applicationId = applicationId
    }
    
    let roles = await prisma.userGroup.findMany({
      where: whereClause,
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' }
      ],
      include: {
        members: {
          select: { id: true }
        },
        application: {
          select: { id: true, name: true }
        }
      }
    })
    
    if (!includeSystem) {
      roles = roles.filter(role => !role.isSystem)
    }
    
    // Format response
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      isSystem: role.isSystem,
      isDefault: role.isDefault,
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
      userCount: role.members.length,
      color: role.color,
      icon: role.icon,
      applicationId: role.applicationId,
      applicationName: role.application?.name,
      metadata: role.metadata || {},
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }))
    
    return NextResponse.json({
      success: true,
      roles: formattedRoles,
      total: formattedRoles.length,
      message: 'Roles retrieved successfully'
    })
  } catch (error) {
    console.error('Failed to get roles:', error)
    return NextResponse.json(
      { error: 'Failed to get roles' },
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

    if (!hasPermission(auth.admin, 'roles:edit')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, permissions, color, icon, applicationId, isDefault = false } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      )
    }
    
    // Generate slug if not provided
    const roleSlug = slug || name.toLowerCase().replace(/\s+/g, '-')
    
    // Check if role already exists
    const existingRole = await prisma.userGroup.findFirst({
      where: {
        OR: [
          { name },
          { slug: roleSlug }
        ],
        ...(applicationId ? { applicationId } : {})
      }
    })
    
    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name or slug already exists' },
        { status: 409 }
      )
    }
    
    // Create new role
    const newRole = await prisma.userGroup.create({
      data: {
        name,
        slug: roleSlug,
        description: description || '',
        permissions: permissions || [],
        isSystem: false,
        isDefault: isDefault,
        color: color || '#64748b',
        icon: icon || 'users',
        applicationId: applicationId || null,
        metadata: {
          createdBy: auth.admin.email,
          createdAt: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      role: {
        id: newRole.id,
        name: newRole.name,
        slug: newRole.slug,
        description: newRole.description,
        isSystem: newRole.isSystem,
        isDefault: newRole.isDefault,
        permissions: Array.isArray(newRole.permissions) ? newRole.permissions : [],
        userCount: 0,
        color: newRole.color,
        icon: newRole.icon,
        applicationId: newRole.applicationId,
        metadata: newRole.metadata || {},
        createdAt: newRole.createdAt,
        updatedAt: newRole.updatedAt
      },
      message: 'Role created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'roles:edit')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, slug, description, permissions, color, icon, isDefault } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      )
    }
    
    // Check if role exists
    const existingRole = await prisma.userGroup.findUnique({
      where: { id }
    })
    
    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }
    
    // Don't allow modifying system roles for non-superadmins
    if (existingRole.isSystem && !auth.admin.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only superadmins can modify system roles' },
        { status: 403 }
      )
    }
    
    // Update role
    const updatedRole = await prisma.userGroup.update({
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
    
    return NextResponse.json({
      success: true,
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        slug: updatedRole.slug,
        description: updatedRole.description,
        isSystem: updatedRole.isSystem,
        isDefault: updatedRole.isDefault,
        permissions: Array.isArray(updatedRole.permissions) ? updatedRole.permissions : [],
        userCount: 0,
        color: updatedRole.color,
        icon: updatedRole.icon,
        applicationId: updatedRole.applicationId,
        metadata: updatedRole.metadata || {},
        createdAt: updatedRole.createdAt,
        updatedAt: updatedRole.updatedAt
      },
      message: 'Role updated successfully'
    })
  } catch (error) {
    console.error('Failed to update role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'roles:edit')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get('id')
    
    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      )
    }
    
    // Check if role exists
    const existingRole = await prisma.userGroup.findUnique({
      where: { id: roleId },
      include: {
        members: {
          select: { id: true }
        }
      }
    })
    
    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }
    
    // Don't allow deleting system roles
    if (existingRole.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      )
    }
    
    // Check if role has users
    if (existingRole.members.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete role with assigned users',
          details: `Role has ${existingRole.members.length} assigned users`
        },
        { status: 400 }
      )
    }
    
    // Delete role
    await prisma.userGroup.delete({
      where: { id: roleId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete role:', error)
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}
