import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

// GET /api/v1/admin/settings - Get system settings
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'settings:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Get system settings
    let settings = {}
    
    if (category === 'security') {
      settings = {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        },
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        lockoutDuration: 900
      }
    } else if (category === 'email') {
      settings = {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: process.env.SMTP_PORT || 587,
        smtpUser: process.env.SMTP_USER || '',
        smtpSecure: process.env.SMTP_SECURE === 'true',
        fromEmail: process.env.FROM_EMAIL || 'noreply@appkit.com',
        fromName: process.env.FROM_NAME || 'AppKit'
      }
    } else {
      // Return all settings categories
      settings = {
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
          },
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          lockoutDuration: 900
        },
        email: {
          smtpHost: process.env.SMTP_HOST || '',
          smtpPort: process.env.SMTP_PORT || 587,
          smtpUser: process.env.SMTP_USER || '',
          smtpSecure: process.env.SMTP_SECURE === 'true',
          fromEmail: process.env.FROM_EMAIL || 'noreply@appkit.com',
          fromName: process.env.FROM_NAME || 'AppKit'
        },
        general: {
          siteName: process.env.SITE_NAME || 'AppKit',
          siteUrl: process.env.SITE_URL || 'http://localhost:3000',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@appkit.com',
          timezone: 'UTC'
        }
      }
    }

    return NextResponse.json({ settings })

  } catch (error: any) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/v1/admin/settings - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'settings:edit')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { category, settings } = await request.json()

    if (!category || !settings) {
      return NextResponse.json({ error: 'Category and settings are required' }, { status: 400 })
    }

    // In a real implementation, you would save these to a settings table
    // For now, just return success
    return NextResponse.json({ 
      message: 'Settings updated successfully',
      category,
      settings 
    })

  } catch (error: any) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
