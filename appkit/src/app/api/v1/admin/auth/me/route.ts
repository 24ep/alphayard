import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    return NextResponse.json({
      success: true,
      data: auth.admin,
      message: 'Admin user retrieved successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Local admin me error:', error)
    return NextResponse.json({ error: 'Failed to get admin user' }, { status: 500 })
  }
}
