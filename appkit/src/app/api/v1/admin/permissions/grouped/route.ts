// Permissions Grouped System - Local implementation
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { authenticate, hasPermission } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'permissions:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get all permissions from user_groups
    const allRoles = await prisma.userGroup.findMany({
      select: {
        permissions: true
      }
    })
    
    const permissionsByModule = {} as Record<string, any[]>
    
    allRoles.forEach(role => {
      const permissions = Array.isArray(role.permissions) ? role.permissions : []
      permissions.forEach((perm: any) => {
        if (typeof perm === 'string') {
          if (perm === '*') {
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

    return NextResponse.json({
      success: true,
      data: permissionsByModule,
      message: 'Grouped permissions retrieved successfully'
    })
  } catch (error) {
    console.error('Failed to get grouped permissions:', error)
    return NextResponse.json(
      { error: 'Failed to get grouped permissions' },
      { status: 500 }
    )
  }
}
