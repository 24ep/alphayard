import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';

import EmotionCheckInScreen from '../screens/main/EmotionCheckInScreen';
import MoodAnalysisScreen from '../screens/main/MoodAnalysisScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import ChatSettingsScreen from '../screens/chat/ChatSettingsScreen';
import { TransitionPresets } from '@react-navigation/stack';

export type AppStackParamList = {
  MainApp: undefined;

  EmotionCheckIn: { date: string };
  MoodAnalysis: undefined;
  ChatList: undefined;
  Notifications: undefined;
  ChatRoom: { chatId: string; chatName: string };
  ChatSettings: { chatId: string };
};

const Stack = createStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainApp"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="MainApp" component={MainTabNavigator} />

      <Stack.Screen
        name="EmotionCheckIn"
        component={EmotionCheckInScreen}
        options={{
          presentation: 'card',
          animationEnabled: true,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen name="MoodAnalysis" component={MoodAnalysisScreen} />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen as any}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name="ChatSettings"
        component={ChatSettingsScreen as any}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
