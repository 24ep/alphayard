import { API_BASE_URL } from '../config/api';

export interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
  is_default: boolean;
  flag_emoji?: string;
  created_at: string;
  updated_at: string;
}

export interface Translation {
  [key: string]: string;
}

export interface TranslationKey {
  id: string;
  key: string;
  category: string;
  description?: string;
  context?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class LocalizationService {
  private baseUrl = `${API_BASE_URL}/cms/localization`;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes for translations
  private currentLanguage: string = 'en';
  private translations: Translation = {};
  private fallbackTranslations: Translation = {};

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getLanguages(): Promise<Language[]> {
    const cacheKey = 'languages';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/languages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const languages = data.languages || [];
      this.setCachedData(cacheKey, languages);
      return languages;
    } catch (error) {
      console.error('Error fetching languages:', error);
      return this.getFallbackLanguages();
    }
  }

  async getTranslationsForLanguage(languageCode: string): Promise<Translation> {
    const cacheKey = `translations-${languageCode}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/translations/${languageCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const translations = data.translations || {};
      this.setCachedData(cacheKey, translations);
      return translations;
    } catch (error) {
      console.error('Error fetching translations:', error);
      return this.getFallbackTranslations();
    }
  }

  async setLanguage(languageCode: string): Promise<void> {
    try {
      this.currentLanguage = languageCode;
      this.translations = await this.getTranslationsForLanguage(languageCode);
      
      // Store in localStorage for persistence
      localStorage.setItem('selectedLanguage', languageCode);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }

  async initializeLocalization(): Promise<void> {
    try {
      // Get saved language from localStorage
      const savedLanguage = localStorage.getItem('selectedLanguage');
      const languageCode = savedLanguage || 'en';
      
      // Initialize with fallback translations first
      this.translations = this.getFallbackTranslations();
      this.fallbackTranslations = this.getFallbackTranslations();
      this.currentLanguage = languageCode;
      
      // Try to fetch from API, but don't fail if it doesn't work
      try {
        const apiTranslations = await this.getTranslationsForLanguage(languageCode);
        if (Object.keys(apiTranslations).length > 0) {
          this.translations = apiTranslations;
        }
      } catch (apiError) {
        console.warn('API translations not available, using fallback:', apiError);
        // Keep using fallback translations
      }
    } catch (error) {
      console.error('Error initializing localization:', error);
      // Ensure we always have fallback translations
      this.translations = this.getFallbackTranslations();
      this.fallbackTranslations = this.getFallbackTranslations();
    }
  }

  t(key: string, variables?: Record<string, string | number>): string {
    let translation = this.translations[key] || this.fallbackTranslations[key] || `No translation found: ${key}`;
    
    // Replace variables in translation
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        translation = translation.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
      });
    }
    
    return translation;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getCurrentTranslations(): Translation {
    return this.translations;
  }

  // Get translation with pluralization support
  tPlural(key: string, count: number, variables?: Record<string, string | number>): string {
    const pluralKey = `${key}_${count === 1 ? 'one' : 'other'}`;
    return this.t(pluralKey, { ...variables, count });
  }

  // Get translation with context
  tWithContext(key: string, context: string, variables?: Record<string, string | number>): string {
    const contextKey = `${key}.${context}`;
    return this.t(contextKey, variables) || this.t(key, variables);
  }

  // Format date according to locale
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleDateString();
    }
  }

  // Format number according to locale
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    try {
    return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  }

  // Format currency according to locale
  formatCurrency(amount: number, currency: string = 'USD', options?: Intl.NumberFormatOptions): string {
    try {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency,
        ...options
    }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency} ${amount}`;
    }
  }

  // Get text direction
  getTextDirection(): 'ltr' | 'rtl' {
    const language = this.getCurrentLanguage();
    // RTL languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  }

  // Check if language is RTL
  isRTL(): boolean {
    return this.getTextDirection() === 'rtl';
  }

  // Get language name in native script
  getNativeLanguageName(languageCode: string): string {
    const languages = this.getCachedData('languages') || [];
    const language = languages.find((lang: Language) => lang.code === languageCode);
    return language?.native_name || languageCode;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Clear cache for specific language
  clearCacheFor(languageCode: string): void {
    this.cache.delete(`translations-${languageCode}`);
  }

  // Get supported languages (alias for getLanguages)
  async getSupportedLanguages(): Promise<Language[]> {
    return this.getLanguages();
  }

  // Get configuration
  getConfig(): { defaultLanguage: string; autoDetect: boolean } {
    return {
      defaultLanguage: this.currentLanguage,
      autoDetect: false // This could be made configurable
    };
  }

  // Validate translations
  validateTranslations(): Record<string, string[]> {
    // This is a simplified implementation
    // In a real app, you'd compare against a master translation file
    return {};
  }

  // Get all translation keys
  getAllTranslationKeys(): string[] {
    return Object.keys(this.translations);
  }

  // Update configuration
  updateConfig(config: { autoDetect?: boolean }): void {
    // This could be expanded to handle more configuration options
    console.log('Config updated:', config);
  }

  // Add language (for admin functionality)
  async addLanguage(language: Language, translations: Translation): Promise<void> {
    // This would typically make an API call to add a new language
    console.log('Adding language:', language, translations);
  }

  // Remove language (for admin functionality)
  async removeLanguage(languageCode: string): Promise<void> {
    // This would typically make an API call to remove a language
    console.log('Removing language:', languageCode);
  }

  // Export translations
  exportTranslations(languageCode: string): Translation {
    return this.translations;
  }

  // Import translations
  importTranslations(languageCode: string, translations: Translation): void {
    this.translations = translations;
  }

  // Get fallback languages
  private getFallbackLanguages(): Language[] {
    return [
      {
        id: '1',
        code: 'en',
        name: 'English',
        native_name: 'English',
        direction: 'ltr',
        is_active: true,
        is_default: true,
        flag_emoji: '🇺🇸',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Get fallback translations
  private getFallbackTranslations(): Translation {
    return {
      // Auth translations
      'auth.forgot_password': 'Forgot Password?',
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.register': 'Register',
      'auth.reset_password': 'Reset Password',
      
      // Error translations
      'error.generic': 'Something went wrong. Please try again.',
      'error.network': 'Network error. Please check your connection.',
      'error.validation': 'Please check your input and try again.',
      
      // Navigation translations
      'nav.calendar': 'Calendar',
      'nav.chat': 'Chat',
      'nav.circle': 'Circle',
      'nav.home': 'Home',
      'nav.location': 'Location',
      'nav.notes': 'Notes',
      'nav.profile': 'Profile',
      'nav.safety': 'Safety',
      'nav.settings': 'Settings',
      'nav.todos': 'Todos',
      
      // Success translations
      'success.deleted': 'Data deleted successfully',
      'success.saved': 'Data saved successfully',
      
      // UI Button translations
      'ui.button.back': 'Back',
      'ui.button.cancel': 'Cancel',
      'ui.button.delete': 'Delete',
      'ui.button.edit': 'Edit',
      'ui.button.next': 'Next',
      'ui.button.previous': 'Previous',
      'ui.button.save': 'Save',
      'ui.button.submit': 'Submit',
      
      // UI Welcome translations
      'ui.welcome.subtitle': 'Connect with your circle safely',
      'ui.welcome.title': 'Welcome to Bondarys',
      
      // Additional fallback translations
      'ui.button.add': 'Add',
      'ui.button.close': 'Close',
      'marketing.slide1.title': 'Stay Connected',
      'marketing.slide1.subtitle': 'With Your Circle',
      'marketing.slide1.description': 'Keep your loved ones close with real-time location sharing, instant messaging, and circle updates.',
      'marketing.slide1.feature1': 'Real-time location tracking',
      'marketing.slide1.feature2': 'Instant circle messaging',
      'marketing.slide1.feature3': 'Safety alerts & notifications',
      'error.network.title': 'Connection Error',
      'error.network.message': 'Please check your internet connection and try again.',
      'error.auth.title': 'Authentication Error',
      'error.auth.message': 'Please log in again to continue.',
      'error.validation.title': 'Validation Error',
      'error.validation.message': 'Please check your input and try again.',
      'success.save.title': 'Saved Successfully',
      'success.save.message': 'Your changes have been saved.',
      'success.delete.title': 'Deleted Successfully',
      'success.delete.message': 'The item has been deleted.',
      'modal.welcome.title': 'Welcome to Bondarys!',
      'modal.welcome.message': 'Get started with your circle safety network.',
      'modal.welcome.button': 'Get Started',
      'modal.feature.title': 'New Feature Available',
      'modal.feature.message': 'Check out our latest safety features!',
      // Additional missing keys
      'error': 'Error',
      'Circle.loadError': 'Failed to load circle data',
      'Circle.updateError': 'Failed to update circle',
      'Circle.addMemberError': 'Failed to add member',
      'Circle.brandingError': 'Failed to update branding',
      'success': 'Success',
      'Circle.updateSuccess': 'Circle updated successfully',
      'Circle.addMemberSuccess': 'Member added successfully',
      'Circle.brandingSuccess': 'Branding updated successfully',
      // Profile and settings keys
      'profile.circleSettingsSaved': 'Circle settings saved successfully',
      'profile.circleSettingsError': 'Failed to save circle settings',
      'profile.circleSettings': 'Circle Settings',
      'profile.circleSharing': 'Circle Sharing',
      'profile.locationSharing': 'Location Sharing',
      'profile.locationSharingDesc': 'Share your location with circle members',
      'profile.circleChat': 'Circle Chat',
      'profile.circleChatDesc': 'Enable circle group chat',
      'profile.emergencyAlerts': 'Emergency Alerts',
      'cancel': 'Cancel',
      'loading': 'Loading...'
    };
  }
}

export default new LocalizationService();
