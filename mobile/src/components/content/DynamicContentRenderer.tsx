import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { ContentPage, ContentComponent, contentService } from '../../services/ContentService';

interface DynamicContentRendererProps {
  content: ContentPage;
  onInteraction?: (componentId: string, interactionType: string) => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const DynamicContentRenderer: React.FC<DynamicContentRendererProps> = ({
  content,
  onInteraction,
  style,
}) => {
  const handleComponentInteraction = async (
    componentId: string,
    interactionType: 'click' | 'conversion' | 'share' | 'like',
    action?: string
  ) => {
    // Track interaction
    await contentService.trackContentInteraction(
      content.id,
      interactionType,
      componentId
    );

    // Handle action
    if (action && interactionType === 'click') {
      if (action.startsWith('http')) {
        try {
          await Linking.openURL(action);
        } catch (error) {
          Alert.alert('Error', 'Could not open link');
        }
      } else {
        // Handle internal navigation
        onInteraction?.(componentId, action);
      }
    }

    // Notify parent component
    onInteraction?.(componentId, interactionType);
  };

  const renderComponent = (component: ContentComponent): React.ReactNode => {
    switch (component.type) {
      case 'text':
        return (
          <Text
            key={component.id}
            style={[
              styles.text,
              {
                fontSize: component.props.fontSize || 16,
                color: component.props.color || '#000000',
                textAlign: component.props.alignment || 'left',
              },
            ]}
          >
            {component.props.content || ''}
          </Text>
        );

      case 'image':
        return (
          <View key={component.id} style={styles.imageContainer}>
            {component.props.src ? (
              <Image
                source={{ uri: component.props.src }}
                style={[
                  styles.image,
                  {
                    width: `${component.props.width || 100}%`,
                    aspectRatio: component.props.aspectRatio || 16 / 9,
                  },
                ]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagePlaceholder, { width: `${component.props.width || 100}%` }]}>
                <Text style={styles.placeholderText}>No image</Text>
              </View>
            )}
            {component.props.caption && (
              <Text style={styles.imageCaption}>{component.props.caption}</Text>
            )}
          </View>
        );

      case 'button':
        return (
          <TouchableOpacity
            key={component.id}
            style={[
              styles.button,
              getButtonStyle(component.props.style || 'primary'),
              getButtonSize(component.props.size || 'medium'),
            ]}
            onPress={() =>
              handleComponentInteraction(
                component.id,
                'click',
                component.props.action
              )
            }
          >
            <Text
              style={[
                styles.buttonText,
                getButtonTextStyle(component.props.style || 'primary'),
              ]}
            >
              {component.props.text || 'Click Me'}
            </Text>
          </TouchableOpacity>
        );

      case 'spacer':
        return (
          <View
            key={component.id}
            style={[
              styles.spacer,
              { height: component.props.height || 20 },
            ]}
          />
        );

      case 'container':
        return (
          <View
            key={component.id}
            style={[
              styles.container,
              {
                backgroundColor: component.props.backgroundColor || 'transparent',
                padding: component.props.padding || 0,
                margin: component.props.margin || 0,
                borderRadius: component.props.borderRadius || 0,
              },
            ]}
          >
            {component.children
              ?.sort((a, b) => a.order - b.order)
              .map((child) => renderComponent(child))}
          </View>
        );

      default:
        return (
          <View key={component.id} style={styles.unknownComponent}>
            <Text style={styles.unknownText}>
              Unknown component: {component.type}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, style]}>
      {content.components
        .sort((a, b) => a.order - b.order)
        .map((component) => renderComponent(component))}
    </View>
  );
};

// Helper functions for button styling
const getButtonStyle = (style: string) => {
  switch (style) {
    case 'primary':
      return styles.buttonPrimary;
    case 'secondary':
      return styles.buttonSecondary;
    case 'outline':
      return styles.buttonOutline;
    case 'ghost':
      return styles.buttonGhost;
    default:
      return styles.buttonPrimary;
  }
};

const getButtonSize = (size: string) => {
  switch (size) {
    case 'small':
      return styles.buttonSmall;
    case 'medium':
      return styles.buttonMedium;
    case 'large':
      return styles.buttonLarge;
    default:
      return styles.buttonMedium;
  }
};

const getButtonTextStyle = (style: string) => {
  switch (style) {
    case 'primary':
      return styles.buttonTextPrimary;
    case 'secondary':
      return styles.buttonTextSecondary;
    case 'outline':
      return styles.buttonTextOutline;
    case 'ghost':
      return styles.buttonTextGhost;
    default:
      return styles.buttonTextPrimary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    marginVertical: 4,
    lineHeight: 24,
  },
  imageContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  image: {
    borderRadius: 8,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  imageCaption: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonSmall: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonMedium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonPrimary: {
    backgroundColor: '#dc2626',
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  buttonTextSecondary: {
    color: '#ffffff',
  },
  buttonTextOutline: {
    color: '#dc2626',
  },
  buttonTextGhost: {
    color: '#dc2626',
  },
  spacer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  unknownComponent: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginVertical: 4,
  },
  unknownText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
});
