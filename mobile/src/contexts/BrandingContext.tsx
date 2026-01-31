import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchMobileBranding, MobileBranding } from '../services/api/branding'
import { analyticsService } from '../services/analytics/AnalyticsService'

interface BrandingContextValue extends MobileBranding {
  isLoaded: boolean
  refresh: () => Promise<void>
}

const BrandingContext = createContext<BrandingContextValue>({
  mobileAppName: undefined,
  logoUrl: undefined,
  iconUrl: undefined,
  isLoaded: false,
  refresh: async () => {}
})

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<MobileBranding>({})
  const [isLoaded, setIsLoaded] = useState(false)

  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem('branding_cache')
      if (cached) {
        const data = JSON.parse(cached)
        setBranding(data)
        // Mark as loaded if we have cache, so UI shows immediately
        setIsLoaded(true)
      }
    } catch (e) {
      console.log('Error loading branding cache:', e)
    }
  }

  const refresh = async () => {
    try {
      const data = await fetchMobileBranding()
      setBranding(data)
      // Cache the fresh data
      await AsyncStorage.setItem('branding_cache', JSON.stringify(data))
      
      // Update Analytics Service if config exists
      if (data.analytics) {
        analyticsService.updateConfig(data.analytics)
      }
    } catch {
      // If fetch fails, we stick with cache (if any) or empty object
      // If we haven't loaded cache yet, set empty
      if (!isLoaded) {
        setBranding({})
      }
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    // Stale-while-revalidate pattern
    const init = async () => {
      await loadFromCache() // 1. Load cache immediately
      await refresh()       // 2. Fetch fresh in background
    }
    init()
  }, [])

  return (
    <BrandingContext.Provider value={{ ...branding, isLoaded, refresh }}>
      {children}
    </BrandingContext.Provider>
  )
}

export const useBranding = () => useContext(BrandingContext)


