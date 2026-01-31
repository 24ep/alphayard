import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { brandColors } from '../../theme/colors';

interface AIAgentWidgetProps {
  onPress?: () => void;
}

const AIAgentWidget: React.FC<AIAgentWidgetProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconMC name="robot" size={24} color="#FFFFFF" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>Ask me anything about your Circle</Text>
        </View>
        
        <IconMC name="chevron-right" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: brandColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default AIAgentWidget; 
