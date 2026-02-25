// Catch-all proxy for /api/admin/* to /api/v1/admin/* 
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_ADMIN_URL || 
                   process.env.NEXT_PUBLIC_BACKEND_URL || 
                   'http://127.0.0.1:4000'

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  
  try {
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/v1/admin/${slug}${url.search}`
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('Cookie') || '',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable', message: String(error) }, 
      { status: 503 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  
  // Try to parse body, but handle cases where there might not be one
  let body = {}
  try {
    body = await request.json()
  } catch (error) {
    // No body or invalid JSON, continue with empty body
  }
  
  try {
    const backendUrl = `${BACKEND_URL}/api/v1/admin/${slug}`
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable', message: String(error) }, 
      { status: 503 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  let body = {}
  try {
    body = await request.json()
  } catch (error) {
    // No body
  }
  
  try {
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/v1/admin/${slug}${url.search}`
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable', message: String(error) }, 
      { status: 503 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  
  try {
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/v1/admin/${slug}${url.search}`
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('Cookie') || '',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable', message: String(error) }, 
      { status: 503 }
    )
  }
}
