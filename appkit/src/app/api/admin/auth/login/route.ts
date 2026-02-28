import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { config } from '@/server/config/env'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { databaseAuthService } from '@/services/databaseAuthService'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        isActive: true,
        isVerified: true,
        userType: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '')
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        adminId: user.id,
        email: user.email,
        role: 'admin',
        type: 'admin',
        permissions: ['*'],
        isSuperAdmin: user.userType === 'admin',
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const session = await databaseAuthService.createSession(
      user.id,
      token,
      token,
      expiresAt
    )

    // Record login history
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = (forwarded?.split(',')[0]?.trim()) ||
                      request.headers.get('x-real-ip') ||
                      '127.0.0.1'

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        email: user.email,
        loginMethod: 'password',
        success: true,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        deviceType: 'web'
      }
    })

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'admin',
        permissions: ['*'],
        isSuperAdmin: user.userType === 'admin',
      },
      sessionId: session.id,
      expiresAt: session.expiresAt
    });

    // Set a session cookie for OIDC/OAuth support
    response.cookies.set('appkit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('[login] Error:', error.message)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
