import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface AttentionCardProps {
  itemCount: number;
  onPress: () => void;
}

export const AttentionCard: React.FC<AttentionCardProps> = ({
  itemCount,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={homeStyles.attentionCardLine}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#FFB6C1', '#FF6B6B', '#E5E7EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={homeStyles.attentionCardGradient}
      >
        <View style={homeStyles.attentionCardLineLeft}>
          <View style={homeStyles.attentionCardLineIcon}>
            <IconMC name="bell-alert" size={24} color="#FFFFFF" />
          </View>
          <View style={homeStyles.attentionCardLineContent}>
            <Text style={homeStyles.attentionCardLineTitle}>Attention List</Text>
            <Text style={homeStyles.attentionCardLineSubtitle}>
              {itemCount} items need your attention
            </Text>
          </View>
        </View>
        <View style={homeStyles.attentionCardLineRight}>
          <View style={homeStyles.attentionCardLineBadge}>
            <Text style={homeStyles.attentionCardLineBadgeText}>{itemCount}</Text>
          </View>
          <IconMC name="chevron-right" size={20} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
