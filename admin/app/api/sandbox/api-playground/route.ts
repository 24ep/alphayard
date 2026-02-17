import { NextRequest, NextResponse } from 'next/server'

// API Playground testing engine
interface APIEndpoint {
  id: string
  name: string
  description: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  headers: Record<string, string>
  body?: any
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'api-key'
    token?: string
  }
  expectedStatus: number
  expectedResponse?: any
}

interface APITest {
  id: string
  endpointId: string
  timestamp: string
  request: {
    method: string
    url: string
    headers: Record<string, string>
    body?: any
  }
  response: {
    status: number
    statusText: string
    headers: Record<string, string>
    body: any
    duration: number
  }
  success: boolean
  error?: string
}

// API endpoints database
const apiEndpoints: APIEndpoint[] = [
  {
    id: 'login-test',
    name: 'Login Test',
    description: 'Test login endpoint with valid credentials',
    method: 'POST',
    endpoint: '/api/sandbox/test-login',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      email: 'test@example.com',
      password: 'password123',
      redirectUrl: '/sandbox/success'
    },
    expectedStatus: 302
  },
  {
    id: 'config-current',
    name: 'Get Current Config',
    description: 'Fetch current login configuration',
    method: 'GET',
    endpoint: '/api/login-config/current',
    headers: {
      'Accept': 'application/json'
    },
    expectedStatus: 200
  },
  {
    id: 'config-watch',
    name: 'Config Watch Stream',
    description: 'Test configuration streaming endpoint',
    method: 'GET',
    endpoint: '/api/login-config/watch',
    headers: {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache'
    },
    expectedStatus: 200
  },
  {
    id: 'analytics-data',
    name: 'Analytics Data',
    description: 'Fetch analytics metrics',
    method: 'GET',
    endpoint: '/api/sandbox/analytics',
    headers: {
      'Accept': 'application/json'
    },
    expectedStatus: 200
  },
  {
    id: 'ab-tests',
    name: 'A/B Tests',
    description: 'List available A/B tests',
    method: 'GET',
    endpoint: '/api/sandbox/ab-testing',
    headers: {
      'Accept': 'application/json'
    },
    expectedStatus: 200
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'Get performance monitoring data',
    method: 'GET',
    endpoint: '/api/sandbox/performance',
    headers: {
      'Accept': 'application/json'
    },
    expectedStatus: 200
  },
  {
    id: 'security-scan',
    name: 'Security Scan',
    description: 'Perform security vulnerability scan',
    method: 'POST',
    endpoint: '/api/sandbox/security',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      url: 'http://localhost:3001/login'
    },
    expectedStatus: 200
  },
  {
    id: 'accessibility-test',
    name: 'Accessibility Test',
    description: 'Run accessibility compliance test',
    method: 'POST',
    endpoint: '/api/sandbox/accessibility',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      url: 'http://localhost:3001/login',
      wcagLevel: 'AA'
    },
    expectedStatus: 200
  },
  {
    id: 'device-test',
    name: 'Device Testing',
    description: 'Test device compatibility',
    method: 'POST',
    endpoint: '/api/sandbox/device-testing',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      deviceId: 'iphone-14-pro',
      url: 'http://localhost:3001/login'
    },
    expectedStatus: 200
  }
]

// API test results storage
const apiTests: APITest[] = []

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const endpointId = searchParams.get('endpointId')
  const testId = searchParams.get('testId')
  const action = searchParams.get('action')

  try {
    if (action === 'endpoints') {
      return NextResponse.json({
        success: true,
        data: apiEndpoints
      })
    }

    if (endpointId) {
      const endpoint = apiEndpoints.find(e => e.id === endpointId)
      if (!endpoint) {
        return NextResponse.json(
          { success: false, error: 'Endpoint not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: endpoint
      })
    }

    if (testId) {
      const test = apiTests.find(t => t.id === testId)
      if (!test) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: test
      })
    }

    if (action === 'recent') {
      return NextResponse.json({
        success: true,
        data: apiTests.slice(-20).reverse()
      })
    }

    return NextResponse.json({
      success: true,
      data: apiTests
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch API playground data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpointId, customRequest } = body

    let endpoint: APIEndpoint
    let requestConfig: any

    if (customRequest) {
      // Handle custom request
      requestConfig = customRequest
      endpoint = {
        id: 'custom',
        name: 'Custom Request',
        description: 'Custom API request',
        method: customRequest.method || 'GET',
        endpoint: customRequest.url || '/',
        headers: customRequest.headers || {},
        body: customRequest.body,
        expectedStatus: customRequest.expectedStatus || 200
      }
    } else if (endpointId) {
      // Handle predefined endpoint
      endpoint = apiEndpoints.find(e => e.id === endpointId)
      if (!endpoint) {
        return NextResponse.json(
          { success: false, error: 'Endpoint not found' },
          { status: 404 }
        )
      }

      requestConfig = {
        method: endpoint.method,
        url: endpoint.endpoint,
        headers: endpoint.headers,
        body: endpoint.body
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Endpoint ID or custom request is required' },
        { status: 400 }
      )
    }

    // Create new API test
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Execute the API request
    const startTime = Date.now()
    let response: Response
    let responseBody: any
    let error: string | undefined

    try {
      const baseUrl = request.nextUrl.origin
      const fullUrl = requestConfig.url.startsWith('http') 
        ? requestConfig.url 
        : `${baseUrl}${requestConfig.url}`

      const fetchOptions: RequestInit = {
        method: requestConfig.method,
        headers: requestConfig.headers
      }

      if (requestConfig.body && ['POST', 'PUT', 'PATCH'].includes(requestConfig.method)) {
        fetchOptions.body = typeof requestConfig.body === 'string' 
          ? requestConfig.body 
          : JSON.stringify(requestConfig.body)
      }

      response = await fetch(fullUrl, fetchOptions)
      
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        responseBody = await response.json()
      } else if (contentType?.includes('text/event-stream')) {
        // Handle SSE streams
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let chunks = ''
        
        if (reader) {
          let done = false
          while (!done) {
            const { value, done: readerDone } = await reader.read()
            done = readerDone
            if (value) {
              chunks += decoder.decode(value, { stream: true })
            }
            // Limit the amount of data we read for testing
            if (chunks.length > 1000) break
          }
        }
        responseBody = { stream: chunks.substring(0, 1000) + '...' }
      } else {
        responseBody = await response.text()
      }

    } catch (fetchError) {
      error = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
      response = new Response(null, { status: 0, statusText: 'Network Error' })
      responseBody = { error }
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    // Create test result
    const test: APITest = {
      id: testId,
      endpointId: endpoint.id,
      timestamp: new Date().toISOString(),
      request: {
        method: requestConfig.method,
        url: requestConfig.url,
        headers: requestConfig.headers,
        body: requestConfig.body
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        duration
      },
      success: !error && response.status === endpoint.expectedStatus,
      error
    }

    apiTests.push(test)

    return NextResponse.json({
      success: true,
      data: test,
      message: error ? 'Request completed with errors' : 'Request completed successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute API request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, testId, data } = body

    if (action === 'generate_collection' && data?.endpoints) {
      // Generate a Postman collection from selected endpoints
      const collection = {
        info: {
          name: 'Boundary Sandbox API Collection',
          description: 'Generated API collection for testing',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: data.endpoints.map((endpointId: string) => {
          const endpoint = apiEndpoints.find(e => e.id === endpointId)
          if (!endpoint) return null

          return {
            name: endpoint.name,
            request: {
              method: endpoint.method,
              header: Object.entries(endpoint.headers).map(([key, value]) => ({
                key,
                value
              })),
              url: {
                raw: `{{baseUrl}}${endpoint.endpoint}`,
                host: ['{{baseUrl}}'],
                path: endpoint.endpoint.split('/').filter(Boolean)
              },
              body: endpoint.body ? {
                mode: 'raw',
                raw: JSON.stringify(endpoint.body, null, 2),
                options: {
                  raw: {
                    language: 'json'
                  }
                }
              } : undefined
            }
          }
        }).filter((item): item is NonNullable<typeof item> => item !== null)
      }

      return NextResponse.json({
        success: true,
        data: collection,
        message: 'Postman collection generated successfully'
      })
    }

    if (action === 'export_tests' && testId) {
      const test = apiTests.find(t => t.id === testId)
      if (!test) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        )
      }

      // Export test as cURL command
      const curlCommand = generateCurlCommand(test.request)
      
      return NextResponse.json({
        success: true,
        data: {
          curl: curlCommand,
          test: test
        },
        message: 'Test exported successfully'
      })
    }

    if (action === 'batch_test' && data?.endpointIds) {
      // Run multiple tests in batch
      const results = []
      
      for (const endpointId of data.endpointIds) {
        const endpoint = apiEndpoints.find(e => e.id === endpointId)
        if (!endpoint) continue

        try {
          const baseUrl = request.nextUrl.origin
          const fullUrl = `${baseUrl}${endpoint.endpoint}`
          
          const fetchOptions: RequestInit = {
            method: endpoint.method,
            headers: endpoint.headers
          }

          if (endpoint.body && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
            fetchOptions.body = JSON.stringify(endpoint.body)
          }

          const startTime = Date.now()
          const response = await fetch(fullUrl, fetchOptions)
          const endTime = Date.now()
          const duration = endTime - startTime

          const contentType = response.headers.get('content-type')
          let responseBody: any
          
          if (contentType?.includes('application/json')) {
            responseBody = await response.json()
          } else {
            responseBody = await response.text()
          }

          results.push({
            endpointId,
            endpointName: endpoint.name,
            status: response.status,
            statusText: response.statusText,
            duration,
            success: response.status === endpoint.expectedStatus,
            body: responseBody
          })

        } catch (error) {
          results.push({
            endpointId,
            endpointName: endpoint.name,
            status: 0,
            statusText: 'Error',
            duration: 0,
            success: false,
            body: { error: error instanceof Error ? error.message : 'Unknown error' }
          })
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length
          }
        },
        message: 'Batch test completed successfully'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process API playground request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateCurlCommand(request: any): string {
  const headers = Object.entries(request.headers)
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ')

  let body = ''
  if (request.body) {
    const bodyStr = typeof request.body === 'string' 
      ? request.body 
      : JSON.stringify(request.body)
    body = `-d '${bodyStr}'`
  }

  return `curl -X ${request.method} ${headers} ${body} "${request.url}"`
}
