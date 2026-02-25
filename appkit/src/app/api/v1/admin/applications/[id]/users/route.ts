import { NextResponse } from 'next/server'
import prisma from '@/server/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Check if app exists
    const appExists = await prisma.application.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!appExists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Fetch users related to this application via UserApplication junction table
    const userApps = await prisma.userApplication.findMany({
      where: { applicationId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            lastLoginAt: true,
            phoneNumber: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    // Transform into the frontend user interface format
    const formattedUsers = userApps.map(ua => ({
      id: ua.user.id,
      email: ua.user.email,
      name: `${ua.user.firstName} ${ua.user.lastName}`.trim() || 'Unknown User',
      status: ua.status.toLowerCase(), // 'active', 'inactive', 'suspended'
      plan: 'Free', // Mocked since plan depends on UserSubscription 
      joinedAt: ua.joinedAt.toISOString(),
      lastActive: ua.lastActiveAt?.toISOString() || ua.user.lastLoginAt?.toISOString() || ua.joinedAt.toISOString(),
      phone: ua.user.phoneNumber || undefined,
      role: ua.role,
      avatar: ua.user.avatarUrl || undefined
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching application users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application users' },
      { status: 500 }
    )
  }
}
