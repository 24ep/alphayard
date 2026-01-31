import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CircleMoodSummaryProps {
  onPress: () => void;
  emotionData: any[];
}

export const CircleMoodSummary: React.FC<CircleMoodSummaryProps> = ({
  onPress,
  emotionData,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.text}>Circle Mood Summary</Text>
      <Text style={styles.subtext}>{emotionData.length} Data Points</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  subtext: {
    fontSize: 14,
    color: '#B45309',
    marginTop: 5,
  },
});
