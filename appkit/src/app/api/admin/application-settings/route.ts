// Application settings endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appId = searchParams.get('appId')
    const category = searchParams.get('category')
    const isPublic = searchParams.get('isPublic')
    
    let whereClause: any = {}
    
    if (appId) {
      whereClause.applicationId = appId
    }
    
    if (category) {
      whereClause.category = category
    }
    
    if (isPublic !== null) {
      whereClause.isPublic = isPublic === 'true'
    }
    
    // Get application settings from database
    const settings = await prisma.appSetting.findMany({
      where: whereClause,
      orderBy: { key: 'asc' },
      include: {
        application: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
    
    // Format response to match expected structure
    const formattedSettings = settings.map(setting => ({
      id: setting.id,
      key: setting.key,
      value: setting.value,
      type: 'json', // Default type since field doesn't exist in model
      category: 'general', // Default category since field doesn't exist in model
      description: setting.description,
      isPublic: false, // Default since field doesn't exist in model
      applicationId: setting.applicationId,
      applicationName: setting.application?.name,
      updatedAt: setting.updatedAt
    }))
    
    // If no settings found, return default integrations setting
    if (formattedSettings.length === 0) {
      return NextResponse.json({
        success: true,
        settings: [
          {
            id: 'default-integrations',
            key: 'integrations',
            value: {
              smtpMobile: { host: '', port: 587, user: '', pass: '', from: '', secure: false },
              smtpAdmin: { host: '', port: 587, user: '', pass: '', from: '', secure: false },
              twilio: {
                accountSid: '',
                authToken: '',
                fromNumber: ''
              }
            },
            type: 'json',
            category: 'system',
            description: 'External integration configurations (SMTP, SMS, etc.)',
            isPublic: false,
            applicationId: null,
            applicationName: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        total: 1,
        message: 'Default application settings retrieved successfully'
      })
    }
    
    return NextResponse.json({
      success: true,
      settings: formattedSettings,
      total: formattedSettings.length,
      message: 'Application settings retrieved successfully'
    })
  } catch (error) {
    console.error('Failed to get application settings:', error)
    
    // Fallback to default settings if database fails
    return NextResponse.json({
      success: true,
      settings: [
        {
          id: 'fallback-integrations',
          key: 'integrations',
          value: {
            smtpMobile: { host: '', port: 587, user: '', pass: '', from: '', secure: false },
            smtpAdmin: { host: '', port: 587, user: '', pass: '', from: '', secure: false },
            twilio: {
              accountSid: '',
              authToken: '',
              fromNumber: ''
            }
          },
          type: 'json',
          category: 'system',
          description: 'External integration configurations (SMTP, SMS, etc.)',
          isPublic: false,
          applicationId: null,
          applicationName: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      total: 1,
      message: 'Fallback application settings retrieved successfully'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      appId, 
      key, 
      value, 
      setting_key, 
      setting_value, 
      category = 'general', 
      setting_type = 'json', 
      description, 
      is_public = false 
    } = body
    
    const finalKey = key || setting_key
    const finalValue = value || setting_value
    
    if (!finalKey) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }
    
    // Check if setting already exists
    const existingSetting = await prisma.appSetting.findFirst({
      where: {
        key: finalKey,
        applicationId: appId || null
      }
    })
    
    let setting
    
    if (existingSetting) {
      // Update existing setting
      setting = await prisma.appSetting.update({
        where: { id: existingSetting.id },
        data: {
          value: finalValue,
          description: description || existingSetting.description,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new setting
      setting = await prisma.appSetting.create({
        data: {
          key: finalKey,
          value: finalValue,
          description: description || '',
          applicationId: appId || null
        }
      })
    }
    
    console.log(`🔐 Application Setting ${existingSetting ? 'Updated' : 'Created'}: ${finalKey}`, {
      settingId: setting.id,
      category,
      applicationId: appId
    })
    
    return NextResponse.json({
      success: true,
      setting: {
        id: setting.id,
        key: setting.key,
        value: setting.value,
        type: 'json', // Default type since field doesn't exist in model
        category: 'general', // Default category since field doesn't exist in model
        description: setting.description,
        isPublic: false, // Default since field doesn't exist in model
        applicationId: setting.applicationId,
        updatedAt: setting.updatedAt
      },
      message: `Application setting ${existingSetting ? 'updated' : 'created'} successfully`
    }, { status: existingSetting ? 200 : 201 })
  } catch (error) {
    console.error('Failed to save application setting:', error)
    return NextResponse.json(
      { error: 'Failed to save application setting' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, key, value, type, category, description, isPublic } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Setting ID is required' },
        { status: 400 }
      )
    }
    
    // Update setting
    const updatedSetting = await prisma.appSetting.update({
      where: { id },
      data: {
        ...(key && { key }),
        ...(value !== undefined && { value }),
        ...(description !== undefined && { description }),
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      setting: {
        id: updatedSetting.id,
        key: updatedSetting.key,
        value: updatedSetting.value,
        type: 'json', // Default type since field doesn't exist in model
        category: 'general', // Default category since field doesn't exist in model
        description: updatedSetting.description,
        isPublic: false, // Default since field doesn't exist in model
        applicationId: updatedSetting.applicationId,
        updatedAt: updatedSetting.updatedAt
      },
      message: 'Application setting updated successfully'
    })
  } catch (error) {
    console.error('Failed to update application setting:', error)
    return NextResponse.json(
      { error: 'Failed to update application setting' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const key = searchParams.get('key')
    const appId = searchParams.get('appId')
    
    if (id) {
      // Delete by ID
      await prisma.appSetting.delete({
        where: { id }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Application setting deleted successfully'
      })
    } else if (key) {
      // Delete by key and optional appId
      let whereClause: any = { key }
      
      if (appId) {
        whereClause.applicationId = appId
      }
      
      await prisma.appSetting.deleteMany({
        where: whereClause
      })
      
      return NextResponse.json({
        success: true,
        message: 'Application setting(s) deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Setting ID or key is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to delete application setting:', error)
    return NextResponse.json(
      { error: 'Failed to delete application setting' },
      { status: 500 }
    )
  }
}
