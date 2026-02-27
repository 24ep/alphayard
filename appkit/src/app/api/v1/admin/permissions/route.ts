// Permissions System - Local implementation with database integration and security checks
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { authenticate, hasPermission } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    // if (!hasPermission(auth.admin, 'permissions:view')) {
    //   return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    // }

    const { searchParams } = new URL(request.url)
    const module = searchParams.get('module')
    
    // Get all permissions from user_groups (acting as roles)
    const allRoles = await prisma.userGroup.findMany({
      select: {
        permissions: true
      }
    })
    
    // Extract and deduplicate all permissions
    const allPermissions = new Set<string>()
    const permissionsByModule = {} as Record<string, any[]>
    
    allRoles.forEach(role => {
      const permissions = Array.isArray(role.permissions) ? role.permissions : []
      permissions.forEach((perm: any) => {
        if (typeof perm === 'string') {
          allPermissions.add(perm)
          
          if (perm === '*') {
            // Super admin permission
            if (!permissionsByModule['*']) {
              permissionsByModule['*'] = []
            }
            if (!permissionsByModule['*'].some(p => p.id === '*')) {
              permissionsByModule['*'].push({
                id: perm,
                module: '*',
                action: 'all',
                description: 'Full system access'
              })
            }
          } else if (perm.includes(':')) {
            const [mod, action] = perm.split(':')
            if (!permissionsByModule[mod]) {
              permissionsByModule[mod] = []
            }
            if (!permissionsByModule[mod].some(p => p.id === perm)) {
              permissionsByModule[mod].push({
                id: perm,
                module: mod,
                action: action,
                description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${mod.charAt(0).toUpperCase() + mod.slice(1)}`
              })
            }
          }
        }
      })
    })

    if (module && permissionsByModule[module]) {
      return NextResponse.json({
        success: true,
        permissions: permissionsByModule[module],
        module: module,
        message: `Permissions for module '${module}' retrieved successfully`
      })
    }
    
    // Convert to flat array format as requested by frontend
    const formattedPermissions = Object.entries(permissionsByModule).flatMap(([module, perms]) => 
      perms.map((perm: any) => ({
        id: perm.id,
        module: perm.module,
        action: perm.action,
        description: perm.description
      }))
    )
    
    return NextResponse.json({
      success: true,
      permissions: formattedPermissions,
      modules: Object.keys(permissionsByModule),
      message: 'All permissions retrieved successfully'
    })
  } catch (error) {
    console.error('Failed to get permissions:', error)
    return NextResponse.json(
      { error: 'Failed to get permissions' },
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

    if (!auth.admin.isSuperAdmin) {
      return NextResponse.json({ error: 'Only superadmins can create permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { module, action, description } = body
    
    if (!module || !action) {
      return NextResponse.json(
        { error: 'Module and action are required' },
        { status: 400 }
      )
    }
    
    const permissionId = `${module}:${action}`
    
    // Add permission to all roles that have '*' permission
    const superAdminRoles = await prisma.userGroup.findMany({
      where: {
        permissions: {
          path: ['*'],
          string_contains: '*'
        }
      }
    })
    
    // Update all super admin roles to include the new permission if not already there
    for (const role of superAdminRoles) {
      const perms = Array.isArray(role.permissions) ? role.permissions : []
      if (!perms.includes(permissionId)) {
        await prisma.userGroup.update({
          where: { id: role.id },
          data: {
            permissions: {
              push: permissionId
            }
          }
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      permission: {
        id: permissionId,
        module,
        action,
        description: description || `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.charAt(0).toUpperCase() + module.slice(1)}`
      },
      message: 'Permission created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create permission:', error)
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    )
  }
}
