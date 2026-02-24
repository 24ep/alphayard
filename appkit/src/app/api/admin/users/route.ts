// Users management endpoint - Real database implementation
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    // Build where clause for search
    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { email: { contains: search.toLowerCase(), mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Get users from database with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          userApplications: {
            include: {
              application: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          userSessions: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          userGroupMembers: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])
    
    // Format user data
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      isVerified: user.isVerified,
      userType: user.userType,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      applications: user.userApplications.map((ua: any) => ({
        id: ua.application.id,
        name: ua.application.name,
        slug: ua.application.slug
      })),
      sessions: user.userSessions.length,
      groups: user.userGroupMembers.map((ugm: any) => ({
        id: ugm.group.id,
        name: ugm.group.name,
        slug: ugm.group.slug
      })),
      permissions: [] // Will be populated from group memberships
    }))
    
    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      firstName, 
      lastName, 
      password, 
      userType = 'user',
      isActive = true,
      isVerified = false,
      avatarUrl = null 
    } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName: firstName || '',
        lastName: lastName || '',
        passwordHash: hashedPassword,
        userType,
        isActive,
        isVerified,
        avatarUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    // Log security event
    console.log(`👤 User Created: ${newUser.email} - ID: ${newUser.id}`)
    
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userType: newUser.userType,
        isActive: newUser.isActive,
        isVerified: newUser.isVerified,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      },
      message: 'User created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, userType, isActive } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(userType && { userType }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    })
    
    // Log security event
    console.log(`👤 User Updated: ${updatedUser.email} - ID: ${updatedUser.id}`)
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        userType: updatedUser.userType,
        isActive: updatedUser.isActive,
        isVerified: updatedUser.isVerified,
        avatarUrl: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      },
      message: 'User updated successfully'
    })
  } catch (error: any) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Revoke all user sessions
    await prisma.userSession.updateMany({
      where: { userId: id },
      data: {
        isActive: false,
        revokedAt: new Date()
      }
    })
    
    // Delete user
    await prisma.user.delete({
      where: { id }
    })
    
    // Log security event
    console.log(`🗑️ User Deleted: ${existingUser.email} - ID: ${existingUser.id}`)
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    )
  }
}
