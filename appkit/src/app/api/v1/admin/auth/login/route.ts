import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/server/lib/prisma'
import { config } from '@/server/config/env'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Try admin_users table first, then fall back to users table
    let userId: string
    let userEmail: string
    let userName: string
    let roleName = 'admin'
    let permissions: string[] = ['*']
    let isSuperAdmin = false

    const adminUser = await prisma.adminUser.findFirst({
      where: { 
        email: email.toLowerCase(),
        isActive: true 
      },
      include: { role: true }
    })

    if (adminUser) {
      // Validate password against admin_users
      const isValid = await bcrypt.compare(password, adminUser.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      userId = adminUser.id
      userEmail = adminUser.email
      userName = adminUser.name || ''
      roleName = adminUser.role?.name || 'admin'
      isSuperAdmin = adminUser.isSuperAdmin || adminUser.email === 'admin@appkit.com'

      if (!isSuperAdmin && adminUser.roleId) {
        const rolePermissions = await prisma.adminRolePermission.findMany({
          where: { roleId: adminUser.roleId },
          include: { permission: true }
        })
        permissions = rolePermissions.map((rp: any) => `${rp.permission.module}:${rp.permission.action}`)
      }

      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() }
      })
    } else {
      // Fallback: check users table (seed creates admin@appkit.com here)
      const user = await prisma.user.findFirst({
        where: { 
          email: email.toLowerCase(),
          isActive: true 
        }
      })
      if (!user) {
        console.log(`[login] User ${email} not found in admin_users or users`)
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      const isValid = await bcrypt.compare(password, user.passwordHash || '')
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      userId = user.id
      userEmail = user.email
      userName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
      isSuperAdmin = user.userType === 'admin'

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        adminId: userId,
        email: userEmail,
        firstName: userName,
        lastName: '',
        role: roleName,
        permissions,
        type: 'admin',
        isSuperAdmin
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log(`[login] ✓ ${userEmail} logged in (isSuperAdmin=${isSuperAdmin})`)

    // Return token at top level (client reads response.token)
    return NextResponse.json({ 
      success: true, 
      token,
      user: {
        id: userId,
        email: userEmail,
        firstName: userName,
        role: roleName,
        permissions,
        isSuperAdmin
      }
    })

  } catch (error: any) {
    console.error('Local admin login error:', error)
    return NextResponse.json({ error: 'Login failed', details: error.message }, { status: 500 })
  }
}
