import apiClient from './apiClient'

export interface MobileBranding {
  mobileAppName?: string
  logoUrl?: string
  iconUrl?: string
  analytics?: {
    sentryDsn?: string
    mixpanelToken?: string
    enableDebugLogs?: boolean
  }
  legal?: {
    privacyPolicyUrl?: string
    termsOfServiceUrl?: string
    cookiePolicyUrl?: string
    dataDeletionUrl?: string
    dataRequestEmail?: string
  }
  screens?: ScreenConfig[]
  categories?: CategoryConfig[]
  flows?: FlowsConfig
}

export interface AuthFlowConfig {
  requireEmailVerification: boolean
  allowSocialLogin: boolean
  termsAcceptedOn: 'signup' | 'login' | 'both'
  passwordPolicy: 'standard' | 'strong' | 'custom'
}

export interface FlowsConfig {
  onboarding?: any
  survey?: any
  login?: AuthFlowConfig
  signup?: AuthFlowConfig
}

export interface ScreenConfig {
  id: string
  name: string
  background: string | ColorValue
  resizeMode: 'cover' | 'contain' | 'stretch' | 'center'
  description?: string
}


export interface MobileComponentConfig {
    componentName: string;
    filePath: string;
    usageExample?: string;
}

export interface ComponentStyle {
  backgroundColor: ColorValue
  textColor: ColorValue
  borderRadius: number
  borderColor: ColorValue
  shadowLevel: 'none' | 'sm' | 'md' | 'lg' | 'custom'
  shadowOffsetY?: number
  borderWidth?: number
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number
  opacity?: number
  padding?: number
  clickAnimation?: 'none' | 'scale' | 'opacity' | 'pulse'
}

export interface ComponentConfig {
  id: string
  name: string
  styles: ComponentStyle
  mobileConfig?: MobileComponentConfig
  config?: any
}

export interface CategoryConfig {
  id: string
  name: string
  description?: string
  icon: string
  components: ComponentConfig[]
}

export interface ColorValue {
  mode: 'solid' | 'gradient' | 'image' | 'video'
  solid?: string
  gradient?: {
    type: 'linear' | 'radial'
    angle?: number
    stops: {
      id: string
      color: string
      position: number
    }[]
  }
  image?: string
  video?: string
}

export async function fetchMobileBranding(): Promise<MobileBranding> {
  try {
    const res = await (apiClient.get<any>(`/mobile/branding`) as any)
    return res?.branding || {}
  } catch (error: any) {
    // Handle 404 gracefully - endpoint may not exist yet
    if (error?.code === 'NOT_FOUND' || error?.response?.status === 404) {
      // Endpoint doesn't exist yet - return empty object silently
      return {}
    }
    // Only log unexpected errors
    if (error?.code !== 'UNAUTHORIZED' && error?.response?.status !== 401) {
      console.error('Error fetching mobile branding:', error)
    }
    return {}
  }
}


