import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';

/**
 * Example screen showing how to navigate to the unified settings page
 * This can be integrated into your existing navigation structure
 */
const SettingsExample: React.FC = () => {
  const navigation = useNavigation();

  const navigateToSettings = () => {
    // Navigate to the unified settings screen
    (navigation as any).navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
        <Icon name="cog" size={24} color={colors.white[500]} />
        <Text style={styles.settingsButtonText}>Open Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsButtonText: {
    color: colors.white[500],
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsExample;
