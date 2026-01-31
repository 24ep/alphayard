import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { PinProvider } from './src/contexts/PinContext';
import { SocketProvider } from './src/contexts/SocketContext';
import { MainContentProvider } from './src/contexts/MainContentContext';
import { UserDataProvider } from './src/contexts/UserDataContext';
import { CircleProvider } from './src/contexts/CircleContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { BrandingProvider } from './src/contexts/BrandingContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NativeBaseProvider, extendTheme } from 'native-base';
import RootNavigator from './src/navigation/RootNavigator';
import { useFonts } from 'expo-font';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { theme } from './src/styles/theme';
import appConfigService from './src/services/appConfigService';
import analyticsService from './src/services/analytics/AnalyticsService';

const nativeBaseTheme = extendTheme({
  fontConfig: {
    Inter: {
      300: { normal: 'Inter_300Light' },
      400: { normal: 'Inter_400Regular' },
      500: { normal: 'Inter_500Medium' },
      600: { normal: 'Inter_600SemiBold' },
      700: { normal: 'Inter_700Bold' },
    },
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'Courier',
  },
  colors: theme.colors,
});

const App = () => {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 App Starting... Fetching config');
        const config = await appConfigService.getAppConfig();
        const settings = config.configuration?.settings || {};
        
        // Initialize Analytics
        if (settings.google_analytics_id) {
          analyticsService.updateConfig({
            googleAnalyticsId: settings.google_analytics_id,
            enableDebugLogs: true // Defaulting to true for visibility now
          });
        }
      } catch (error) {
        console.error('Failed to initialize app config:', error);
      }
    };

    initApp();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider theme={nativeBaseTheme}>
        <SafeAreaProvider>
          <BrandingProvider>
            <LanguageProvider>
              <ThemeProvider>
                <NotificationProvider>
                  <AuthProvider>
                    <PinProvider>
                      <SocketProvider>
                        <MainContentProvider>
                          <UserDataProvider>
                            <CircleProvider>
                              <RootNavigator />
                            </CircleProvider>
                          </UserDataProvider>
                        </MainContentProvider>
                      </SocketProvider>
                    </PinProvider>
                  </AuthProvider>
                </NotificationProvider>
              </ThemeProvider>
            </LanguageProvider>
          </BrandingProvider>
        </SafeAreaProvider>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
};

export default App;
