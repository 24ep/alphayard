export interface Dashboard {
  id: string
  name: string
  description: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  components: DashboardComponent[]
}

export interface DashboardComponent {
  id: string
  type: 'chart' | 'table' | 'calendar' | 'stats' | 'gallery' | 'text' | 'custom'
  title: string
  dataSource: string
  config: any
  position: { x: number; y: number; w: number; h: number }
}

export interface DataSource {
  id: string
  name: string
  type: 'api' | 'database' | 'static' | 'computed'
  endpoint?: string
  query?: string
  config: any
}

class DashboardService {
  private storageKey = 'appkit_dashboards'
  private dataSourcesKey = 'appkit_data_sources'

  // Dashboard CRUD Operations
  async getDashboards(): Promise<Dashboard[]> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
      
      // Return default dashboards if none exist
      return this.getDefaultDashboards()
    } catch (error) {
      console.error('Error loading dashboards:', error)
      return this.getDefaultDashboards()
    }
  }

  async getDashboard(id: string): Promise<Dashboard | null> {
    const dashboards = await this.getDashboards()
    return dashboards.find(d => d.id === id) || null
  }

  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const dashboards = await this.getDashboards()
    dashboards.push(newDashboard)
    await this.saveDashboards(dashboards)

    return newDashboard
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const dashboards = await this.getDashboards()
    const index = dashboards.findIndex(d => d.id === id)
    
    if (index === -1) {
      throw new Error('Dashboard not found')
    }

    dashboards[index] = {
      ...dashboards[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    await this.saveDashboards(dashboards)
    return dashboards[index]
  }

  async deleteDashboard(id: string): Promise<void> {
    const dashboards = await this.getDashboards()
    const filtered = dashboards.filter(d => d.id !== id)
    await this.saveDashboards(filtered)
  }

  async setDefaultDashboard(id: string): Promise<void> {
    const dashboards = await this.getDashboards()
    const updated = dashboards.map(d => ({
      ...d,
      isDefault: d.id === id
    }))
    await this.saveDashboards(updated)
  }

  // Component Operations
  async addComponent(dashboardId: string, component: Omit<DashboardComponent, 'id'>): Promise<DashboardComponent> {
    const newComponent: DashboardComponent = {
      ...component,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const dashboard = await this.getDashboard(dashboardId)
    if (!dashboard) {
      throw new Error('Dashboard not found')
    }

    dashboard.components.push(newComponent)
    await this.updateDashboard(dashboardId, { components: dashboard.components })

    return newComponent
  }

  async updateComponent(dashboardId: string, componentId: string, updates: Partial<DashboardComponent>): Promise<DashboardComponent> {
    const dashboard = await this.getDashboard(dashboardId)
    if (!dashboard) {
      throw new Error('Dashboard not found')
    }

    const componentIndex = dashboard.components.findIndex(c => c.id === componentId)
    if (componentIndex === -1) {
      throw new Error('Component not found')
    }

    dashboard.components[componentIndex] = {
      ...dashboard.components[componentIndex],
      ...updates,
      id: componentId // Ensure ID doesn't change
    }

    await this.updateDashboard(dashboardId, { components: dashboard.components })
    return dashboard.components[componentIndex]
  }

  async deleteComponent(dashboardId: string, componentId: string): Promise<void> {
    const dashboard = await this.getDashboard(dashboardId)
    if (!dashboard) {
      throw new Error('Dashboard not found')
    }

    dashboard.components = dashboard.components.filter(c => c.id !== componentId)
    await this.updateDashboard(dashboardId, { components: dashboard.components })
  }

  // Data Source Operations
  async getDataSources(): Promise<DataSource[]> {
    try {
      const stored = localStorage.getItem(this.dataSourcesKey)
      if (stored) {
        return JSON.parse(stored)
      }
      return this.getDefaultDataSources()
    } catch (error) {
      console.error('Error loading data sources:', error)
      return this.getDefaultDataSources()
    }
  }

  async createDataSource(dataSource: Omit<DataSource, 'id'>): Promise<DataSource> {
    const newDataSource: DataSource = {
      ...dataSource,
      id: `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const dataSources = await this.getDataSources()
    dataSources.push(newDataSource)
    await this.saveDataSources(dataSources)

    return newDataSource
  }

  async updateDataSource(id: string, updates: Partial<DataSource>): Promise<DataSource> {
    const dataSources = await this.getDataSources()
    const index = dataSources.findIndex(ds => ds.id === id)
    
    if (index === -1) {
      throw new Error('Data source not found')
    }

    dataSources[index] = {
      ...dataSources[index],
      ...updates,
      id // Ensure ID doesn't change
    }

    await this.saveDataSources(dataSources)
    return dataSources[index]
  }

  async deleteDataSource(id: string): Promise<void> {
    const dataSources = await this.getDataSources()
    const filtered = dataSources.filter(ds => ds.id !== id)
    await this.saveDataSources(filtered)
  }

  // Data Fetching
  async fetchData(dataSourceId: string, params?: any): Promise<any> {
    const dataSources = await this.getDataSources()
    const dataSource = dataSources.find(ds => ds.id === dataSourceId)
    
    if (!dataSource) {
      throw new Error('Data source not found')
    }

    // Fetch live data based on data source type and configuration
    return this.fetchLiveData(dataSource, params)
  }

  // Private Methods
  private async saveDashboards(dashboards: Dashboard[]): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(dashboards))
  }

  private async saveDataSources(dataSources: DataSource[]): Promise<void> {
    localStorage.setItem(this.dataSourcesKey, JSON.stringify(dataSources))
  }

  private getDefaultDashboards(): Dashboard[] {
    return [
      {
        id: 'default_appkit_overview',
        name: 'AppKit Overview',
        description: 'Main dashboard showing AppKit statistics and recent activity',
        isDefault: true,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z',
        components: [
          {
            id: 'comp_appkit_stats',
            type: 'stats',
            title: 'AppKit Statistics',
            dataSource: 'appkit_stats',
            config: { showTrends: true, layout: 'grid' },
            position: { x: 0, y: 0, w: 6, h: 4 }
          },
          {
            id: 'comp_activity_chart',
            type: 'chart',
            title: 'Activity Chart',
            dataSource: 'activity_data',
            config: { chartType: 'line', showLegend: true },
            position: { x: 6, y: 0, w: 6, h: 4 }
          },
          {
            id: 'comp_recent_content',
            type: 'table',
            title: 'Recent Content',
            dataSource: 'recent_content',
            config: { pageSize: 5, showPagination: false },
            position: { x: 0, y: 4, w: 12, h: 4 }
          }
        ]
      },
      {
        id: 'default_content_management',
        name: 'Content Management',
        description: 'Dashboard for managing AppKit content and media',
        isDefault: false,
        createdAt: '2024-01-16T00:00:00.000Z',
        updatedAt: '2024-01-18T00:00:00.000Z',
        components: [
          {
            id: 'comp_content_table',
            type: 'table',
            title: 'Content Library',
            dataSource: 'content_library',
            config: { pageSize: 10, sortable: true },
            position: { x: 0, y: 0, w: 12, h: 6 }
          },
          {
            id: 'comp_storage_usage',
            type: 'stats',
            title: 'Storage Usage',
            dataSource: 'storage_usage',
            config: { showTrends: true, format: 'bytes' },
            position: { x: 0, y: 6, w: 6, h: 3 }
          },
          {
            id: 'comp_media_gallery',
            type: 'gallery',
            title: 'Recent Media',
            dataSource: 'recent_media',
            config: { itemsPerRow: 4, showCaptions: true },
            position: { x: 6, y: 6, w: 6, h: 3 }
          }
        ]
      }
    ]
  }

  private getDefaultDataSources(): DataSource[] {
    return [
      {
        id: 'appkit_stats',
        name: 'AppKit Statistics',
        type: 'computed',
        config: { 
          metrics: ['totalFamilies', 'totalUsers', 'activeUsers', 'totalContent'],
          timeRange: '30d'
        }
      },
      {
        id: 'activity_data',
        name: 'Activity Data',
        type: 'computed',
        config: { 
          metrics: ['logins', 'contentViews', 'uploads', 'shares'],
          aggregation: 'daily'
        }
      },
      {
        id: 'recent_content',
        name: 'Recent Content',
        type: 'database',
        query: 'SELECT * FROM content ORDER BY created_at DESC LIMIT 10',
        config: { 
          fields: ['title', 'type', 'author', 'created_at', 'status'],
          refreshInterval: 300000 // 5 minutes
        }
      },
      {
        id: 'content_library',
        name: 'Content Library',
        type: 'database',
        query: 'SELECT * FROM content WHERE status = "published"',
        config: { 
          fields: ['title', 'type', 'author', 'created_at', 'views', 'status'],
          pagination: true,
          pageSize: 20
        }
      },
      {
        id: 'storage_usage',
        name: 'Storage Usage',
        type: 'computed',
        config: { 
          metrics: ['totalStorage', 'usedStorage', 'availableStorage'],
          format: 'bytes'
        }
      },
      {
        id: 'recent_media',
        name: 'Recent Media',
        type: 'database',
        query: 'SELECT * FROM media WHERE type IN ("image", "video") ORDER BY created_at DESC LIMIT 12',
        config: { 
          fields: ['filename', 'type', 'size', 'created_at', 'thumbnail_url'],
          includeThumbnails: true
        }
      },
      {
        id: 'user_engagement',
        name: 'User Engagement',
        type: 'computed',
        config: { 
          metrics: ['dailyActiveUsers', 'sessionDuration', 'pageViews', 'bounceRate'],
          timeRange: '7d'
        }
      },
      {
        id: 'active_users',
        name: 'Active Users',
        type: 'computed',
        config: { 
          metrics: ['onlineUsers', 'todayUsers', 'weekUsers', 'monthUsers'],
          realTime: true
        }
      }
    ]
  }

  private async fetchLiveData(dataSource: DataSource, params?: any): Promise<any> {
    try {
      // For API-type data sources, fetch from configured endpoint
      if (dataSource.type === 'api' && dataSource.endpoint) {
        const res = await fetch(dataSource.endpoint)
        if (res.ok) return res.json()
      }

      // For database/computed types, use admin API endpoints
      switch (dataSource.id) {
        case 'appkit_stats':
        case 'family_stats': {
          const res = await fetch('/api/admin/dashboard/stats')
          if (res.ok) return res.json()
          return { totalFamilies: 0, totalUsers: 0, activeUsers: 0, totalContent: 0 }
        }

        case 'activity_data': {
          const res = await fetch('/api/admin/dashboard/activity')
          if (res.ok) return res.json()
          return { labels: [], datasets: [] }
        }

        case 'recent_content':
        case 'content_library': {
          const res = await fetch('/api/admin/dashboard/content?limit=10')
          if (res.ok) return res.json()
          return []
        }

        case 'storage_usage': {
          const res = await fetch('/api/admin/dashboard/storage')
          if (res.ok) return res.json()
          return { totalStorage: 0, usedStorage: 0, availableStorage: 0, usagePercentage: 0 }
        }

        case 'recent_media': {
          const res = await fetch('/api/admin/files?type=media&limit=12')
          if (res.ok) return res.json()
          return []
        }

        case 'user_engagement': {
          const res = await fetch('/api/admin/dashboard/engagement')
          if (res.ok) return res.json()
          return { dailyActiveUsers: 0, sessionDuration: 0, pageViews: 0, bounceRate: 0 }
        }

        case 'active_users': {
          const res = await fetch('/api/admin/dashboard/active-users')
          if (res.ok) return res.json()
          return { onlineUsers: 0, todayUsers: 0, weekUsers: 0, monthUsers: 0 }
        }

        default:
          return { message: 'No data available for this data source' }
      }
    } catch (error) {
      console.error(`Error fetching data for ${dataSource.id}:`, error)
      return { message: 'Failed to fetch data', error: String(error) }
    }
  }
}

export const dashboardService = new DashboardService()

