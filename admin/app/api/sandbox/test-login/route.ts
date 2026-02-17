import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectUrl = searchParams.get('redirect') || '/sandbox/success'
  
  // Simulate a test login response
  const testUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    company: 'Test Company',
    role: 'user',
    verified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
  
  const testToken = 'sandbox_token_' + Math.random().toString(36).substring(2) + '_' + Date.now()
  
  // Create the redirect URL with auth data
  const url = new URL(redirectUrl, request.url)
  url.searchParams.set('token', testToken)
  url.searchParams.set('user', encodeURIComponent(JSON.stringify(testUser)))
  
  // Perform redirect instead of returning HTML
  return NextResponse.redirect(url.toString(), {
    status: 302
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, redirectUrl } = body
    
    // Simulate validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Simulate authentication (always successful for sandbox)
    const testUser = {
      id: 'test-user-123',
      email: email,
      name: 'Test User',
      username: email.split('@')[0],
      company: 'Test Company',
      role: 'user',
      verified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
    
    const testToken = 'sandbox_token_' + Math.random().toString(36).substring(2) + '_' + Date.now()
    
    return NextResponse.json({
      success: true,
      token: testToken,
      user: testUser,
      redirectUrl: redirectUrl || '/sandbox/success',
      expiresIn: 3600 // 1 hour
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
