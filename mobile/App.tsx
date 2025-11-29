import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, View, Text, TouchableOpacity } from 'react-native';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { useFonts } from 'expo-font';
import {
  Montserrat_100Thin,
  Montserrat_200ExtraLight,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import RootNavigator from './src/navigation/RootNavigator';
import SplashBranding from './src/components/branding/SplashBranding';
import { AuthProvider } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { SocketProvider } from './src/contexts/SocketContext';
import { BrandingProvider } from './src/contexts/BrandingContext';
// Initialize react-i18next (basic strings)
import './src/i18n';
// Initialize app localization service (JSON locales, language switching)
import localizationService from './src/services/localizationService';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FA7272' }}>
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: 'white', padding: 15, borderRadius: 8 }}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={{ color: '#FA7272', fontSize: 16 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Create a theme using Montserrat fonts
const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  colors: {
    primary: {
      50: '#ffffff',
      100: '#FA7272',
      200: '#FA7272',
      300: '#FA7272',
      400: '#FA7272',
      500: '#FA7272',
      600: '#FA7272',
      700: '#FA7272',
      800: '#FA7272',
      900: '#FA7272',
    },
  },
  fonts: {
    heading: 'Montserrat',
    body: 'Montserrat',
    mono: Platform.select({ ios: 'Courier', android: 'monospace' }) || 'monospace',
  },
  // Using system fonts - no custom font configuration needed
});

const App: React.FC = () => {
  const [i18nReady, setI18nReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Montserrat_100Thin,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Montserrat: Montserrat_400Regular,
  });

  useEffect(() => {
    (async () => {
      try {
        await localizationService.initializeLocalization();
      } finally {
        setI18nReady(true);
      }
    })();
  }, []);

  // Brand-aware splash: wait for basic app (fonts/i18n) first; branding fetched inside BrandingProvider below
  if (!fontsLoaded || !i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log('🎉 App component rendering - Production Ready with Authentication');
  
  return (
    <ErrorBoundary>
      <NativeBaseProvider theme={theme}>
        <AuthProvider>
          <SocketProvider>
            <LocationProvider>
              <BrandingProvider>
                <NotificationProvider>
                  <StatusBar barStyle="light-content" backgroundColor="#FA7272" />
                  {/* Inline consumer to gate on branding load */}
                  {(() => {
                    const BrandingGate: React.FC = () => {
                      const BrandingCtx = require('./src/contexts/BrandingContext')
                      const { useBranding } = BrandingCtx
                      const { isLoaded, mobileAppName, logoUrl } = useBranding()
                      if (!isLoaded) {
                        return <SplashBranding appName={mobileAppName} logoUrl={logoUrl} />
                      }
                      return <RootNavigator />
                    }
                    return <BrandingGate />
                  })()}
                </NotificationProvider>
              </BrandingProvider>
            </LocationProvider>
          </SocketProvider>
        </AuthProvider>
      </NativeBaseProvider>
    </ErrorBoundary>
  );
};

export default App;