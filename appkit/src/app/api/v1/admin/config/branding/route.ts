import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }
    if (!hasPermission(auth.admin, 'branding:view') && !hasPermission(auth.admin, 'applications:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Try to find an active application with branding settings
    const activeApplication = await prisma.application.findFirst({
      where: { isActive: true },
      include: {
        appSettings: {
          where: { key: 'branding' },
          select: { value: true }
        }
      }
    })

    if (!activeApplication) {
      return NextResponse.json({ success: true, data: {}, message: 'No active application found' })
    }

    let branding = {}
    const brandingSetting = activeApplication.appSettings[0]
    
    if (brandingSetting?.value) {
      branding = typeof brandingSetting.value === 'string' 
        ? JSON.parse(brandingSetting.value) 
        : brandingSetting.value
    } else if (activeApplication.branding) {
      branding = typeof activeApplication.branding === 'string' 
        ? JSON.parse(activeApplication.branding) 
        : activeApplication.branding
    }

    return NextResponse.json({
      success: true,
      data: branding,
      message: 'Branding retrieved successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Local branding fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch branding' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }
    if (!hasPermission(auth.admin, 'branding:update')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { branding } = body

    if (!branding) {
      return NextResponse.json({ error: 'Branding data is required' }, { status: 400 })
    }

    const activeApplication = await prisma.application.findFirst({
      where: { isActive: true },
      select: { id: true }
    })

    if (!activeApplication) {
      return NextResponse.json({ error: 'No active application found' }, { status: 404 })
    }

    await prisma.appSetting.upsert({
      where: {
        applicationId_key: {
          applicationId: activeApplication.id,
          key: 'branding'
        }
      },
      update: { value: branding as any },
      create: {
        applicationId: activeApplication.id,
        key: 'branding',
        value: branding as any
      }
    })

    return NextResponse.json({
      success: true,
      data: branding,
      message: 'Branding updated successfully'
    })

  } catch (error: any) {
    console.error('Local branding update error:', error)
    return NextResponse.json({ error: 'Failed to update branding' }, { status: 500 })
  }
}
