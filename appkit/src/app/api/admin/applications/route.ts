// Applications management endpoint - Real database implementation
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit
    
    // Build where clause for search
    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Get applications from database with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        include: {
          userApplications: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.application.count({ where: whereClause })
    ])
    
    // Format application data
    const formattedApplications = applications.map(app => ({
      id: app.id,
      name: app.name,
      slug: app.slug,
      description: app.description,
      isActive: app.isActive,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      userCount: app.userApplications.length,
      users: app.userApplications.map(ua => ({
        id: ua.user.id,
        email: ua.user.email,
        firstName: ua.user.firstName,
        lastName: ua.user.lastName
      }))
    }))
    
    return NextResponse.json({
      success: true,
      applications: formattedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Failed to fetch applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, isActive = true, settings = {} } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'Application name is required' },
        { status: 400 }
      )
    }
    
    // Generate slug if not provided
    const appSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    
    // Check if application already exists
    const existingApp = await prisma.application.findFirst({
      where: {
        OR: [
          { name },
          { slug: appSlug }
        ]
      }
    })
    
    if (existingApp) {
      return NextResponse.json(
        { error: 'Application with this name or slug already exists' },
        { status: 409 }
      )
    }
    
    // Create new application
    const newApp = await prisma.application.create({
      data: {
        name,
        slug: appSlug,
        description: description || '',
        isActive,
        settings,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log(`📱 Application Created: ${newApp.name} - ID: ${newApp.id}`)
    
    return NextResponse.json({
      success: true,
      application: {
        id: newApp.id,
        name: newApp.name,
        slug: newApp.slug,
        description: newApp.description,
        isActive: newApp.isActive,
        settings: newApp.settings,
        createdAt: newApp.createdAt,
        updatedAt: newApp.updatedAt
      },
      message: 'Application created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create application:', error)
    return NextResponse.json(
      { error: 'Failed to create application', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, description, isActive, settings } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }
    
    // Check if application exists
    const existingApp = await prisma.application.findUnique({
      where: { id }
    })
    
    if (!existingApp) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check for duplicate name/slug if changing
    if (name || slug) {
      const duplicateCheck = await prisma.application.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(name ? [{ name }] : []),
                ...(slug ? [{ slug }] : [])
              ]
            }
          ]
        }
      })
      
      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Application with this name or slug already exists' },
          { status: 409 }
        )
      }
    }
    
    // Update application
    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(settings && { settings }),
        updatedAt: new Date()
      }
    })
    
    console.log(`📱 Application Updated: ${updatedApp.name} - ID: ${updatedApp.id}`)
    
    return NextResponse.json({
      success: true,
      application: {
        id: updatedApp.id,
        name: updatedApp.name,
        slug: updatedApp.slug,
        description: updatedApp.description,
        isActive: updatedApp.isActive,
        settings: updatedApp.settings,
        createdAt: updatedApp.createdAt,
        updatedAt: updatedApp.updatedAt
      },
      message: 'Application updated successfully'
    })
  } catch (error: any) {
    console.error('Failed to update application:', error)
    return NextResponse.json(
      { error: 'Failed to update application', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }
    
    // Check if application exists
    const existingApp = await prisma.application.findUnique({
      where: { id },
      include: {
        userApplications: true
      }
    })
    
    if (!existingApp) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check if application has users
    if (existingApp.userApplications.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete application with associated users' },
        { status: 400 }
      )
    }
    
    // Delete application
    await prisma.application.delete({
      where: { id }
    })
    
    console.log(`🗑️ Application Deleted: ${existingApp.name} - ID: ${existingApp.id}`)
    
    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    })
  } catch (error: any) {
    console.error('Failed to delete application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application', details: error.message },
      { status: 500 }
    )
  }
}
