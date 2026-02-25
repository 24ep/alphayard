import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // In local implementation, we just return success
    // The client will clear its own localStorage
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Local admin logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
