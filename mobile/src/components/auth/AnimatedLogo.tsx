import React, { useRef, useEffect, memo } from 'react';
import { Animated } from 'react-native';
import { Box, Icon } from 'native-base';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';

interface AnimatedLogoProps {
  size?: number;
  delay?: number;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = memo(({ 
  size = 100, 
  delay = 0 
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <Box
        w={size}
        h={size}
        bg={colors.white[500]}
        borderRadius={size / 2}
        justifyContent="center"
        alignItems="center"
        shadow={8}
      >
        <Icon
          as={IconMC}
          name="house-03"
          size={size * 0.5}
          color={colors.primary[500]}
        />
      </Box>
    </Animated.View>
  );
});

AnimatedLogo.displayName = 'AnimatedLogo';

export default AnimatedLogo;
