export interface DesignToken<T> {
  value: T
  label: string
  description?: string
}

export interface MobileThemeConfig {
  id?: string
  name?: string
  isDefault?: boolean
  foundation: {
    colors: {
      primary: DesignToken<string>
      secondary: DesignToken<string>
      accent: DesignToken<string>
      background: DesignToken<string>
      surface: DesignToken<string>
      error: DesignToken<string>
      success: DesignToken<string>
      text: {
        primary: DesignToken<string>
        secondary: DesignToken<string>
        inverse: DesignToken<string>
        muted: DesignToken<string>
      }
    }
    radius: {
      none: DesignToken<number>
      xs: DesignToken<number>
      sm: DesignToken<number>
      md: DesignToken<number>
      lg: DesignToken<number>
      xl: DesignToken<number>
      full: DesignToken<number>
    }
    spacing: {
      xs: DesignToken<number>
      sm: DesignToken<number>
      md: DesignToken<number>
      lg: DesignToken<number>
      xl: DesignToken<number>
    }
  }
  components: {
    button: {
      borderRadius: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
      padding: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    }
    card: {
      borderRadius: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
      padding: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    }
    input: {
      borderRadius: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
      padding: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    }
  }
}
