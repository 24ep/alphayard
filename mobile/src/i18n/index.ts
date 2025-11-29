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
    'nav.family': 'Family',
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
    'ui.welcome.subtitle': 'Connect with your family safely',
    'ui.welcome.title': 'Welcome to Bondarys',
    // Additional missing keys
    'error': 'Error',
    'hourse.loadError': 'Failed to load family data',
    'hourse.updateError': 'Failed to update family',
    'hourse.addMemberError': 'Failed to add member',
    'hourse.brandingError': 'Failed to update branding',
    'success': 'Success',
    'hourse.updateSuccess': 'Family updated successfully',
    'hourse.addMemberSuccess': 'Member added successfully',
    'hourse.brandingSuccess': 'Branding updated successfully',
    // Profile and settings keys
    'profile.familySettingsSaved': 'Family settings saved successfully',
    'profile.familySettingsError': 'Failed to save family settings',
    'profile.familySettings': 'Family Settings',
    'profile.familySharing': 'Family Sharing',
    'profile.locationSharing': 'Location Sharing',
    'profile.locationSharingDesc': 'Share your location with family members',
    'profile.familyChat': 'Family Chat',
    'profile.familyChatDesc': 'Enable family group chat',
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