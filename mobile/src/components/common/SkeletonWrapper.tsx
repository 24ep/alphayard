import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useBranding } from '../../contexts/BrandingContext';
import { CardSkeleton, ListItemSkeleton, EventListSkeleton, GalleryGridSkeleton } from './SkeletonLoader';

interface SkeletonWrapperProps {
  loading: boolean;
  type?: 'card' | 'list' | 'event' | 'gallery';
  children: React.ReactNode;
}

const resolveColor = (colorValue: any, defaultColor: string) => {
  if (!colorValue) return defaultColor;
  return colorValue.solid || defaultColor;
};

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  loading,
  type = 'card',
  children
}) => {
  const { categories } = useBranding();

  const componentConfig = React.useMemo(() => {
    if (!categories) return null;
    for (const cat of categories) {
        const comp = cat.components.find(c => c.id === 'skeleton-wrapper');
        if (comp) return comp;
    }
    return null;
  }, [categories]);

  if (!loading) return <>{children}</>;

  const styles = componentConfig?.styles;
  const backgroundColor = resolveColor(styles?.backgroundColor, '#F1F5F9'); 
  const borderRadius = styles?.borderRadius ?? 16;

  // In a real implementation, we might pass these styles down to the skeleton components
  // For now, we just pick the variant
  
  const renderSkeleton = () => {
    switch(type) {
        case 'list': return <ListItemSkeleton />;
        case 'event': return <EventListSkeleton />;
        case 'gallery': return <GalleryGridSkeleton />;
        case 'card': 
        default: 
            return <CardSkeleton />;
    }
  };

  return (
    <View style={{ backgroundColor: 'transparent' }}>
        {renderSkeleton()}
    </View>
  );
};
