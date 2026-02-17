import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Configuration persistence engine
interface ConfigVersion {
  id: string
  timestamp: string
  config: any
  author: string
  description: string
  tags: string[]
  metadata: {
    platformMode: string
    deviceMode: string
    formType: string
    version: string
  }
}

interface ConfigBackup {
  id: string
  timestamp: string
  config: any
  type: 'auto' | 'manual'
  description: string
}

// In-memory storage for demo (in production, use database)
const configVersions: Map<string, ConfigVersion> = new Map()
const configBackups: Map<string, ConfigBackup> = new Map()
const activeConfigs: Map<string, any> = new Map()

// File storage path
const CONFIG_DIR = join(process.cwd(), 'data', 'configs')

// Ensure config directory exists
try {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
} catch (error) {
  console.warn('Could not create config directory:', error)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const configId = searchParams.get('configId')
  const versionId = searchParams.get('versionId')
  const action = searchParams.get('action')

  try {
    if (action === 'versions') {
      const versions = Array.from(configVersions.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      return NextResponse.json({
        success: true,
        data: versions
      })
    }

    if (action === 'backups') {
      const backups = Array.from(configBackups.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      return NextResponse.json({
        success: true,
        data: backups
      })
    }

    if (action === 'active') {
      const activeConfig = activeConfigs.get('default')
      return NextResponse.json({
        success: true,
        data: activeConfig || null
      })
    }

    if (versionId) {
      const version = configVersions.get(versionId)
      if (!version) {
        return NextResponse.json(
          { success: false, error: 'Version not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: version
      })
    }

    if (configId) {
      const config = activeConfigs.get(configId)
      if (!config) {
        return NextResponse.json(
          { success: false, error: 'Configuration not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: config
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        versions: Array.from(configVersions.values()),
        backups: Array.from(configBackups.values()),
        activeConfigs: Object.fromEntries(activeConfigs)
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch configuration data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config, metadata } = body

    if (action === 'save') {
      const versionId = `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const timestamp = new Date().toISOString()

      const version: ConfigVersion = {
        id: versionId,
        timestamp,
        config: config,
        author: metadata?.author || 'Sandbox User',
        description: metadata?.description || 'Configuration save',
        tags: metadata?.tags || [],
        metadata: {
          platformMode: metadata?.platformMode || 'web',
          deviceMode: metadata?.deviceMode || 'desktop',
          formType: metadata?.formType || 'login',
          version: metadata?.version || '1.0.0'
        }
      }

      configVersions.set(versionId, version)
      activeConfigs.set('default', config)

      // Save to file system
      try {
        const filePath = join(CONFIG_DIR, `${versionId}.json`)
        writeFileSync(filePath, JSON.stringify(version, null, 2))
      } catch (fileError) {
        console.warn('Could not save config to file:', fileError)
      }

      // Create auto backup
      await createAutoBackup(config)

      return NextResponse.json({
        success: true,
        data: version,
        message: 'Configuration saved successfully'
      })
    }

    if (action === 'backup') {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const timestamp = new Date().toISOString()

      const backup: ConfigBackup = {
        id: backupId,
        timestamp,
        config: config,
        type: 'manual',
        description: metadata?.description || 'Manual backup'
      }

      configBackups.set(backupId, backup)

      // Save to file system
      try {
        const filePath = join(CONFIG_DIR, `backup_${backupId}.json`)
        writeFileSync(filePath, JSON.stringify(backup, null, 2))
      } catch (fileError) {
        console.warn('Could not save backup to file:', fileError)
      }

      return NextResponse.json({
        success: true,
        data: backup,
        message: 'Backup created successfully'
      })
    }

    if (action === 'restore') {
      const { versionId } = body
      
      if (!versionId) {
        return NextResponse.json(
          { success: false, error: 'Version ID is required' },
          { status: 400 }
        )
      }

      const version = configVersions.get(versionId)
      if (!version) {
        return NextResponse.json(
          { success: false, error: 'Version not found' },
          { status: 404 }
        )
      }

      // Restore configuration
      activeConfigs.set('default', version.config)

      // Create backup before restore
      await createAutoBackup(activeConfigs.get('default'))

      return NextResponse.json({
        success: true,
        data: {
          restoredVersion: version,
          currentConfig: version.config
        },
        message: 'Configuration restored successfully'
      })
    }

    if (action === 'import') {
      const { fileContent, fileName } = body
      
      if (!fileContent) {
        return NextResponse.json(
          { success: false, error: 'File content is required' },
          { status: 400 }
        )
      }

      let importedConfig
      try {
        importedConfig = typeof fileContent === 'string' 
          ? JSON.parse(fileContent) 
          : fileContent
      } catch (parseError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid JSON format',
            details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
          },
          { status: 400 }
        )
      }

      // Validate imported config
      const validation = validateConfig(importedConfig)
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid configuration',
            details: validation.errors
          },
          { status: 400 }
        )
      }

      // Save as new version
      const versionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const version: ConfigVersion = {
        id: versionId,
        timestamp: new Date().toISOString(),
        config: importedConfig,
        author: 'Import User',
        description: `Imported from ${fileName || 'file'}`,
        tags: ['import'],
        metadata: {
          platformMode: importedConfig.platformMode || 'web',
          deviceMode: importedConfig.deviceMode || 'desktop',
          formType: importedConfig.formType || 'login',
          version: importedConfig.version || '1.0.0'
        }
      }

      configVersions.set(versionId, version)
      activeConfigs.set('default', importedConfig)

      return NextResponse.json({
        success: true,
        data: {
          version: version,
          config: importedConfig
        },
        message: 'Configuration imported successfully'
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
        error: 'Failed to process configuration request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, configId, data } = body

    if (action === 'update' && configId) {
      const existingConfig = activeConfigs.get(configId)
      if (!existingConfig) {
        return NextResponse.json(
          { success: false, error: 'Configuration not found' },
          { status: 404 }
        )
      }

      // Create backup before update
      await createAutoBackup(existingConfig)

      // Update configuration
      const updatedConfig = { ...existingConfig, ...data }
      activeConfigs.set(configId, updatedConfig)

      return NextResponse.json({
        success: true,
        data: updatedConfig,
        message: 'Configuration updated successfully'
      })
    }

    if (action === 'sync') {
      const { targetConfigs } = body
      
      if (!targetConfigs || !Array.isArray(targetConfigs)) {
        return NextResponse.json(
          { success: false, error: 'Target configs array is required' },
          { status: 400 }
        )
      }

      const syncResults = []
      
      for (const targetConfig of targetConfigs) {
        const config = activeConfigs.get(targetConfig)
        if (config) {
          // Simulate sync to external system
          await new Promise(resolve => setTimeout(resolve, 500))
          syncResults.push({
            configId: targetConfig,
            success: true,
            timestamp: new Date().toISOString()
          })
        } else {
          syncResults.push({
            configId: targetConfig,
            success: false,
            error: 'Configuration not found'
          })
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          results: syncResults,
          summary: {
            total: syncResults.length,
            successful: syncResults.filter(r => r.success).length,
            failed: syncResults.filter(r => !r.success).length
          }
        },
        message: 'Sync operation completed'
      })
    }

    if (action === 'export') {
      const { format, configIds } = body
      
      const configsToExport = configIds 
        ? configIds.map(id => activeConfigs.get(id)).filter(Boolean)
        : Array.from(activeConfigs.values())

      if (format === 'json') {
        const exportData = {
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          configurations: configsToExport
        }

        return NextResponse.json({
          success: true,
          data: {
            content: JSON.stringify(exportData, null, 2),
            filename: `boundary-configs-${new Date().toISOString().split('T')[0]}.json`,
            mimeType: 'application/json'
          }
        })
      }

      if (format === 'yaml') {
        // Simple YAML export (in production, use a proper YAML library)
        const yamlContent = configsToExport.map(config => 
          `# Configuration exported at ${new Date().toISOString()}\n${JSON.stringify(config, null, 2)}`
        ).join('\n\n---\n\n')

        return NextResponse.json({
          success: true,
          data: {
            content: yamlContent,
            filename: `boundary-configs-${new Date().toISOString().split('T')[0]}.yaml`,
            mimeType: 'text/yaml'
          }
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Unsupported export format'
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
        error: 'Failed to process configuration request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, versionId, backupId } = body

    if (action === 'delete_version' && versionId) {
      const version = configVersions.get(versionId)
      if (!version) {
        return NextResponse.json(
          { success: false, error: 'Version not found' },
          { status: 404 }
        )
      }

      configVersions.delete(versionId)

      // Delete from file system
      try {
        const filePath = join(CONFIG_DIR, `${versionId}.json`)
        if (existsSync(filePath)) {
          require('fs').unlinkSync(filePath)
        }
      } catch (fileError) {
        console.warn('Could not delete config file:', fileError)
      }

      return NextResponse.json({
        success: true,
        message: 'Version deleted successfully'
      })
    }

    if (action === 'delete_backup' && backupId) {
      const backup = configBackups.get(backupId)
      if (!backup) {
        return NextResponse.json(
          { success: false, error: 'Backup not found' },
          { status: 404 }
        )
      }

      configBackups.delete(backupId)

      // Delete from file system
      try {
        const filePath = join(CONFIG_DIR, `backup_${backupId}.json`)
        if (existsSync(filePath)) {
          require('fs').unlinkSync(filePath)
        }
      } catch (fileError) {
        console.warn('Could not delete backup file:', fileError)
      }

      return NextResponse.json({
        success: true,
        message: 'Backup deleted successfully'
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
        error: 'Failed to delete configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function createAutoBackup(config: any): Promise<void> {
  const backupId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const backup: ConfigBackup = {
    id: backupId,
    timestamp: new Date().toISOString(),
    config: config,
    type: 'auto',
    description: 'Automatic backup before configuration change'
  }

  configBackups.set(backupId, backup)

  // Keep only last 50 auto backups
  const autoBackups = Array.from(configBackups.values())
    .filter(b => b.type === 'auto')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  
  if (autoBackups.length > 50) {
    const toDelete = autoBackups.slice(50)
    toDelete.forEach(backup => configBackups.delete(backup.id))
  }
}

function validateConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config || typeof config !== 'object') {
    errors.push('Configuration must be an object')
    return { isValid: false, errors }
  }

  // Check required fields
  if (!config.platformMode) {
    errors.push('Platform mode is required')
  }

  if (!config.deviceMode) {
    errors.push('Device mode is required')
  }

  if (!config.formType) {
    errors.push('Form type is required')
  }

  // Validate platform mode
  const validPlatformModes = ['web', 'mobile', 'desktop']
  if (config.platformMode && !validPlatformModes.includes(config.platformMode)) {
    errors.push('Invalid platform mode')
  }

  // Validate device mode
  const validDeviceModes = ['mobile', 'tablet', 'desktop']
  if (config.deviceMode && !validDeviceModes.includes(config.deviceMode)) {
    errors.push('Invalid device mode')
  }

  // Validate form type
  const validFormTypes = ['login', 'signup', 'reset-password']
  if (config.formType && !validFormTypes.includes(config.formType)) {
    errors.push('Invalid form type')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
