import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  Share,
  Clipboard,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import {
  ArrowLeft,
  Copy,
  Share2,
  Mail,
  QrCode,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Calendar,
  CreditCard,
  ShoppingCart,
  Activity,
  Gamepad2,
  Check,
  Users,
  Settings,
  Lock,
  Globe,
  ChevronRight,
  Pencil,
  Image as ImageIcon,
  Info,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { circleApi } from '../../services/api';
import { ScreenBackground } from '../../components/ScreenBackground';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const { width } = Dimensions.get('window');

const TABS = [
  { key: 'info', label: 'Circle Info', icon: Info },
  { key: 'member', label: 'Members', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
];

interface CircleSettingsScreenProps {
  navigation: any;
  route?: { params?: { initialTab?: string } };
}

interface CircleData {
  id: string;
  name: string;
  story: string;
  logo?: string;
  coverPhoto?: string;
  inviteCode?: string;
  inviteCodeExpiry?: string;
  settings?: CircleSettings;
  members?: any[];
  privacy?: 'public' | 'private';
}

interface CircleSettings {
  allowLocationSharing: boolean;
  allowChatMessages: boolean;
  allowSafetyAlerts: boolean; 
  allowCalendarEvents: boolean;
  allowCircleExpenses: boolean; 
  allowCircleShopping: boolean; 
  allowCircleHealth: boolean; 
  allowCircleEntertainment: boolean; 
  allowGallery: boolean;
  circleType: string;
}

const CircleSettingsScreen: React.FC<CircleSettingsScreenProps> = ({ navigation, route }) => {
  const [circleData, setCircleData] = useState<CircleData>({
    id: '',
    name: '',
    story: '',
    logo: '',
    coverPhoto: '',
    inviteCode: '',
    inviteCodeExpiry: '',
    members: [],
    privacy: 'private',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [storyText, setStoryText] = useState('');
  const initialTab = route?.params?.initialTab;
  const [activeTabIndex, setActiveTabIndex] = useState(() => {
    const idx = TABS.findIndex(t => t.key === initialTab);
    return idx >= 0 ? idx : 0;
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const tabScrollX = useRef(new Animated.Value(0)).current;
  const [moduleSettings, setModuleSettings] = useState<CircleSettings>({
    allowLocationSharing: true,
    allowChatMessages: true,
    allowSafetyAlerts: true,
    allowCalendarEvents: true,
    allowCircleExpenses: false,
    allowCircleShopping: true,
    allowCircleHealth: false,
    allowCircleEntertainment: true,
    allowGallery: true,
    circleType: 'family',
  });

  useEffect(() => {
    loadCircleData();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current && activeTabIndex >= 0) {
      const timer = setTimeout(() => {
        (scrollViewRef.current as any)?.scrollTo({ x: activeTabIndex * width, animated: false });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const loadCircleData = async () => {
    try {
      setLoading(true);
      const { circles } = await circleApi.getCircles();
      
      if (circles && circles.length > 0) {
        const primaryCircle = circles[0];
        const settings = (primaryCircle.settings || {}) as any;
        
        const mockMembers = primaryCircle.members || [
            { id: '1', name: 'You', avatar: null, status: 'online', role: 'admin' },
            { id: '2', name: 'Partner', avatar: null, status: 'offline', role: 'member' },
        ];

        setCircleData({
          id: primaryCircle.id,
          name: primaryCircle.name,
          story: primaryCircle.description || '',
          logo: '', 
          coverPhoto: '',
          inviteCode: '', 
          inviteCodeExpiry: '',
          members: mockMembers,
          privacy: settings.privacy || 'private',
          settings: {
            allowLocationSharing: settings.allowLocationSharing ?? true,
            allowChatMessages: settings.allowChatMessages ?? true,
            allowSafetyAlerts: settings.allowSafetyAlerts ?? true,
            allowCalendarEvents: settings.allowCalendarEvents ?? true,
            allowCircleExpenses: settings.allowCircleExpenses ?? false,
            allowCircleShopping: settings.allowCircleShopping ?? true,
            allowCircleHealth: settings.allowCircleHealth ?? false,
            allowCircleEntertainment: settings.allowCircleEntertainment ?? true,
            allowGallery: settings.allowGallery ?? true,
            circleType: settings.circleType || 'family',
          }
        });
        
        setModuleSettings({
            allowLocationSharing: settings.allowLocationSharing ?? true,
            allowChatMessages: settings.allowChatMessages ?? true,
            allowSafetyAlerts: settings.allowSafetyAlerts ?? true,
            allowCalendarEvents: settings.allowCalendarEvents ?? true,
            allowCircleExpenses: settings.allowCircleExpenses ?? false,
            allowCircleShopping: settings.allowCircleShopping ?? true,
            allowCircleHealth: settings.allowCircleHealth ?? false,
            allowCircleEntertainment: settings.allowCircleEntertainment ?? true,
            allowGallery: settings.allowGallery ?? true,
            circleType: settings.circleType || 'family',
        });
        setStoryText(primaryCircle.description || '');
      }
    } catch (error) {
      console.error('Error loading circle data:', error);
      Alert.alert('Error', 'Failed to load circle settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCircleName = async () => {
    if (!circleData.name.trim()) {
      Alert.alert('Error', 'Circle name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await circleApi.updateCircle(circleData.id, { name: circleData.name });
      Alert.alert('Success', 'Circle name updated successfully');
    } catch (error) {
      console.error('Error updating circle name:', error);
      Alert.alert('Error', 'Failed to update circle name');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCircleStory = async () => {
    try {
      setSaving(true);
      await circleApi.updateCircle(circleData.id, { description: storyText });
      setCircleData(prev => ({ ...prev, story: storyText }));
      Alert.alert('Success', 'Circle story updated successfully');
    } catch (error) {
      console.error('Error updating circle story:', error);
      Alert.alert('Error', 'Failed to update circle story');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverPhotoUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setCircleData(prev => ({ ...prev, coverPhoto: imageUri }));
        Alert.alert('Success', 'Cover photo updated successfully');
      }
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      Alert.alert('Error', 'Failed to upload cover photo');
    }
  };

  const handleLogoUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setCircleData(prev => ({ ...prev, logo: imageUri }));
        Alert.alert('Success', 'Circle logo updated successfully');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      Alert.alert('Error', 'Failed to upload circle logo');
    }
  };

  const generateInviteCode = async () => {
    try {
      setSaving(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      
      setCircleData(prev => ({
        ...prev,
        inviteCode: code,
        inviteCodeExpiry: expiryDate.toISOString(),
      }));
      
      Alert.alert('Success', 'Invite code generated successfully');
    } catch (error) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', 'Failed to generate invite code');
    } finally {
      setSaving(false);
    }
  };

  const copyInviteCode = () => {
    if (circleData.inviteCode) {
      Clipboard.setString(circleData.inviteCode);
      Alert.alert('Copied', 'Invite code copied to clipboard');
    }
  };

  const shareInviteCode = async () => {
    if (circleData.inviteCode) {
      try {
        await Share.share({
          message: `Join our Circle on Bondarys! Use this code: ${circleData.inviteCode}`,
        });
      } catch (error) {
        console.error('Error sharing invite code:', error);
      }
    }
  };

  const sendInviteEmail = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      setSaving(true);
      await circleApi.inviteMember(circleData.id, inviteEmail, 'Join my circle on Bondarys!'); 
      Alert.alert('Success', 'Invite sent successfully');
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invite');
    } finally {
      setSaving(false);
    }
  };

  const formatExpiryTime = (expiryDate: string) => {
    if (!expiryDate) return '';
    const date = new Date(expiryDate);
    const now = new Date();
    const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 'Expired';
    if (diffHours < 24) return `Expires in ${diffHours} hours`;
    return `Expires on ${date.toLocaleDateString()}`;
  };

  const handleToggleModule = (key: keyof CircleSettings) => {
    setModuleSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveModules = async () => {
    try {
      setSaving(true);
      const apiSettings = {
        ...moduleSettings,
        allowLocationSharing: moduleSettings.allowLocationSharing,
        allowChatMessages: moduleSettings.allowChatMessages,
        allowSafetyAlerts: moduleSettings.allowSafetyAlerts,
        allowCalendarEvents: moduleSettings.allowCalendarEvents,
        allowCircleExpenses: moduleSettings.allowCircleExpenses,
        allowCircleShopping: moduleSettings.allowCircleShopping,
        allowCircleHealth: moduleSettings.allowCircleHealth,
        allowCircleEntertainment: moduleSettings.allowCircleEntertainment,
        allowGallery: moduleSettings.allowGallery,
        circleType: moduleSettings.circleType,
      } as any;
      if (circleData.privacy !== undefined) apiSettings.privacy = circleData.privacy;

      await circleApi.updateCircle(circleData.id, { settings: apiSettings });
      setCircleData(prev => ({ ...prev, settings: moduleSettings }));
      Alert.alert('Success', 'Circle features updated successfully');
    } catch (error) {
      console.error('Error updating circle features:', error);
      Alert.alert('Error', 'Failed to update circle features');
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityChange = (privacy: 'public' | 'private') => {
    setCircleData(prev => ({ ...prev, privacy }));
  };

  const handleSaveVisibility = async () => {
    try {
      setSaving(true);
      await circleApi.updateCircle(circleData.id, {
        settings: { ...moduleSettings, privacy: circleData.privacy } as any,
      });
      Alert.alert('Success', 'Visibility updated');
    } catch (error) {
      console.error('Error updating visibility:', error);
      Alert.alert('Error', 'Failed to update visibility');
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveCircle = () => {
    Alert.alert(
      'Leave Circle',
      `Are you sure you want to leave "${circleData.name}"? You will need to be invited again to rejoin.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await circleApi.leaveCircle(circleData.id);
              Alert.alert('Success', 'You have left the circle');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to leave circle');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    showChevron = true 
  }: { 
    icon: any; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIconContainer}>
          <Icon size={20} color="#3B82F6" />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showChevron && <ChevronRight size={20} color="#6B7280" />)}
    </TouchableOpacity>
  );

  const SettingToggle = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    value, 
    onToggle 
  }: { 
    icon: any; 
    title: string; 
    subtitle?: string; 
    value: boolean; 
    onToggle: () => void; 
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIconContainer}>
          <Icon size={20} color="#3B82F6" />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );

  const activeTab = TABS[activeTabIndex]?.key ?? 'info';

  const handleTabPress = (index: number) => {
    setActiveTabIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: tabScrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        if (index !== activeTabIndex && index >= 0 && index < TABS.length) {
          setActiveTabIndex(index);
        }
      },
    }
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  const memberCount = circleData.members?.length || 0;
  const displayName = circleData.name?.trim() || 'Circle';

  return (
    <ScreenBackground screenId="circle">
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header - profile style */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {circleData.logo ? (
                <Image source={{ uri: circleData.logo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <View style={styles.contactRow}>
                <Users size={14} color="#6B7280" />
                <Text style={styles.contactText}>
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </Text>
              </View>
              <View style={styles.contactRow}>
                {circleData.privacy === 'private' ? (
                  <Lock size={14} color="#6B7280" />
                ) : (
                  <Globe size={14} color="#6B7280" />
                )}
                <Text style={styles.contactText}>
                  {circleData.privacy === 'private' ? 'Private' : 'Public'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowInviteModal(true)}
            >
              <Pencil size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main content card - rounded top like profile */}
        <View style={styles.mainContentCard}>
          <View style={styles.tabBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScrollContent}
            >
              {TABS.map((tab, index) => {
                const isActive = activeTabIndex === index;
                const Icon = tab.icon;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, isActive && styles.tabActive]}
                    onPress={() => handleTabPress(index)}
                  >
                    <Icon size={20} color={isActive ? '#3B82F6' : '#6B7280'} />
                    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <Animated.ScrollView
            ref={scrollViewRef as any}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.tabContent}
          >
            {/* Tab 1: Circle Info */}
            <View style={styles.tabPage}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabPageContent}>
          <View style={styles.infoSection}>
          <View style={styles.groupNameRow}>
            <TextInput
              style={styles.groupNameInput}
              value={circleData.name}
              onChangeText={(text) => setCircleData(prev => ({ ...prev, name: text }))}
              placeholder="Circle Name"
              placeholderTextColor="#65676B"
              maxLength={50}
            />
            <TouchableOpacity 
              style={styles.inlineSaveButton}
              onPress={handleSaveCircleName}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Check size={18} color="#3B82F6" />
              )}
            </TouchableOpacity>
          </View>

          {/* Member Count & Privacy Badge */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Users size={16} color="#65676B" />
              <Text style={styles.metaText}>
                {circleData.members?.length || 0} {circleData.members?.length === 1 ? 'member' : 'members'}
              </Text>
            </View>
            <View style={styles.privacyBadge}>
              {circleData.privacy === 'private' ? (
                <Lock size={14} color="#65676B" />
              ) : (
                <Globe size={14} color="#65676B" />
              )}
              <Text style={styles.privacyText}>
                {circleData.privacy === 'private' ? 'Private' : 'Public'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={storyText}
              onChangeText={setStoryText}
              placeholder="What's this circle about?"
              placeholderTextColor="#8A8D91"
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity 
              style={styles.saveDescriptionButton}
              onPress={handleSaveCircleStory}
              disabled={saving}
            >
              <Text style={styles.saveDescriptionText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Circle Type */}
          <View style={styles.circleTypeSection}>
            <Text style={styles.circleTypeLabel}>Circle Type</Text>
            <View style={styles.circleTypeBadge}>
              <Text style={styles.circleTypeText}>
                {moduleSettings.circleType || 'family'}
              </Text>
            </View>
          </View>
          </View>

          <View style={styles.divider} />
          <View style={styles.section}>
            <SettingItem
              icon={Share2}
              title="Share Circle"
              subtitle="Invite people to join"
              onPress={() => setShowInviteModal(true)}
            />
            <SettingItem
              icon={QrCode}
              title="Invite Code"
              subtitle={circleData.inviteCode ? `Code: ${circleData.inviteCode}` : 'Generate invite code'}
              onPress={generateInviteCode}
            />
          </View>
          <View style={{ height: 40 }} />
              </ScrollView>
            </View>

            {/* Tab 2: Members */}
            <View style={styles.tabPage}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabPageContent}>
          <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members</Text>
            <TouchableOpacity onPress={() => setShowInviteModal(true)}>
              <Text style={styles.sectionAction}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {(circleData.members || []).slice(0, 5).map((member, index) => (
            <View key={member.id || index} style={styles.memberItem}>
              <View style={styles.memberLeft}>
                {member.avatar ? (
                  <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                ) : (
                  <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder]}>
                    <Text style={styles.memberAvatarText}>
                      {member.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.role && (
                    <Text style={styles.memberRole}>
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </Text>
                  )}
                </View>
              </View>
              {member.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
          ))}
          
          {(circleData.members?.length || 0) > 5 && (
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>
                See all {circleData.members?.length} members
              </Text>
              <ChevronRight size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
          </View>
              </ScrollView>
            </View>

            {/* Tab 3: Settings (Features, Visibility, Danger zone) */}
            <View style={styles.tabPage}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabPageContent}>
                {/* Section 1: Feature config */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Features</Text>
                  <Text style={styles.sectionSubtitle}>Choose which features are enabled for this circle.</Text>

                  <SettingToggle
                    icon={MapPin}
                    title="Location Sharing"
                    subtitle="Share real-time location with circle members"
                    value={moduleSettings.allowLocationSharing}
                    onToggle={() => handleToggleModule('allowLocationSharing')}
                  />
                  <SettingToggle
                    icon={MessageCircle}
                    title="Circle Chat"
                    subtitle="Enable group chat for circle members"
                    value={moduleSettings.allowChatMessages}
                    onToggle={() => handleToggleModule('allowChatMessages')}
                  />
                  <SettingToggle
                    icon={AlertTriangle}
                    title="Safety Alerts"
                    subtitle="Allow SOS and emergency alerts"
                    value={moduleSettings.allowSafetyAlerts}
                    onToggle={() => handleToggleModule('allowSafetyAlerts')}
                  />
                  <SettingToggle
                    icon={Calendar}
                    title="Shared Calendar"
                    subtitle="Events and reminders"
                    value={moduleSettings.allowCalendarEvents}
                    onToggle={() => handleToggleModule('allowCalendarEvents')}
                  />
                  <SettingToggle
                    icon={CreditCard}
                    title="Expenses"
                    subtitle="Track shared expenses"
                    value={moduleSettings.allowCircleExpenses}
                    onToggle={() => handleToggleModule('allowCircleExpenses')}
                  />
                  <SettingToggle
                    icon={ShoppingCart}
                    title="Shopping List"
                    subtitle="Shared grocery lists"
                    value={moduleSettings.allowCircleShopping}
                    onToggle={() => handleToggleModule('allowCircleShopping')}
                  />
                  <SettingToggle
                    icon={Activity}
                    title="Health & Wellness"
                    subtitle="Track health stats"
                    value={moduleSettings.allowCircleHealth}
                    onToggle={() => handleToggleModule('allowCircleHealth')}
                  />
                  <SettingToggle
                    icon={Gamepad2}
                    title="Entertainment"
                    subtitle="Manage subscriptions"
                    value={moduleSettings.allowCircleEntertainment}
                    onToggle={() => handleToggleModule('allowCircleEntertainment')}
                  />
                  <SettingToggle
                    icon={ImageIcon}
                    title="Gallery"
                    subtitle="Shared photo album"
                    value={moduleSettings.allowGallery}
                    onToggle={() => handleToggleModule('allowGallery')}
                  />

                  <TouchableOpacity
                    style={styles.saveFeaturesButton}
                    onPress={handleSaveModules}
                    disabled={saving}
                  >
                    <Text style={styles.saveFeaturesText}>
                      {saving ? 'Saving...' : 'Save features'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Section 2: Visibility with preview */}
                <View style={styles.divider} />
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Visibility</Text>
                  <Text style={styles.sectionSubtitle}>Who can see this circle. Preview below.</Text>

                  <View style={styles.visibilityOptions}>
                    <TouchableOpacity
                      style={[
                        styles.visibilityOption,
                        circleData.privacy === 'private' && styles.visibilityOptionActive,
                      ]}
                      onPress={() => handleVisibilityChange('private')}
                    >
                      <Lock size={20} color={circleData.privacy === 'private' ? '#3B82F6' : '#6B7280'} />
                      <Text style={[
                        styles.visibilityOptionLabel,
                        circleData.privacy === 'private' && styles.visibilityOptionLabelActive,
                      ]}>
                        Private
                      </Text>
                      <Text style={styles.visibilityOptionHint}>Only members can see it</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.visibilityOption,
                        circleData.privacy === 'public' && styles.visibilityOptionActive,
                      ]}
                      onPress={() => handleVisibilityChange('public')}
                    >
                      <Globe size={20} color={circleData.privacy === 'public' ? '#3B82F6' : '#6B7280'} />
                      <Text style={[
                        styles.visibilityOptionLabel,
                        circleData.privacy === 'public' && styles.visibilityOptionLabelActive,
                      ]}>
                        Public
                      </Text>
                      <Text style={styles.visibilityOptionHint}>Discoverable by others</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.visibilityPreview}>
                    <Text style={styles.visibilityPreviewLabel}>Preview</Text>
                    <View style={styles.visibilityPreviewCard}>
                      <View style={styles.visibilityPreviewHeader}>
                        {circleData.logo ? (
                          <Image source={{ uri: circleData.logo }} style={styles.visibilityPreviewAvatar} />
                        ) : (
                          <View style={[styles.visibilityPreviewAvatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>{(circleData.name || 'C').charAt(0).toUpperCase()}</Text>
                          </View>
                        )}
                        <View style={styles.visibilityPreviewInfo}>
                          <Text style={styles.visibilityPreviewName}>{circleData.name || 'Circle'}</Text>
                          <View style={styles.visibilityPreviewBadge}>
                            {circleData.privacy === 'private' ? (
                              <>
                                <Lock size={12} color="#6B7280" />
                                <Text style={styles.visibilityPreviewBadgeText}>Only members</Text>
                              </>
                            ) : (
                              <>
                                <Globe size={12} color="#6B7280" />
                                <Text style={styles.visibilityPreviewBadgeText}>Discoverable</Text>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.saveFeaturesButton}
                    onPress={handleSaveVisibility}
                    disabled={saving}
                  >
                    <Text style={styles.saveFeaturesText}>
                      {saving ? 'Saving...' : 'Save visibility'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Section 3: Danger zone */}
                <View style={styles.divider} />
                <View style={styles.section}>
                  <Text style={styles.dangerTitle}>Danger zone</Text>
                  <Text style={styles.dangerSubtitle}>These actions are irreversible.</Text>
                  <TouchableOpacity style={styles.dangerButton} onPress={handleLeaveCircle}>
                    <Text style={styles.dangerButtonText}>Leave circle</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </Animated.ScrollView>
        </View>
      </View>

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite to Circle</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={generateInviteCode}
              >
                <QrCode size={24} color="#3B82F6" />
                <View style={styles.modalActionContent}>
                  <Text style={styles.modalActionTitle}>Generate Invite Code</Text>
                  <Text style={styles.modalActionSubtitle}>Create a code to share</Text>
                </View>
                <ChevronRight size={20} color="#8A8D91" />
              </TouchableOpacity>

              {circleData.inviteCode && (
                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>Invite Code</Text>
                  <View style={styles.codeDisplay}>
                    <Text style={styles.codeText}>{circleData.inviteCode}</Text>
                    <View style={styles.codeActions}>
                      <TouchableOpacity style={styles.codeActionButton} onPress={copyInviteCode}>
                        <Copy size={18} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.codeActionButton} onPress={shareInviteCode}>
                        <Share2 size={18} color="#3B82F6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.expiryText}>
                    {formatExpiryTime(circleData.inviteCodeExpiry || '')}
                  </Text>
                </View>
              )}

              <View style={styles.modalDivider}>
                <View style={styles.modalDividerLine} />
                <Text style={styles.modalDividerText}>OR</Text>
                <View style={styles.modalDividerLine} />
              </View>
              
              <View style={styles.emailSection}>
                <Text style={styles.emailLabel}>Invite by Email</Text>
                <View style={styles.emailInputContainer}>
                  <Mail size={20} color="#8A8D91" />
                  <TextInput
                    style={styles.emailInput}
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    placeholder="Enter email address"
                    placeholderTextColor="#8A8D91"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.sendButton, saving && styles.sendButtonDisabled]}
                  onPress={sendInviteEmail}
                  disabled={saving || !inviteEmail.trim()}
                >
                  <Text style={styles.sendButtonText}>
                    {saving ? 'Sending...' : 'Send Invite'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
};

export default CircleSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  // Header - profile style (transparent over gradient)
  header: {
    backgroundColor: 'transparent',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main content card - profile style
  mainContentCard: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabScrollContent: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  tabLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  tabPage: {
    width: width,
    flex: 1,
  },
  tabPageContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Info Section
  infoSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: 'relative',
    zIndex: 2,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupNameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#050505',
    paddingVertical: 4,
  },
  inlineSaveButton: {
    padding: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 15,
    color: '#65676B',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
  },
  privacyText: {
    fontSize: 13,
    color: '#65676B',
    fontWeight: '500',
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 8,
  },
  descriptionInput: {
    fontSize: 15,
    color: '#050505',
    paddingVertical: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveDescriptionButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  saveDescriptionText: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
  },
  circleTypeSection: {
    marginTop: 16,
  },
  circleTypeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 8,
  },
  circleTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E4E6EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  circleTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050505',
    textTransform: 'capitalize',
  },

  // Divider
  divider: {
    height: 8,
    backgroundColor: '#F0F2F5',
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#050505',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#65676B',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionAction: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
    paddingHorizontal: 16,
  },

  // Setting Items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#050505',
  },
  settingItemSubtitle: {
    fontSize: 13,
    color: '#65676B',
    marginTop: 2,
  },

  // Members
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberAvatarPlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#050505',
  },
  memberRole: {
    fontSize: 13,
    color: '#65676B',
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: '#E4E6EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676B',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  seeAllText: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: 4,
  },

  // Buttons
  saveFeaturesButton: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveFeaturesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Visibility
  visibilityOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  visibilityOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  visibilityOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6,
  },
  visibilityOptionLabelActive: {
    color: '#3B82F6',
  },
  visibilityOptionHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  visibilityPreview: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  visibilityPreviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  visibilityPreviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  visibilityPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  visibilityPreviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  visibilityPreviewInfo: {
    flex: 1,
  },
  visibilityPreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  visibilityPreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  visibilityPreviewBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Danger Zone
  dangerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#050505',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  dangerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dangerButton: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E41E3F',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E6EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#050505',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#65676B',
  },
  modalBody: {
    padding: 16,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    marginBottom: 16,
  },
  modalActionContent: {
    flex: 1,
    marginLeft: 12,
  },
  modalActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#050505',
  },
  modalActionSubtitle: {
    fontSize: 13,
    color: '#65676B',
    marginTop: 2,
  },
  codeContainer: {
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#65676B',
    marginBottom: 8,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F2F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#050505',
  },
  codeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  codeActionButton: {
    padding: 8,
  },
  expiryText: {
    fontSize: 12,
    color: '#65676B',
    textAlign: 'center',
  },
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  modalDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E4E6EB',
  },
  modalDividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#65676B',
    fontWeight: '500',
  },
  emailSection: {
    marginTop: 8,
  },
  emailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#65676B',
    marginBottom: 8,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#050505',
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E4E6EB',
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
