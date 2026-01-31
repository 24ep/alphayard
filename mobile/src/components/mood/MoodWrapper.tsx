import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MoodSummaryCard } from './MoodSummaryCard';

interface MoodWrapperProps {
  onGoToMoodAnalyst?: () => void;
}

export const MoodWrapper: React.FC<MoodWrapperProps> = ({ onGoToMoodAnalyst }) => {
  // TODO: Fetch real user mood summary
  const mockData = {
    mood: 'Happy',
    description: "You're feeling calm and optimistic. Keep up the good vibes!",
    color: '#B9FBC0',
    icon: 'emoticon-happy-outline'
  };

  return (
    <View style={styles.container}>
      <MoodSummaryCard
        mood={mockData.mood}
        description={mockData.description}
        color={mockData.color}
        icon={mockData.icon}
        onPress={onGoToMoodAnalyst}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 20, // Handled by YouTab
  }
});
