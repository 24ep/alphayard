import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CoolIcon from '../common/CoolIcon';

interface MoodSummaryCardProps {
  mood: string;
  description: string;
  icon?: string;
  color?: string;
  onPress?: () => void;
}

export const MoodSummaryCard: React.FC<MoodSummaryCardProps> = ({
  mood,
  description,
  icon = 'Smile',
  color = '#B9FBC0', // Light green default from image
  onPress,
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[styles.container, { backgroundColor: color }]}
    >
      <View style={styles.content}>
        <Text style={styles.headerLabel}>Monthly Mood Summary</Text>
        <Text style={styles.moodTitle}>{mood}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      
      <View style={styles.iconContainer}>
         <CoolIcon name={icon} size={80} color="#1F2937" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 160,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingRight: 16,
    zIndex: 1,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(31, 41, 55, 0.7)', // #1F2937 with opacity
    lineHeight: 20,
    fontWeight: '500',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
    // Slightly rotated for style
    transform: [{ rotate: '-10deg' }],
  }
});
