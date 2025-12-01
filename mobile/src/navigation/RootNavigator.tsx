import React, { useEffect, useRef } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { EmotionCheckProvider } from '../contexts/EmotionCheckContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isOnboardingComplete, setNavigationRef, forceUpdate, user } = useAuth();
  const navigationRef = useRef<any>(null);
  const [navKey, setNavKey] = React.useState(0);
  const prevAuthenticatedRef = React.useRef<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const hasResetRef = useRef(false);

  useEffect(() => {
    // Set navigation reference in AuthContext for programmatic navigation
    if (setNavigationRef && navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, [setNavigationRef]);

  // Force remount when authentication state changes
  useEffect(() => {
    const authChanged = prevAuthenticatedRef.current !== null && prevAuthenticatedRef.current !== isAuthenticated;
    
    if (authChanged) {
      console.log('[RootNavigator] Auth state changed from', prevAuthenticatedRef.current, 'to', isAuthenticated);
      console.log('[RootNavigator] User:', user?.email || 'none');
      
      // Reset the reset flag when auth state changes
      hasResetRef.current = false;
      
      // When transitioning from unauthenticated to authenticated, show loading briefly
      // to ensure clean navigation state
      if (isAuthenticated && !prevAuthenticatedRef.current) {
        setIsTransitioning(true);
        // Force a complete remount by changing the key
        setNavKey(prev => prev + 1);
        // Longer delay to ensure state is fully updated and navigation is ready
        setTimeout(() => {
          setIsTransitioning(false);
          // Force another key change to ensure clean remount
          setNavKey(prev => prev + 1);
        }, 300);
      } else {
        setNavKey(prev => prev + 1);
      }
    }
    
    prevAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, forceUpdate, user]);

  // Reset navigation when authenticated and navigation is ready
  // CRITICAL: This effect runs whenever authentication state changes
  useEffect(() => {
    console.log('[RootNavigator] useEffect triggered - isAuthenticated:', isAuthenticated, 'user:', user?.email || 'none', 'hasResetRef:', hasResetRef.current);
    
    if (isAuthenticated && user && user.id && user.email) {
      console.log('[RootNavigator] ✅ User is authenticated - preparing navigation reset');
      
      // Reset the flag if user changed
      if (hasResetRef.current && prevAuthenticatedRef.current !== isAuthenticated) {
        hasResetRef.current = false;
      }
      
      if (!hasResetRef.current && navigationRef.current?.isReady()) {
        console.log('[RootNavigator] 🔄 Resetting navigation to App route IMMEDIATELY');
        hasResetRef.current = true;
        
        // Multiple reset attempts to ensure it works
        const resetToApp = () => {
          if (navigationRef.current?.isReady()) {
            try {
              navigationRef.current.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'App' }],
                })
              );
              console.log('[RootNavigator] ✅ Navigation reset to App route completed');
            } catch (error) {
              console.error('[RootNavigator] Error resetting navigation:', error);
            }
          }
        };
        
        // Reset immediately
        resetToApp();
        
        // Reset again after delays to catch race conditions
        setTimeout(resetToApp, 50);
        setTimeout(resetToApp, 150);
        setTimeout(resetToApp, 300);
      } else if (!navigationRef.current?.isReady()) {
        console.log('[RootNavigator] ⏳ Navigation not ready yet, will reset when ready');
      }
    }
  }, [isAuthenticated, user, user?.id, user?.email, navKey, forceUpdate]);

  // Show loading screen while checking authentication or during transition
  if (isLoading || isTransitioning) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5A" />
        {__DEV__ && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#FF5A5A', fontSize: 12 }}>
              Loading... {isLoading ? 'Checking auth' : 'Transitioning'}
            </Text>
            <Text style={{ color: '#999', fontSize: 10, marginTop: 5 }}>
              isAuthenticated: {isAuthenticated ? 'true' : 'false'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  console.log('[RootNavigator] Rendering - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user?.email || 'none', 'user.id:', user?.id || 'none', 'navKey:', navKey, 'forceUpdate:', forceUpdate);
  console.log('[RootNavigator] User object check:', { 
    hasUser: !!user, 
    hasId: !!user?.id, 
    hasEmail: !!user?.email,
    isAuthenticated,
    isLoading,
    isTransitioning
  });

  // Use separate NavigationContainers to ensure complete state isolation
  // This prevents React Navigation from preserving any navigation state
  // CRITICAL: Triple check - user must exist, be authenticated, and not be loading
  const shouldShowAuthenticated = isAuthenticated && user && user.id && user.email && !isLoading && !isTransitioning;
  
  console.log('[RootNavigator] shouldShowAuthenticated:', shouldShowAuthenticated);
  
  if (shouldShowAuthenticated) {
    // CRITICAL: Only render authenticated navigator when we're absolutely sure user is authenticated
    // Add extra check to prevent any race conditions
    
    return (
      <>
        <NavigationContainer 
          ref={navigationRef}
          key={`authenticated-${navKey}-${user.id}`}
          onReady={() => {
            console.log('[RootNavigator] Authenticated NavigationContainer ready - FORCING APP ROUTE');
            // Multiple reset attempts to ensure we're on App route
            const resetToApp = () => {
              if (navigationRef.current?.isReady()) {
                try {
                  const currentState = navigationRef.current.getState();
                  const currentRoute = currentState?.routes[currentState?.index || 0];
                  console.log('[RootNavigator] Current route before reset:', currentRoute?.name);
                  
                  // Force reset regardless of current route
                  navigationRef.current.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'App' }],
                    })
                  );
                  console.log('[RootNavigator] ✅ FORCED reset to App route');
                } catch (error) {
                  console.error('[RootNavigator] Error resetting navigation:', error);
                }
              }
            };
            
            // Reset immediately
            resetToApp();
            
            // Reset again after a short delay to catch any race conditions
            setTimeout(resetToApp, 100);
            setTimeout(resetToApp, 300);
          }}
          onStateChange={(state) => {
            // Monitor navigation state changes and prevent Marketing route
            if (state) {
              const currentRoute = state.routes[state.index || 0];
              console.log('[RootNavigator] Navigation state changed to:', currentRoute?.name);
              
              // If somehow we're on Auth or Marketing route when authenticated, force reset
              if (currentRoute?.name === 'Auth' || currentRoute?.name === 'Marketing') {
                console.warn('[RootNavigator] ⚠️ Detected Auth/Marketing route when authenticated - FORCING RESET');
                if (navigationRef.current?.isReady()) {
                  navigationRef.current.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'App' }],
                    })
                  );
                }
              }
            }
          }}
        >
          <Stack.Navigator
            initialRouteName="App"
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
          >
            <Stack.Screen name="App">
              {() => (
                <EmotionCheckProvider>
                  <AppNavigator />
                </EmotionCheckProvider>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }

  // Only render AuthNavigator when NOT authenticated
  // CRITICAL: Only show AuthNavigator if we're absolutely sure user is NOT authenticated
  const shouldShowUnauthenticated = !isAuthenticated && !user && !isLoading && !isTransitioning;
  
  if (shouldShowUnauthenticated) {
    return (
      <>
        <NavigationContainer 
          ref={navigationRef}
          key={`unauthenticated-${navKey}`}
        >
          <Stack.Navigator
            initialRouteName="Auth"
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
          >
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }

  // Default: show loading
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF5A5A" />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;