import apiClient from './apiClient'

export interface MobileBranding {
  mobileAppName?: string
  logoUrl?: string
  iconUrl?: string
}

export async function fetchMobileBranding(): Promise<MobileBranding> {
  const res = await apiClient.get<{ branding: MobileBranding }>(`/mobile/branding`)
  return res?.data?.branding || {}
}


