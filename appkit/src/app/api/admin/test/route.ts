// Test endpoint to verify deployment
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🧪 Test endpoint hit - deployment verification')
  
  return NextResponse.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    version: 'debug-v1'
  })
}

export async function POST(request: NextRequest) {
  console.log('🧪 Test POST endpoint hit')
  
  try {
    const body = await request.json()
    console.log('📝 Test POST body:', body)
    
    return NextResponse.json({
      message: 'Test POST working',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Test POST error:', error)
    return NextResponse.json(
      { error: 'Test POST failed' },
      { status: 500 }
    )
  }
}
