import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { authenticate } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const { id } = params

    // Check admin_users table first
    let user: any = await prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isSuperAdmin: true,
        roleId: true,
        groupId: true,
        loginMethods: true,
        mfaEnabled: true,
        group: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    // Fallback to users table
    if (!user) {
      const dbUser = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          userType: true,
          lastLoginAt: true,
          createdAt: true
        }
      })
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim(),
          isActive: dbUser.isActive,
          isSuperAdmin: dbUser.userType === 'admin',
          roleId: null,
          groupId: null,
          loginMethods: ['password'],
          mfaEnabled: false,
          group: null,
          lastLoginAt: dbUser.lastLoginAt,
          createdAt: dbUser.createdAt
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Look up matching User record by email for SSO info
    const linkedUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        passwordHash: true,
        isVerified: true,
        createdAt: true,
        loginHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            loginMethod: true,
            socialProvider: true,
            success: true,
            ipAddress: true,
            userAgent: true,
            deviceType: true,
            country: true,
            city: true,
            mfaRequired: true,
            mfaSuccess: true,
            createdAt: true,
          },
        },
      },
    })

    const ssoProviders = linkedUser
      ? [...new Set(
          linkedUser.loginHistory
            .filter(l => l.socialProvider)
            .map(l => l.socialProvider as string)
        )]
      : []

    const ssoInfo = {
      linkedUserId: linkedUser?.id ?? null,
      hasPassword: !!linkedUser?.passwordHash,
      isVerified: linkedUser?.isVerified ?? false,
      ssoProviders,
      loginHistory: linkedUser?.loginHistory ?? [],
    }

    // Format for frontend
    const nameParts = user.name ? user.name.split(' ') : ['', '']
    const formattedUser = {
      ...user,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      status: user.isActive ? 'active' : 'inactive',
      role: user.roleId || (user.isSuperAdmin ? 'super-admin' : 'viewer'),
      groupId: user.groupId,
      group: user.group,
      loginMethods: user.loginMethods,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLoginAt,
      ssoInfo,
    }

    return NextResponse.json({ success: true, user: formattedUser })

  } catch (error: any) {
    console.error('Failed to get admin user:', error)
    return NextResponse.json({ error: 'Failed to fetch admin user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, firstName, lastName, email, roleId, groupId, loginMethods, mfaEnabled, isActive, isSuperAdmin } = body

    // Try admin_users first
    const adminUser = await prisma.adminUser.findUnique({ where: { id } })
    if (adminUser) {
      // Combine names if provided separately
      const updatedName = name || (firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : undefined)

      const updated = await prisma.adminUser.update({
        where: { id },
        data: {
          ...(updatedName !== undefined && { name: updatedName }),
          ...(email !== undefined && { email }),
          ...(roleId !== undefined && { roleId }),
          ...(groupId !== undefined && { groupId }),
          ...(loginMethods !== undefined && { loginMethods }),
          ...(mfaEnabled !== undefined && { mfaEnabled }),
          ...(isActive !== undefined && { isActive }),
          ...(isSuperAdmin !== undefined && { isSuperAdmin }),
          updatedAt: new Date()
        }
      })

      // Format for frontend
      const nameParts = updated.name ? updated.name.split(' ') : ['', '']
      const formattedUpdated = {
        ...updated,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        status: updated.isActive ? 'active' : 'inactive',
        role: updated.roleId || (updated.isSuperAdmin ? 'super-admin' : 'viewer'),
        groupId: updated.groupId,
        loginMethods: updated.loginMethods,
        mfaEnabled: updated.mfaEnabled,
        lastLogin: updated.lastLoginAt
      }

      return NextResponse.json({ success: true, user: formattedUpdated })
    }

    // Fallback to users table
    const user = await prisma.user.findUnique({ where: { id } })
    if (user) {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(email !== undefined && { email }),
          ...(isActive !== undefined && { isActive })
        }
      })
      return NextResponse.json({ success: true, user: updated })
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 })

  } catch (error: any) {
    console.error('Failed to update admin user:', error)
    return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const { id } = params

    // Try admin_users first
    const adminUser = await prisma.adminUser.findUnique({ where: { id } })
    if (adminUser) {
      await prisma.adminUser.update({
        where: { id },
        data: { isActive: false }
      })
      return NextResponse.json({ success: true, message: 'Admin user deactivated' })
    }

    // Fallback to users table
    const user = await prisma.user.findUnique({ where: { id } })
    if (user) {
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      })
      return NextResponse.json({ success: true, message: 'User deactivated' })
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 })

  } catch (error: any) {
    console.error('Failed to delete admin user:', error)
    return NextResponse.json({ error: 'Failed to delete admin user' }, { status: 500 })
  }
}
