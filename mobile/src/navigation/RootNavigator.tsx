import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
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
  const { isAuthenticated, isLoading, isOnboardingComplete, setNavigationRef } = useAuth();
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // Set navigation reference in AuthContext for programmatic navigation
    if (setNavigationRef) {
      setNavigationRef(navigationRef.current);
    }
  }, [setNavigationRef]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5A" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isAuthenticated ? (
          // User is authenticated - show main app with emotion check
          <Stack.Screen name="App">
            {() => (
              <EmotionCheckProvider>
                <AppNavigator />
              </EmotionCheckProvider>
            )}
          </Stack.Screen>
        ) : (
          // User is not authenticated - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
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