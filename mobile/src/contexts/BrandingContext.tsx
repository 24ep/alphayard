import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchMobileBranding, MobileBranding } from '../services/api/branding'

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

  const refresh = async () => {
    try {
      const data = await fetchMobileBranding()
      setBranding(data)
    } catch {
      setBranding({})
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <BrandingContext.Provider value={{ ...branding, isLoaded, refresh }}>
      {children}
    </BrandingContext.Provider>
  )
}

export const useBranding = () => useContext(BrandingContext)


