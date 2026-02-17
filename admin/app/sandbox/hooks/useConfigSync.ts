'use client'

import { useState, useEffect } from 'react'
import { LoginConfig } from '../../components/settings/LoginConfigTypes'

interface ConfigSyncState {
  config: Partial<LoginConfig> | null
  isLoading: boolean
  error: string | null
  lastSync: Date | null
  isLive: boolean
}

export function useConfigSync(configId?: string) {
  const [state, setState] = useState<ConfigSyncState>({
    config: null,
    isLoading: true,
    error: null,
    lastSync: null,
    isLive: false
  })

  // Load configuration from LoginConfigManager
  const loadConfig = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // In a real implementation, this would fetch from your API
      // For now, we'll simulate with a default config that matches LoginConfigManager
      const response = await fetch('/api/login-config/current')
      let config: Partial<LoginConfig>

      if (response.ok) {
        config = await response.json()
      } else {
        // Fallback to default configuration
        config = getDefaultConfig()
      }

      setState(prev => ({
        ...prev,
        config,
        isLoading: false,
        lastSync: new Date(),
        isLive: true
      }))
    } catch (error) {
      console.error('Failed to load config:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load configuration',
        isLoading: false,
        config: getDefaultConfig() // Fallback
      }))
    }
  }

  // Watch for configuration changes
  const watchConfig = () => {
    if (!state.isLive) return

    const eventSource = new EventSource('/api/login-config/watch')
    
    eventSource.onmessage = (event) => {
      try {
        const updatedConfig = JSON.parse(event.data)
        setState(prev => ({
          ...prev,
          config: updatedConfig,
          lastSync: new Date()
        }))
      } catch (error) {
        console.error('Failed to parse config update:', error)
      }
    }

    eventSource.onerror = () => {
      console.error('Config watch connection error')
      eventSource.close()
    }

    return () => eventSource.close()
  }

  // Apply configuration to emulator
  const applyToEmulator = (config: Partial<LoginConfig>) => {
    // This would sync the config to the LoginEmulator component
    // In a real implementation, this might use context or state management
    window.postMessage({
      type: 'CONFIG_UPDATE',
      payload: config
    }, '*')
  }

  // Validate configuration
  const validateConfig = (config: Partial<LoginConfig>) => {
    const errors: string[] = []

    // Validate required fields
    if (!config.branding?.appName) {
      errors.push('App name is required')
    }
    if (!config.branding?.primaryColor) {
      errors.push('Primary color is required')
    }
    if (!config.layout?.layout) {
      errors.push('Layout type is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Export configuration
  const exportConfig = () => {
    if (!state.config) return null

    const blob = new Blob([JSON.stringify(state.config, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `boundary-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import configuration
  const importConfig = async (file: File) => {
    const text = await file.text()
    
    try {
      const config = JSON.parse(text)
      const validation = validateConfig(config)
      
      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`)
      }

      setState(prev => ({
        ...prev,
        config,
        lastSync: new Date()
      }))

      // Apply to emulator
      applyToEmulator(config)

      return config
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Reset to default
  const resetToDefault = () => {
    const defaultConfig = getDefaultConfig()
    setState(prev => ({
      ...prev,
      config: defaultConfig,
      lastSync: new Date()
    }))
    applyToEmulator(defaultConfig)
  }

  useEffect(() => {
    loadConfig()
  }, [configId])

  useEffect(() => {
    if (state.isLive && state.config) {
      const cleanup = watchConfig()
      return cleanup
    }
  }, [state.isLive, state.config])

  return {
    ...state,
    loadConfig,
    applyToEmulator,
    validateConfig,
    exportConfig,
    importConfig,
    resetToDefault,
    refresh: loadConfig
  }
}

// Default configuration that matches LoginConfigManager structure
function getDefaultConfig(): Partial<LoginConfig> {
  return {
    branding: {
      appName: 'Boundary',
      logoUrl: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#10b981',
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      fontWeight: '400',
      logoSize: '64px',
      faviconUrl: '',
      metaDescription: '',
      metaKeywords: '',
      customCSS: '',
      customJS: '',
      showBranding: true,
      tagline: 'Secure access for your enterprise',
      description: '',
      ssoLogoUrl: '',
      ssoLogoSize: '20px',
      providerLogos: {}
    },
    layout: {
      layout: 'centered',
      maxWidth: '400px',
      padding: '2rem',
      borderRadius: '0.5rem',
      shadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      backdropBlur: false,
      showBranding: true,
      showFooter: true,
      footerText: '© 2024 Boundary. All rights reserved.',
      paddingTop: '2rem',
      paddingRight: '2rem',
      paddingBottom: '2rem',
      paddingLeft: '2rem',
      marginTop: '0',
      marginRight: '0',
      marginBottom: '0',
      marginLeft: '0',
      borderTopLeftRadius: '0.5rem',
      borderTopRightRadius: '0.5rem',
      borderBottomRightRadius: '0.5rem',
      borderBottomLeftRadius: '0.5rem',
      horizontalPosition: 'center',
      verticalPosition: 'center',
      useCustomPosition: false,
      buttonAlignment: 'center',
      buttonGroupLayout: 'vertical',
      buttonSpacing: 'medium',
      primaryButtonPosition: 'bottom',
      secondaryButtonPosition: 'top',
      showButtonDivider: true,
      cardFloat: 'none',
      cardZIndex: '10',
      cardTransform: '',
      stickyPosition: false,
      responsivePositioning: true,
      ssoIconOnly: false,
      ssoButtonShape: 'default'
    },
    form: {
      showEmailField: true,
      showUsernameField: false,
      showPhoneField: false,
      showCompanyField: false,
      showPasswordField: true,
      showRememberMe: true,
      showRememberDevice: false,
      showForgotPassword: true,
      showSocialLogin: true,
      showSSO: true,
      showLanguageSelector: false,
      showThemeToggle: false,
      showLoading: false,
      showErrors: false,
      showSuccessMessage: false,
      showValidation: false,
      showProgress: false,
      showCookieConsent: false,
      showPrivacyPolicy: false,
      showTermsOfService: false,
      showGDPR: false,
      showCompliance: false,
      showAccountLockoutWarning: false,
      showSessionTimeout: false,
      showSecurityQuestions: false,
      showBiometric: false,
      showKeyboardNavigation: false,
      showScreenReaderSupport: false,
      showHighContrast: false,
      showFontSizeControls: false,
      showMultiTenant: false,
      showRoleSelection: false,
      showWorkspaceSelection: false,
      showMoreSocialProviders: false,
      showSocialPreFill: false,
      showAccountLinking: false,
      emailPlaceholder: 'Enter your email',
      usernamePlaceholder: 'Username',
      phonePlaceholder: 'Phone number',
      companyPlaceholder: 'Company name',
      passwordPlaceholder: 'Enter your password',
      submitButtonText: 'Submit',
      signInButtonText: 'Sign In',
      signUpButtonText: 'Create Account',
      rememberMeText: 'Remember me',
      rememberDeviceText: 'Trust this device',
      forgotPasswordText: 'Forgot password?',
      signUpLinkText: 'Create account',
      signInLinkText: 'Sign in',
      buttonStyle: 'solid',
      buttonSize: 'medium',
      buttonBorderRadius: '0.5rem',
      buttonPadding: '0.75rem 1.5rem',
      showButtonIcons: true,
      buttonAnimation: '',
      buttonFullWidth: true,
      socialLoginText: 'Or continue with',
      ssoButtonText: 'Continue with SSO',
      loadingText: 'Loading...',
      errorMessage: 'An error occurred',
      successMessage: 'Success!',
      validationMessage: 'Please check your input',
      progressText: 'Processing...',
      cookieConsentText: 'This site uses cookies',
      privacyPolicyText: 'Privacy Policy',
      termsOfServiceText: 'Terms of Service',
      gdprText: 'GDPR compliant',
      complianceText: 'Compliance',
      accountLockoutText: 'Account locked',
      sessionTimeoutText: 'Session expired',
      securityQuestionsText: 'Security questions',
      biometricText: 'Biometric authentication',
      keyboardNavigationText: 'Keyboard navigation',
      screenReaderText: 'Screen reader support',
      highContrastText: 'High contrast',
      fontSizeText: 'Font size',
      multiTenantText: 'Select tenant',
      roleSelectionText: 'Select role',
      workspaceSelectionText: 'Select workspace',
      moreSocialProvidersText: 'More providers',
      socialPreFillText: 'Continue as',
      accountLinkingText: 'Link your account',
      sessionDuration: '3600',
      maxLoginAttempts: '5',
      supportedLanguages: ['en'],
      supportedThemes: ['light', 'dark'],
      socialProviders: ['Google', 'Microsoft', 'GitHub'],
      oauthProviders: ['google', 'microsoft'],
      ssoProviders: ['saml', 'oidc'],
      fontSizes: ['small', 'medium', 'large'],
      ssoLayout: 'vertical'
    },
    background: {
      type: 'solid',
      value: '#ffffff',
      opacity: 1,
      blur: 0,
      gradientStops: [],
      gradientDirection: 'to right',
      patternType: 'dots',
      patternColor: '#f3f4f6',
      patternSize: '20px',
      videoUrl: '',
      imageUrl: ''
    },
    security: {
      enableTwoFactor: false,
      enableCaptcha: false,
      enableRateLimit: true,
      enableSessionManagement: true,
      enablePasswordStrength: true,
      enableAccountLockout: false,
      enableAuditLog: false,
      enableEncryption: false,
      enableSecureCookies: false,
      enableCSRFProtection: false,
      enableXSSProtection: false,
      enableSQLInjectionProtection: false,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: false,
      twoFactorMethods: ['email', 'sms'],
      captchaProvider: 'recaptcha',
      encryptionAlgorithm: 'AES-256',
      securityHeaders: {}
    },
    animations: {
      showPageTransitions: false,
      showFormAnimations: false,
      showButtonAnimations: false,
      showInputAnimations: false,
      showLoadingAnimations: false,
      showErrorAnimations: false,
      showSuccessAnimations: false,
      showHoverAnimations: false,
      showFocusAnimations: false,
      pageTransitionType: 'fade',
      formAnimationType: 'slide',
      buttonAnimationType: 'pulse',
      inputAnimationType: 'fade',
      loadingAnimationType: 'spin',
      errorAnimationType: 'shake',
      successAnimationType: 'bounce',
      hoverAnimationType: 'scale',
      focusAnimationType: 'glow',
      animationDuration: 300,
      animationEasing: 'ease-in-out',
      animationDelay: 0,
      microInteractionType: 'none'
    },
    advanced: {
      enableDebugMode: false,
      enableAnalytics: false,
      enableLogging: false,
      enableCache: false,
      enableCDN: false,
      enableLazyLoading: false,
      enableServiceWorker: false,
      enableWebWorkers: false,
      enableWebSockets: false,
      enableServerSideRendering: false,
      enableStaticGeneration: false,
      enableIncrementalStaticRegeneration: false,
      enableEdgeFunctions: false,
      enableDatabaseOptimization: false,
      enableAPICaching: false,
      enableImageOptimization: false,
      enableFontOptimization: false,
      enableCSSOptimization: false,
      enableJSOptimization: false,
      enableHTMLOptimization: false,
      enableSEO: false,
      enableAccessibility: false,
      enablePerformance: false,
      enableSecurity: false,
      enableTesting: false,
      enableMonitoring: false,
      enableAlerting: false,
      enableBackup: false,
      enableRecovery: false,
      enableMigration: false,
      enableVersioning: false,
      enableDocumentation: false,
      customCSS: '',
      customJS: '',
      customHTML: '',
      environmentVariables: {},
      apiKeys: {},
      webhooks: [],
      integrations: []
    },
    desktop: {
      branding: {
        logoSize: '64px',
        fontSize: '16px',
        showBranding: true,
        ssoLogoSize: '20px'
      },
      layout: {
        maxWidth: '400px',
        padding: '2rem',
        borderRadius: '0.5rem',
        horizontalPosition: 'center',
        verticalPosition: 'center',
        positionX: '50%',
        positionY: '50%',
        useCustomPosition: false,
        buttonAlignment: 'center',
        buttonGroupLayout: 'vertical',
        buttonSpacing: 'medium',
        cardFloat: 'none',
        cardZIndex: '10',
        cardTransform: '',
        stickyPosition: false,
        ssoIconOnly: false,
        ssoButtonShape: 'default'
      },
      form: {
        showSocialLogin: true,
        showSSO: true,
        showRememberMe: true,
        showForgotPassword: true,
        showEmailField: true,
        showUsernameField: false,
        showPhoneField: false,
        showCompanyField: false,
        showPasswordField: true,
        buttonStyle: 'solid',
        buttonSize: 'medium',
        buttonFullWidth: true,
        buttonBorderRadius: '0.5rem',
        emailPlaceholder: 'Enter your email',
        passwordPlaceholder: 'Enter your password',
        signInButtonText: 'Sign In',
        rememberMeText: 'Remember me',
        forgotPasswordText: 'Forgot password?',
        socialLoginText: 'Or continue with',
        ssoButtonText: 'Continue with SSO',
        ssoLayout: 'vertical'
      },
      background: {
        type: 'solid',
        value: '#ffffff',
        opacity: 1,
        blur: 0,
        gradientStops: [],
        gradientDirection: 'to right',
        patternType: 'dots',
        patternColor: '#f3f4f6',
        patternSize: '20px',
        videoUrl: '',
        imageUrl: ''
      },
      responsive: {
        enableResponsiveConfig: false,
        breakpointMobile: '768px',
        breakpointTablet: '1024px',
        breakpointDesktop: '1280px'
      }
    },
    mobile: {
      branding: {
        logoSize: '48px',
        fontSize: '14px',
        showBranding: true,
        ssoLogoSize: '16px'
      },
      layout: {
        maxWidth: '100%',
        padding: '1.5rem',
        borderRadius: '0',
        horizontalPosition: 'center',
        verticalPosition: 'center',
        positionX: '50%',
        positionY: '50%',
        useCustomPosition: false,
        buttonAlignment: 'center',
        buttonGroupLayout: 'vertical',
        buttonSpacing: 'medium',
        cardFloat: 'none',
        cardZIndex: '10',
        cardTransform: '',
        stickyPosition: false,
        ssoIconOnly: false,
        ssoButtonShape: 'default'
      },
      form: {
        showSocialLogin: true,
        showSSO: true,
        showRememberMe: true,
        showForgotPassword: true,
        showEmailField: true,
        showUsernameField: false,
        showPhoneField: false,
        showCompanyField: false,
        showPasswordField: true,
        buttonStyle: 'solid',
        buttonSize: 'medium',
        buttonFullWidth: true,
        buttonBorderRadius: '0.5rem',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        signInButtonText: 'Sign In',
        rememberMeText: 'Remember me',
        forgotPasswordText: 'Forgot password?',
        socialLoginText: 'Or continue with',
        ssoButtonText: 'Continue with SSO',
        ssoLayout: 'vertical'
      },
      background: {
        type: 'solid',
        value: '#ffffff',
        opacity: 1,
        blur: 0,
        gradientStops: [],
        gradientDirection: 'to right',
        patternType: 'dots',
        patternColor: '#f3f4f6',
        patternSize: '20px',
        videoUrl: '',
        imageUrl: ''
      },
      responsive: {
        enableResponsiveConfig: false,
        breakpointMobile: '768px',
        breakpointTablet: '1024px',
        breakpointDesktop: '1280px'
      }
    },
    tablet: {
      branding: {
        logoSize: '56px',
        fontSize: '15px',
        showBranding: true,
        ssoLogoSize: '18px'
      },
      layout: {
        maxWidth: '480px',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        horizontalPosition: 'center',
        verticalPosition: 'center',
        positionX: '50%',
        positionY: '50%',
        useCustomPosition: false,
        buttonAlignment: 'center',
        buttonGroupLayout: 'vertical',
        buttonSpacing: 'medium',
        cardFloat: 'none',
        cardZIndex: '10',
        cardTransform: '',
        stickyPosition: false,
        ssoIconOnly: false,
        ssoButtonShape: 'default'
      },
      form: {
        showSocialLogin: true,
        showSSO: true,
        showRememberMe: true,
        showForgotPassword: true,
        showEmailField: true,
        showUsernameField: false,
        showPhoneField: false,
        showCompanyField: false,
        showPasswordField: true,
        buttonStyle: 'solid',
        buttonSize: 'medium',
        buttonFullWidth: true,
        buttonBorderRadius: '0.5rem',
        emailPlaceholder: 'Enter your email',
        passwordPlaceholder: 'Enter your password',
        signInButtonText: 'Sign In',
        rememberMeText: 'Remember me',
        forgotPasswordText: 'Forgot password?',
        socialLoginText: 'Or continue with',
        ssoButtonText: 'Continue with SSO',
        ssoLayout: 'vertical'
      },
      background: {
        type: 'solid',
        value: '#ffffff',
        opacity: 1,
        blur: 0,
        gradientStops: [],
        gradientDirection: 'to right',
        patternType: 'dots',
        patternColor: '#f3f4f6',
        patternSize: '20px',
        videoUrl: '',
        imageUrl: ''
      },
      responsive: {
        enableResponsiveConfig: false,
        breakpointMobile: '768px',
        breakpointTablet: '1024px',
        breakpointDesktop: '1280px'
      }
    },
    mobileApp: {
      branding: {
        logoSize: '48px',
        fontSize: '14px',
        showBranding: true,
        ssoLogoSize: '16px'
      },
      layout: {
        maxWidth: '100%',
        padding: '1rem',
        borderRadius: '0',
        horizontalPosition: 'center',
        verticalPosition: 'center',
        positionX: '50%',
        positionY: '50%',
        useCustomPosition: false,
        buttonAlignment: 'center',
        buttonGroupLayout: 'vertical',
        buttonSpacing: 'medium',
        cardFloat: 'none',
        cardZIndex: '10',
        cardTransform: '',
        stickyPosition: false,
        ssoIconOnly: false,
        ssoButtonShape: 'default'
      },
      form: {
        showSocialLogin: true,
        showSSO: true,
        showRememberMe: true,
        showForgotPassword: true,
        showEmailField: true,
        showUsernameField: false,
        showPhoneField: false,
        showCompanyField: false,
        showPasswordField: true,
        buttonStyle: 'solid',
        buttonSize: 'medium',
        buttonFullWidth: true,
        buttonBorderRadius: '0.5rem',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        signInButtonText: 'Sign In',
        rememberMeText: 'Remember me',
        forgotPasswordText: 'Forgot password?',
        socialLoginText: 'Or continue with',
        ssoButtonText: 'Continue with SSO',
        ssoLayout: 'vertical'
      },
      background: {
        type: 'solid',
        value: '#ffffff',
        opacity: 1,
        blur: 0,
        gradientStops: [],
        gradientDirection: 'to right',
        patternType: 'dots',
        patternColor: '#f3f4f6',
        patternSize: '20px',
        videoUrl: '',
        imageUrl: ''
      },
      responsive: {
        enableResponsiveConfig: false,
        breakpointMobile: '768px',
        breakpointTablet: '1024px',
        breakpointDesktop: '1280px'
      }
    },
    responsive: {
      enableResponsiveConfig: false,
      breakpointMobile: '768px',
      breakpointTablet: '1024px',
      breakpointDesktop: '1280px'
    },
    signup: {
      showNameField: true,
      showEmailField: true,
      showPhoneField: false,
      showCompanyField: false,
      showPasswordField: true,
      showConfirmPasswordField: true,
      showTermsCheckbox: true,
      showPrivacyCheckbox: true,
      namePlaceholder: 'Full name',
      emailPlaceholder: 'Email address',
      phonePlaceholder: 'Phone number',
      companyPlaceholder: 'Company name',
      passwordPlaceholder: 'Password',
      confirmPasswordPlaceholder: 'Confirm password',
      submitButtonText: 'Create Account',
      signInLinkText: 'Already have an account? Sign in',
      termsLinkText: 'Terms of Service',
      privacyLinkText: 'Privacy Policy',
      buttonStyle: 'solid',
      buttonSize: 'medium',
      buttonFullWidth: true,
      showSocialLogin: true,
      socialLoginText: 'Or sign up with',
      socialProviders: ['Google', 'Microsoft', 'GitHub'],
      pageTitle: 'Create Account',
      pageSubtitle: 'Join our platform today',
      pageDescription: '',
      logoUrl: '',
      logoSize: '64px',
      logoPosition: 'top',
      showWelcomeMessage: false,
      welcomeTitle: '',
      welcomeMessage: '',
      nextSteps: '',
      redirectAfterSignup: true,
      redirectUrl: '/dashboard',
      autoLogin: false,
      showSuccessAnimation: true,
      cardWidth: '400px',
      cardPadding: '2rem',
      borderRadius: '0.5rem',
      cardShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      cardBackground: '#ffffff',
      cardBorder: '1px solid #e5e7eb',
      formLayoutStyle: 'vertical',
      fieldSpacing: 'medium',
      fieldWidth: 'full',
      labelPosition: 'top',
      showFieldIcons: true,
      showFieldDescriptions: false,
      buttonPosition: 'bottom',
      buttonAlignment: 'center',
      buttonGroupLayout: 'vertical',
      buttonSpacing: 'medium',
      showButtonDivider: true,
      cardFloat: false,
      cardZIndex: '10',
      cardTransform: '',
      backdropBlur: false,
      stickyPosition: false,
      ssoLayout: 'vertical',
      ssoIconOnly: false,
      ssoButtonShape: 'default',
      enableValidation: true,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: false,
      validateEmailDomain: false,
      validatePhoneFormat: false,
      showBranding: true
    }
  }
}
