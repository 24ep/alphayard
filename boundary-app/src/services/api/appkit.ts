import { AppKit } from '@alphayard/appkit';
import { API_CONFIG } from '../../constants/app';

// Initialize AppKit SDK
// Pointing directly to AppKit Server
export const appkit = new AppKit({
  clientId: 'boundary-mobile-app',
  baseURL: '',
  domain: process.env.EXPO_PUBLIC_APPKIT_DOMAIN || 'https://appkits.up.railway.app',
  storage: 'localStorage',
});

export default appkit;
