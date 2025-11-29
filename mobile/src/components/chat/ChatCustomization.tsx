import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Image, Alert } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

interface ChatTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  bubbleColor: string;
  bubbleTextColor: string;
}

interface ChatCustomizationProps {
  visible: boolean;
  onClose: () => void;
  currentTheme?: ChatTheme;
  currentBackground?: string;
  onThemeChange: (theme: ChatTheme) => void;
  onBackgroundChange: (backgroundUri: string) => void;
}

export const ChatCustomization: React.FC<ChatCustomizationProps> = ({
  visible,
  onClose,
  currentTheme,
  currentBackground,
  onThemeChange,
  onBackgroundChange,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'background'>('theme');
  const [selectedTheme, setSelectedTheme] = useState<ChatTheme | null>(currentTheme || null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(currentBackground || null);

  const themes: ChatTheme[] = [
    {
      id: 'default',
      name: 'Default',
      primaryColor: '#FFB6C1',
      secondaryColor: '#FEF7F7',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      bubbleColor: '#FFB6C1',
      bubbleTextColor: '#FFFFFF',
    },
    {
      id: 'dark',
      name: 'Dark',
      primaryColor: '#1F2937',
      secondaryColor: '#374151',
      backgroundColor: '#111827',
      textColor: '#F9FAFB',
      bubbleColor: '#374151',
      bubbleTextColor: '#F9FAFB',
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      primaryColor: '#3B82F6',
      secondaryColor: '#EFF6FF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      bubbleColor: '#3B82F6',
      bubbleTextColor: '#FFFFFF',
    },
    {
      id: 'green',
      name: 'Forest Green',
      primaryColor: '#10B981',
      secondaryColor: '#ECFDF5',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      bubbleColor: '#10B981',
      bubbleTextColor: '#FFFFFF',
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      primaryColor: '#8B5CF6',
      secondaryColor: '#F3E8FF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      bubbleColor: '#8B5CF6',
      bubbleTextColor: '#FFFFFF',
    },
    {
      id: 'orange',
      name: 'Sunset Orange',
      primaryColor: '#F59E0B',
      secondaryColor: '#FFFBEB',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      bubbleColor: '#F59E0B',
      bubbleTextColor: '#FFFFFF',
    },
  ];

  const defaultBackgrounds = [
    { id: 'none', name: 'None', uri: null },
    { id: 'gradient1', name: 'Gradient 1', uri: 'gradient1' },
    { id: 'gradient2', name: 'Gradient 2', uri: 'gradient2' },
    { id: 'pattern1', name: 'Pattern 1', uri: 'pattern1' },
    { id: 'pattern2', name: 'Pattern 2', uri: 'pattern2' },
  ];

  const handleThemeSelect = (theme: ChatTheme) => {
    setSelectedTheme(theme);
  };

  const handleBackgroundSelect = (backgroundUri: string | null) => {
    setSelectedBackground(backgroundUri);
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedBackground(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleApply = () => {
    if (selectedTheme) {
      onThemeChange(selectedTheme);
    }
    if (selectedBackground !== null) {
      onBackgroundChange(selectedBackground);
    }
    onClose();
  };

  const renderThemePreview = (theme: ChatTheme) => (
    <View style={[styles.themePreview, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.previewBubble, { backgroundColor: theme.bubbleColor }]}>
        <Text style={[styles.previewText, { color: theme.bubbleTextColor }]}>Hello!</Text>
      </View>
      <View style={[styles.previewBubble, styles.otherBubble, { backgroundColor: theme.secondaryColor }]}>
        <Text style={[styles.previewText, { color: theme.textColor }]}>Hi there!</Text>
      </View>
    </View>
  );

  const renderBackgroundPreview = (background: any) => (
    <View style={styles.backgroundPreview}>
      {background.uri === null ? (
        <View style={styles.noBackground}>
          <IconMC name="image-off" size={32} color="#9CA3AF" />
          <Text style={styles.noBackgroundText}>No Background</Text>
        </View>
      ) : background.uri.startsWith('gradient') ? (
        <View style={[
          styles.gradientBackground,
          background.uri === 'gradient1' ? styles.gradient1 : styles.gradient2
        ]} />
      ) : background.uri.startsWith('pattern') ? (
        <View style={[
          styles.patternBackground,
          background.uri === 'pattern1' ? styles.pattern1 : styles.pattern2
        ]} />
      ) : (
        <Image source={{ uri: background.uri }} style={styles.backgroundImage} />
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <IconIon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat Customization</Text>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'theme' && styles.activeTab]}
            onPress={() => setActiveTab('theme')}
          >
            <IconMC name="palette" size={20} color={activeTab === 'theme' ? '#FFB6C1' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'theme' && styles.activeTabText]}>
              Theme
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'background' && styles.activeTab]}
            onPress={() => setActiveTab('background')}
          >
            <IconMC name="image" size={20} color={activeTab === 'background' ? '#FFB6C1' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'background' && styles.activeTabText]}>
              Background
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Theme</Text>
              <View style={styles.themesGrid}>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.themeCard,
                      selectedTheme?.id === theme.id && styles.selectedThemeCard
                    ]}
                    onPress={() => handleThemeSelect(theme)}
                  >
                    {renderThemePreview(theme)}
                    <Text style={styles.themeName}>{theme.name}</Text>
                    {selectedTheme?.id === theme.id && (
                      <View style={styles.selectedIndicator}>
                        <IconIon name="checkmark-circle" size={20} color="#10B981" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Background Tab */}
          {activeTab === 'background' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Background</Text>
              
              {/* Upload Custom Background */}
              <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
                <IconMC name="camera-plus" size={24} color="#FFB6C1" />
                <Text style={styles.uploadButtonText}>Upload Custom Background</Text>
              </TouchableOpacity>

              {/* Default Backgrounds */}
              <Text style={styles.subsectionTitle}>Default Backgrounds</Text>
              <View style={styles.backgroundsGrid}>
                {defaultBackgrounds.map((background) => (
                  <TouchableOpacity
                    key={background.id}
                    style={[
                      styles.backgroundCard,
                      selectedBackground === background.uri && styles.selectedBackgroundCard
                    ]}
                    onPress={() => handleBackgroundSelect(background.uri)}
                  >
                    {renderBackgroundPreview(background)}
                    <Text style={styles.backgroundName}>{background.name}</Text>
                    {selectedBackground === background.uri && (
                      <View style={styles.selectedIndicator}>
                        <IconIon name="checkmark-circle" size={20} color="#10B981" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  applyButton: {
    backgroundColor: '#FFB6C1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  activeTab: {
    borderBottomColor: '#FFB6C1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFB6C1',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 24,
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF7F7',
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#FFB6C1',
    borderStyle: 'dashed',
    marginBottom: 20,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFB6C1',
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThemeCard: {
    borderColor: '#FFB6C1',
    backgroundColor: '#FEF7F7',
  },
  themePreview: {
    height: 80,
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  previewBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  otherBubble: {
    alignSelf: 'flex-end',
  },
  previewText: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  backgroundsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  backgroundCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBackgroundCard: {
    borderColor: '#FFB6C1',
    backgroundColor: '#FEF7F7',
  },
  backgroundPreview: {
    height: 80,
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  noBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  noBackgroundText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  gradientBackground: {
    flex: 1,
  },
  gradient1: {
    backgroundColor: '#FFB6C1',
  },
  gradient2: {
    backgroundColor: '#3B82F6',
  },
  patternBackground: {
    flex: 1,
  },
  pattern1: {
    backgroundColor: '#F3F4F6',
  },
  pattern2: {
    backgroundColor: '#E5E7EB',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backgroundName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
