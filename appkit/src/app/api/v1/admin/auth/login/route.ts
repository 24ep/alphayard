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

    // Find admin user
    const adminUser = await prisma.adminUser.findFirst({
      where: { 
        email: email.toLowerCase(),
        isActive: true 
      },
      include: {
        role: true
      }
    })

    if (!adminUser) {
      console.log(`Login failed: Admin user ${email} not found or inactive`)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash)
    if (!isValidPassword) {
      console.log(`Login failed: Invalid password for ${email}`)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Fetch permissions
    let permissions: string[] = []
    if (adminUser.isSuperAdmin) {
      permissions = ['*']
    } else if (adminUser.roleId) {
      const rolePermissions = await prisma.adminRolePermission.findMany({
        where: { roleId: adminUser.roleId },
        include: { permission: true }
      })
      permissions = rolePermissions.map((rp: any) => `${rp.permission.module}:${rp.permission.action}`)
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: adminUser.id,
        adminId: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.name || '',
        lastName: '',
        role: adminUser.role?.name || 'admin',
        permissions,
        type: 'admin',
        isSuperAdmin: adminUser.isSuperAdmin || false
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() }
    })

    const userResponse = {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.name || undefined,
      lastName: undefined,
      role: adminUser.role?.name || 'admin',
      permissions,
      isSuperAdmin: adminUser.isSuperAdmin || false
    }

    return NextResponse.json({ 
      success: true, 
      data: { user: userResponse, token },
      message: 'Login successful' 
    })

  } catch (error: any) {
    console.error('Local admin login error:', error)
    return NextResponse.json({ error: 'Login failed', details: error.message }, { status: 500 })
  }
}
