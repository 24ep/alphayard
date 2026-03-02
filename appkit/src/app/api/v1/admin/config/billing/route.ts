import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import defaultConfigService from '@/server/services/DefaultConfigService'

// GET /api/v1/admin/config/billing — platform-default billing config
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const config = await defaultConfigService.getDefaultBillingConfig()
    return NextResponse.json({ config })
  } catch (error: any) {
    console.error('GET default billing config error:', error)
    return NextResponse.json({ error: 'Failed to fetch billing config' }, { status: 500 })
  }
}

// PUT /api/v1/admin/config/billing — save platform-default billing config
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const { config } = await request.json()
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'config object is required' }, { status: 400 })
    }

    const ok = await defaultConfigService.saveDefaultBillingConfig(config)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ config, message: 'Billing defaults saved' })
  } catch (error: any) {
    console.error('PUT default billing config error:', error)
    return NextResponse.json({ error: 'Failed to save billing config' }, { status: 500 })
  }
}

