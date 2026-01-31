import React from 'react';
import { TouchableOpacity } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

import { useBranding } from '../../contexts/BrandingContext';

interface FloatingCreatePostButtonProps {
  visible: boolean;
  onPress: () => void;
}

const resolveColor = (colorValue: any, defaultColor: string) => {
  if (!colorValue) return defaultColor;
  return colorValue.solid || defaultColor;
};

export const FloatingCreatePostButton: React.FC<FloatingCreatePostButtonProps> = ({
  visible,
  onPress,
}) => {
  const { categories } = useBranding();

  const componentConfig = React.useMemo(() => {
    if (!categories) return null;
    for (const cat of categories) {
        const comp = cat.components.find(c => c.id === 'fab-action');
        if (comp) return comp;
    }
    return null;
  }, [categories]);

  const brandingStyles = componentConfig?.styles;
  const config = componentConfig?.config || {};

  const bgColor = resolveColor(brandingStyles?.backgroundColor, '#6366F1'); 
  const iconColor = resolveColor(brandingStyles?.textColor, '#FFFFFF');
  
  // Specific config
  const size = config.buttonSize || 56;
  const bottom = config.bottomOffset ?? 24;
  const right = config.rightOffset ?? 24;
  const iconSize = config.iconSize || 28;

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[
        homeStyles.floatingCreatePostButton, 
        { 
            backgroundColor: bgColor,
            width: size,
            height: size,
            borderRadius: size / 2,
            bottom: bottom,
            right: right
        }
      ]}
      onPress={onPress}
    >
      <IconMC name="plus" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};
