import React from 'react';
import { TouchableOpacity } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface FloatingCreatePostButtonProps {
  visible: boolean;
  onPress: () => void;
}

export const FloatingCreatePostButton: React.FC<FloatingCreatePostButtonProps> = ({
  visible,
  onPress,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={homeStyles.floatingCreatePostButton}
      onPress={onPress}
    >
      <IconMC name="plus" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
};
