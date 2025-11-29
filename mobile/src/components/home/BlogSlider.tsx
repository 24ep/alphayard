import React, { useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';

export interface BlogItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUri?: string;
}

interface BlogSliderProps {
  items: BlogItem[];
  onPressItem: (item: BlogItem) => void;
  onIndexChange?: (index: number) => void;
}

export const BlogSlider: React.FC<BlogSliderProps> = ({ items, onPressItem, onIndexChange }) => {
  const itemWidthRef = useRef<number | null>(null);
  const contentPaddingHorizontal = 16; // from homeStyles.blogSliderContent

  const handleCardLayout = useCallback((width: number) => {
    if (!itemWidthRef.current) {
      // include marginRight from style (12)
      itemWidthRef.current = width + 12;
    }
  }, []);

  const handleMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!onIndexChange) return;
    const x = e.nativeEvent.contentOffset.x;
    const itemWidth = itemWidthRef.current;
    if (itemWidth && itemWidth > 0) {
      const index = Math.max(0, Math.min(items.length - 1, Math.round((x) / itemWidth)));
      onIndexChange(index);
    }
  }, [items.length, onIndexChange]);

  return (
    <View style={homeStyles.blogSliderContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.blogSliderContent}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        snapToInterval={itemWidthRef.current || undefined}
        decelerationRate={itemWidthRef.current ? 'fast' : 'normal'}
        snapToAlignment="start"
        disableIntervalMomentum
      >
        {items.map((item, idx) => (
          <TouchableOpacity key={item.id} style={homeStyles.blogCard} onPress={() => onPressItem(item)}
            onLayout={(ev) => {
              if (idx === 0) handleCardLayout(ev.nativeEvent.layout.width);
            }}
          >
            <View style={homeStyles.blogCardImageWrapper}>
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={homeStyles.blogCardImage} resizeMode="cover" />
              ) : (
                <View style={homeStyles.blogCardImagePlaceholder}>
                  <CoolIcon name="image-outline" size={24} color="#9CA3AF" />
                </View>
              )}
              <View style={homeStyles.blogCardOverlay} />
              <View style={homeStyles.blogCardTextOverlay}>
                <Text style={homeStyles.blogCardTitleOverlay} numberOfLines={2}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={homeStyles.blogCardSubtitleOverlay} numberOfLines={1}>{item.subtitle}</Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};


