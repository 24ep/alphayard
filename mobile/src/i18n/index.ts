import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import localizationService from '../services/localizationService';

// CMS-driven localization configuration
// This now uses the localizationService to fetch translations
// from the CMS database instead of static JSON files

// Default fallback translations (minimal set)
const fallbackTranslations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      retry: 'Retry',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      done: 'Done'
    },
    // Include all the database translations as fallback
    'auth.forgot_password': 'Forgot Password?',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.reset_password': 'Reset Password',
    'error.generic': 'Something went wrong. Please try again.',
    'error.network': 'Network error. Please check your connection.',
    'error.validation': 'Please check your input and try again.',
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
    'success.deleted': 'Data deleted successfully',
    'success.saved': 'Data saved successfully',
    'ui.button.back': 'Back',
    'ui.button.cancel': 'Cancel',
    'ui.button.delete': 'Delete',
    'ui.button.edit': 'Edit',
    'ui.button.next': 'Next',
    'ui.button.previous': 'Previous',
    'ui.button.save': 'Save',
    'ui.button.submit': 'Submit',
    'ui.welcome.subtitle': 'Connect with your circle safely',
    'ui.welcome.title': 'Welcome to Bondarys',
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
  }
};

// Initialize i18n with fallback resources
i18n
  .use(initReactI18next)
  .init({
    resources: fallbackTranslations,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    // Disable dynamic loading for now to use fallback translations
    load: 'languageOnly',
    // Add custom resource loading
    backend: {
      loadPath: async (lng: string) => {
        try {
          // Load translations from CMS
          const translations = await localizationService.getTranslationsForLanguage(lng);
          return translations;
        } catch (error) {
          console.warn(`Failed to load translations for ${lng}:`, error);
          return fallbackTranslations.en;
        }
      }
    },
    // Ensure fallback translations are always available
    saveMissing: false,
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`Missing translation key: ${key} for language: ${lng}`);
    }
  });

// Initialize CMS localization when app starts
localizationService.initializeLocalization().then(() => {
  console.log('[SUCCESS] CMS Localization initialized');
}).catch((error) => {
  console.warn('[WARN] CMS Localization initialization failed:', error);
});

export default i18n;
