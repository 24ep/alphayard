# Unified Settings Page

This directory contains a comprehensive, unified settings page that combines all application settings into a single, well-structured interface.

## Overview

The `UnifiedSettingsPage` component consolidates all the different settings components that were previously scattered across the application into one cohesive interface. This provides a better user experience and easier maintenance.

## Components

### UnifiedSettingsPage.tsx
The main unified settings component that combines:
- **Account Settings**: Notifications, Privacy, hourse Settings, Subscription
- **App Preferences**: Language, Theme, Font Size, Haptic Feedback, Sound Effects
- **Data & Storage**: Auto Backup, Data Usage, Download Data, Clear Cache
- **Support & Help**: Help, About, Rate App, Report Bug
- **Account Actions**: Logout, Delete Account

### SettingsScreen.tsx
A screen wrapper that integrates the unified settings page with navigation and authentication.

### SettingsExample.tsx
An example showing how to navigate to the settings page from other parts of the app.

## Features

### 🎯 **Comprehensive Settings Management**
- All settings in one place
- Organized into logical sections
- Consistent UI/UX across all settings

### 🔔 **Notification Settings**
- Master controls for push, email, and SMS notifications
- Granular controls for hourse, safety, social, and system notifications
- Important notifications highlighted

### 🔒 **Privacy Settings**
- Profile visibility controls
- Location and activity sharing
- Communication preferences
- Data and analytics settings
- Data management actions

### 👨‍👩‍👧‍👦 **hourse Settings**
- hourse sharing controls
- Feature-specific toggles
- Privacy notes and information

### 🌐 **Language Settings**
- Multi-language support
- Translation progress indicators
- Language preview functionality
- Auto-detect language option

### ⚙️ **App Preferences**
- Theme selection (Light/Dark/Auto)
- Font size adjustment
- Haptic feedback controls
- Sound effects settings

### 💾 **Data & Storage**
- Auto-backup settings
- Data usage controls
- Data download functionality
- Cache management

### 🆘 **Support & Help**
- Help documentation access
- About app information
- App rating functionality
- Bug reporting

### 👤 **Account Management**
- Secure logout functionality
- Account deletion with confirmation
- Subscription management

## Usage

### Basic Integration

```tsx
import { UnifiedSettingsPage } from '../components/settings/UnifiedSettingsPage';

const MyScreen = () => {
  const handleLogout = async () => {
    // Handle logout logic
  };

  const handleDeleteAccount = () => {
    // Handle account deletion logic
  };

  return (
    <UnifiedSettingsPage
      onBack={() => navigation.goBack()}
      onLogout={handleLogout}
      onDeleteAccount={handleDeleteAccount}
    />
  );
};
```

### Navigation Integration

```tsx
// In your navigation stack
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createStackNavigator();

<Stack.Screen 
  name="Settings" 
  component={SettingsScreen}
  options={{ title: 'Settings' }}
/>
```

### From Other Screens

```tsx
import { useNavigation } from '@react-navigation/native';

const SomeScreen = () => {
  const navigation = useNavigation();
  
  const openSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <TouchableOpacity onPress={openSettings}>
      <Text>Open Settings</Text>
    </TouchableOpacity>
  );
};
```

## Customization

### Adding New Settings Sections

To add a new settings section, modify the `UnifiedSettingsPage.tsx`:

1. Add the new section to the `renderSettingsSection` calls
2. Define the settings state and handlers
3. Add the section items with appropriate icons and actions

### Modifying Existing Settings

Each settings section is modular and can be easily modified:

- **Icons**: Change MaterialCommunityIcons names
- **Colors**: Update using the theme color system
- **Actions**: Modify the onPress handlers
- **Layout**: Adjust the section structure

### Styling

The component uses a consistent design system:
- **Colors**: Imported from `../../theme/colors`
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized padding and margins
- **Shadows**: Subtle elevation for cards

## State Management

The component manages state for:
- Notification preferences
- Privacy settings
- hourse settings
- App preferences
- Subscription information

All settings are persisted and can be integrated with your preferred state management solution (Redux, Context API, etc.).

## Accessibility

The unified settings page includes:
- Proper accessibility labels
- Touch target sizes (minimum 44x44 points)
- High contrast support
- Screen reader compatibility

## Performance

- Lazy loading of modal components
- Optimized re-renders
- Efficient state updates
- Minimal bundle size impact

## Future Enhancements

Potential improvements:
- Search functionality within settings
- Settings backup and restore
- Settings import/export
- Advanced customization options
- Settings analytics

## Dependencies

- React Native
- React Navigation
- React Native Vector Icons
- React i18next (for translations)
- Custom theme system

## Support

For questions or issues with the unified settings page, please refer to the main application documentation or contact the development team.
