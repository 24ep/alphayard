'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { Dashboard } from '../components/Dashboard'
import { UserManagement } from '../components/UserManagement'
import { Localization } from '../components/Localization'
import { Settings } from '../components/Settings'
import { PagePreferences } from '../components/PagePreferences'
import { Families } from '../components/Families'
import { ContentManagerWrapper } from '../components/ContentManagerWrapper'
import { Notes } from '../components/Notes'
import { Safety } from '../components/Safety'
import { SocialMedia } from '../components/SocialMedia'
import { TicketManagement } from '../components/TicketManagement'
import { FamiliesList } from '../components/FamiliesList'
import { FamilyDetail } from '../components/FamilyDetail'
import { DashboardManagement } from '../components/DashboardManagement'
import { AuditLogs } from '../components/AuditLogs'
import { RolesPermissions } from '../components/RolesPermissions'
import { SecuritySettings } from '../components/SecuritySettings'
import { SSOSettings } from '../components/SSOSettings'
import { FeatureFlags } from '../components/FeatureFlags'
import { WebhooksMonitor } from '../components/WebhooksMonitor'
import { DataExport } from '../components/DataExport'
import { Backups } from '../components/Backups'
import { AlertsSettings } from '../components/AlertsSettings'
import { SystemHealth } from '../components/SystemHealth'
import { RateLimits } from '../components/RateLimits'
import { LocalizationManager } from '../components/LocalizationManager'
import { LoginForm } from '../components/LoginForm'
import { authService } from '../services/authService'
import { adminService } from '../services/adminService'

export default function Home() {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [studioMode, setStudioMode] = useState<'none' | 'create' | 'edit'>('none')
  const [studioId, setStudioId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null)
  const [showDashboardManagement, setShowDashboardManagement] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [familyCount, setFamilyCount] = useState<number>(0)
  const [safetyCount, setSafetyCount] = useState<number>(0)
  const [ticketCount, setTicketCount] = useState<number>(0)

  const handleFamilyClick = (familyId: string) => {
    setSelectedFamilyId(familyId)
    setActiveModule('families')
  }

  const handleBackToFamilies = () => {
    setSelectedFamilyId(null)
    setActiveModule('families')
  }

  const handleDashboardManagement = () => {
    setShowDashboardManagement(true)
  }

  const handleBackToMain = () => {
    setShowDashboardManagement(false)
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
  }

  useEffect(() => {
    // Parse URL params for module/studio routing
    const params = new URLSearchParams(window.location.search)
    const moduleParam = params.get('module')
    const studioParam = params.get('studio') as 'create' | 'edit' | null
    const idParam = params.get('id')

    if (moduleParam) setActiveModule(moduleParam)
    if (studioParam) {
      setStudioMode(studioParam)
      setStudioId(idParam)
    } else {
      setStudioMode('none')
      setStudioId(null)
    }
  }, [])

  useEffect(() => {
    // React when querystring changes (e.g., back/forward navigation)
    const onPop = () => {
      const params = new URLSearchParams(window.location.search)
      const moduleParam = params.get('module')
      const studioParam = params.get('studio') as 'create' | 'edit' | null
      const idParam = params.get('id')
      if (moduleParam) setActiveModule(moduleParam)
      setStudioMode(studioParam || 'none')
      setStudioId(idParam)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const clearStudio = () => {
    const params = new URLSearchParams(window.location.search)
    params.delete('studio')
    params.delete('id')
    const next = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({}, '', next)
    setStudioMode('none')
    setStudioId(null)
  }

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated()
      setIsAuthenticated(isAuth)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    // Fetch counts when authenticated
    const fetchCounts = async () => {
      if (isAuthenticated) {
        try {
          // Fetch family count
          const families = await adminService.getSocialMediaFamilies()
          setFamilyCount(families.length)

          // Fetch safety alerts count
          const safetyAlerts = await adminService.getSafetyAlertsCount()
          setSafetyCount(safetyAlerts)

          // Fetch tickets count
          const tickets = await adminService.getTicketsCount()
          setTicketCount(tickets)
        } catch (error) {
          console.error('Error fetching counts:', error)
          setFamilyCount(0)
          setSafetyCount(0)
          setTicketCount(0)
        }
      }
    }

    fetchCounts()
  }, [isAuthenticated])

  const renderModule = () => {
    // Handle dashboard management navigation
    if (showDashboardManagement) {
      return <DashboardManagement onBack={handleBackToMain} />
    }

    // Handle family detail navigation
    if (selectedFamilyId) {
      return <FamilyDetail familyId={selectedFamilyId} onBackToFamilies={handleBackToFamilies} />
    }

    switch (activeModule) {
      case 'dashboard':
        return <Dashboard onManageDashboards={handleDashboardManagement} />
      case 'users':
        return <UserManagement />
      case 'localization':
        return <Localization />
      case 'safety':
        return <Safety />
      case 'social':
        return <SocialMedia />
      case 'tickets':
        return <TicketManagement />
      case 'families':
        return <FamiliesList onFamilyClick={handleFamilyClick} />
      case 'audit-logs':
        return <AuditLogs />
      case 'roles-permissions':
        return <RolesPermissions />
      case 'security':
        return <SecuritySettings />
      case 'sso':
        return <SSOSettings />
      case 'feature-flags':
        return <FeatureFlags />
      case 'webhooks':
        return <WebhooksMonitor />
      case 'data-export':
        return <DataExport />
      case 'backups':
        return <Backups />
      case 'alerts':
        return <AlertsSettings />
      case 'health':
        return <SystemHealth />
      case 'rate-limits':
        return <RateLimits />
      case 'localization-manager':
        return <LocalizationManager />
      case 'dynamic-content':
        if (studioMode === 'create' || studioMode === 'edit') {
          // Render studio inside the app shell using the editor
          // Reuse the studio pages components for consistency
          // Lazy import not essential here; showing inline editor component instead
          return (
            <div className="min-h-screen bg-gray-50">
              <ContentManagerWrapper />
            </div>
          )
        }
        return <ContentManagerWrapper />
      case 'settings':
        return <Settings />
      case 'page-preferences':
        return <PagePreferences />
      default:
        return <Dashboard />
    }
  }

  const handleGlobalSearch = (query: string) => {
    console.log('Global search:', query)
    // Implement global search functionality
  }

  const handleFilterClick = () => {
    console.log('Global filters clicked')
    // Implement global filter functionality
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" role="status" aria-label="Loading application">
        <div className="macos-spinner w-12 h-12"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
        familyCount={familyCount}
        safetyCount={safetyCount}
        ticketCount={ticketCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onGlobalSearch={handleGlobalSearch}
          onFilterClick={handleFilterClick}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-6" role="main">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}