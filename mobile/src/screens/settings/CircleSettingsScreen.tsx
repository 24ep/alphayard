import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Camera, 
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
  Plus,
  Check
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CircleSelectionTabs } from '../../components/common/CircleSelectionTabs';
import { InlineWysiwygEditor } from '../../components/common/InlineWysiwygEditor';
import { circleApi } from '../../services/api';
import { useBranding } from '../../contexts/BrandingContext';

const CheckIcon = Check as any;
const ArrowLeftIcon = ArrowLeft as any;
const CameraIcon = Camera as any;
const CopyIcon = Copy as any;
const Share2Icon = Share2 as any;
const MailIcon = Mail as any;
const QrCodeIcon = QrCode as any;
const PlusIcon = Plus as any;
const MapPinIcon = MapPin as any;
const MessageCircleIcon = MessageCircle as any;
const AlertTriangleIcon = AlertTriangle as any;
const CalendarIcon = Calendar as any;
const CreditCardIcon = CreditCard as any;
const ShoppingCartIcon = ShoppingCart as any;
const ActivityIcon = Activity as any;
const Gamepad2Icon = Gamepad2 as any;

const THEME_COLOR = '#FA7272'; // Premium accent color

interface CircleSettingsScreenProps {
  navigation: any;
}

interface CircleData {
  id: string;
  name: string;
  story: string;
  logo?: string;
  inviteCode?: string;
  inviteCodeExpiry?: string;
  settings?: CircleSettings;
  members?: any[]; // Added members to data
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
  allowGallery: boolean; // Added
  circleType: string; // Added
}

const CircleSettingsScreen: React.FC<CircleSettingsScreenProps> = ({ navigation }) => {
  const [circleData, setCircleData] = useState<CircleData>({
    id: '',
    name: '',
    story: '',
    logo: '',
    inviteCode: '',
    inviteCodeExpiry: '',
    members: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [storyText, setStoryText] = useState('');
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

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const routeParams = (navigation as any).getState()?.routes?.find((r: any) => r.name === 'CircleSettings')?.params;
  const initialTab = routeParams?.initialTab || 'info';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { categories } = useBranding();
  const tabsConfig = React.useMemo(() => {
    if (!categories) return {};
    // Try specific circle config first
    let comp = null;
    for (const cat of categories) {
        comp = cat.components.find(c => c.id === 'circle-selection-tabs');
        if (comp) break;
    }
    // Fallback to generic if not found
    if (!comp) {
        for (const cat of categories) {
            comp = cat.components.find(c => c.id === 'selection-tabs');
            if (comp) break;
        }
    }
    return comp?.config || {};
  }, [categories]);

  const tabs = [
    { id: 'info', label: 'General', icon: 'info' },
    { id: 'members', label: 'Members', icon: 'users' },
    { id: 'config', label: 'Features', icon: 'settings' },
  ];

  useEffect(() => {
    loadCircleData();
  }, []);

  const loadCircleData = async () => {
    try {
      setLoading(true);
      const { circles } = await circleApi.getCircles();
      
      if (circles && circles.length > 0) {
        const primaryCircle = circles[0];
        const settings = (primaryCircle.settings || {}) as any;
        
        // Mock members if not present in API (assuming generic API structure)
        const mockMembers = primaryCircle.members || [
            { id: '1', name: 'You', avatar: null, status: 'online' },
            { id: '2', name: 'Partner', avatar: null, status: 'offline' },
             // Add more mocks if needed to test collision
        ];

        setCircleData({
          id: primaryCircle.id,
          name: primaryCircle.name,
          story: primaryCircle.description || '',
          logo: '', 
          inviteCode: '', 
          inviteCodeExpiry: '',
          members: mockMembers,
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
      };

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

  const ModuleToggle = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon: Icon 
  }: { 
    title: string; 
    description: string; 
    value: boolean; 
    onToggle: () => void; 
    icon: any; 
  }) => (
    <View style={styles.moduleItem}>
      <View style={styles.moduleHeaderSide}>
        <View style={[styles.moduleIconContainer, { backgroundColor: value ? `${THEME_COLOR}20` : '#F3F4F6' }]}>
          <Icon 
            size={24} 
            color={value ? THEME_COLOR : '#9CA3AF'} 
          />
        </View>
        <View style={styles.moduleContent}>
          <Text style={styles.moduleTitle}>{title}</Text>
          <Text style={styles.moduleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: THEME_COLOR }}
        thumbColor={'#FFFFFF'}
      />
    </View>
  );

  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      {/* Circle Name */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Circle Name</Text>
          <View style={styles.inputWrapper}>
             <TextInput
              style={styles.textInput}
              value={circleData.name}
              onChangeText={(text) => setCircleData(prev => ({ ...prev, name: text }))}
              placeholder="Enter circle name"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
                style={styles.inlineSaveButton}
                onPress={handleSaveCircleName}
                disabled={saving}
            >
                {saving ? <ActivityIndicator size="small" color="#FFF" /> : <CheckIcon size={16} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Circle Story */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Circle Story</Text>
        <View style={styles.storyContainer}>
            <InlineWysiwygEditor
              value={storyText}
              onChange={setStoryText}
              placeholder="Tell your circle's story..."
              minHeight={120}
              maxHeight={250}
              showToolbar={true}
              editable={true}
            />
            <TouchableOpacity
              style={[styles.saveButton, { marginTop: 12 }, saving && styles.saveButtonDisabled]}
              onPress={handleSaveCircleStory}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Story'}
              </Text>
            </TouchableOpacity>
          </View>
      </View>

      {/* Circle Type Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Circle Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {['family', 'couple', 'friend', 'work', 'other'].map((type) => (
                <TouchableOpacity
                    key={type}
                    onPress={() => setModuleSettings(prev => ({ ...prev, circleType: type }))}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: moduleSettings.circleType === type ? THEME_COLOR : '#F3F4F6',
                        borderWidth: 1,
                        borderColor: moduleSettings.circleType === type ? THEME_COLOR : '#E5E7EB',
                    }}
                >
                    <Text style={{
                        color: moduleSettings.circleType === type ? '#FFFFFF' : '#4B5563',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                    }}>
                        {type}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
        <TouchableOpacity 
            style={[styles.saveButton, { marginTop: 12 }, saving && styles.saveButtonDisabled]}
            onPress={handleSaveModules}
            disabled={saving}
        >
            <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Type'}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMembersTab = () => (
      <View style={styles.tabContent}>
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Members ({circleData.members?.length || 0})</Text>
              {(circleData.members || []).map((member, index) => (
                  <View key={member.id || index} style={styles.memberRow}>
                       <View style={styles.memberAvatarContainer}>
                            {member.avatar ? (
                                <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                            ) : (
                                <View style={[styles.memberAvatar, styles.placeholderAvatar, { backgroundColor: '#FFB6C1' }]}>
                                    <Text style={styles.avatarText}>{member.name?.charAt(0) || '?'}</Text>
                                </View>
                            )}
                       </View>
                       <View style={styles.memberInfo}>
                           <Text style={styles.memberName}>{member.name}</Text>
                           <Text style={styles.memberStatus}>{member.status || 'Member'}</Text>
                       </View>
                       {/* Context menu or more actions could go here */}
                  </View>
              ))}
          </View>
      </View>
  );

  const renderConfigTab = () => (
    <View style={styles.tabContent}>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.modulesContainer}>
                <ModuleToggle
                title="Location Sharing"
                description="Share real-time location"
                value={moduleSettings.allowLocationSharing}
                onToggle={() => handleToggleModule('allowLocationSharing')}
                icon={MapPinIcon}
                />
                <ModuleToggle
                title="Circle Chat"
                description="Enable group chat"
                value={moduleSettings.allowChatMessages}
                onToggle={() => handleToggleModule('allowChatMessages')}
                icon={MessageCircleIcon}
                />
                <ModuleToggle
                title="Safety Alerts"
                description="Allow SOS alerts"
                value={moduleSettings.allowSafetyAlerts}
                onToggle={() => handleToggleModule('allowSafetyAlerts')}
                icon={AlertTriangleIcon}
                />
                <ModuleToggle
                title="Shared Calendar"
                description="Events and reminders"
                value={moduleSettings.allowCalendarEvents}
                onToggle={() => handleToggleModule('allowCalendarEvents')}
                icon={CalendarIcon}
                />
                <ModuleToggle
                title="Expenses"
                description="Track shared expenses"
                value={moduleSettings.allowCircleExpenses}
                onToggle={() => handleToggleModule('allowCircleExpenses')}
                icon={CreditCardIcon}
                />
                <ModuleToggle
                title="Shopping List"
                description="Shared grocery lists"
                value={moduleSettings.allowCircleShopping}
                onToggle={() => handleToggleModule('allowCircleShopping')}
                icon={ShoppingCartIcon}
                />
                <ModuleToggle
                title="Health & Wellness"
                description="Track health stats"
                value={moduleSettings.allowCircleHealth}
                onToggle={() => handleToggleModule('allowCircleHealth')}
                icon={ActivityIcon}
                />
                <ModuleToggle
                title="Entertainment"
                description="Manage subscriptions"
                value={moduleSettings.allowCircleEntertainment}
                onToggle={() => handleToggleModule('allowCircleEntertainment')}
                icon={Gamepad2Icon}
                />
                <ModuleToggle
                title="Gallery"
                description="Shared photo album"
                value={moduleSettings.allowGallery}
                onToggle={() => handleToggleModule('allowGallery')}
                icon={Image} // Using generic Image from react-native (actually need Lucide icon)
                />
                
                <TouchableOpacity
                style={[styles.saveButton, styles.modulesSaveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveModules}
                disabled={saving}
                >
                <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Update Features'}
                </Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Circle Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Immersive Header */}
        <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
                {circleData.logo ? (
                    <Image source={{ uri: circleData.logo }} style={styles.heroLogo} />
                ) : (
                    <View style={styles.heroPlaceholderLogo}>
                        <Text style={{ fontSize: 32, fontWeight: '700', color: '#9CA3AF' }}>
                            {circleData.name?.charAt(0) || 'C'}
                        </Text>
                    </View>
                )}
                <TouchableOpacity style={styles.heroEditButton} onPress={handleLogoUpload}>
                    <CameraIcon size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            
            <Text style={styles.heroName}>{circleData.name || 'My Circle'}</Text>
            
            <View style={styles.badgeContainer}>
                 <Text style={styles.badgeText}>Circle</Text>
            </View>

            <View style={styles.overlappingAvatars}>
                {(circleData.members || []).slice(0, 4).map((member, index) => (
                    <View key={index} style={[styles.avatarStackItem, { zIndex: 10 - index, marginLeft: index === 0 ? 0 : -15 }]}>
                         {member.avatar ? (
                            <Image source={{ uri: member.avatar }} style={styles.stackAvatar} />
                         ) : (
                            <View style={[styles.stackAvatar, { backgroundColor: '#FFB6C1', alignItems: 'center', justifyContent: 'center' }]}>
                                <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>{member.name?.charAt(0)}</Text>
                            </View>
                         )}
                    </View>
                ))}
                {(circleData.members?.length || 0) > 4 && (
                     <View style={[styles.avatarStackItem, { zIndex: 0, marginLeft: -15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#6B7280' }}>+{circleData.members!.length - 4}</Text>
                     </View>
                )}
            </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
            <View style={{ paddingTop: 0, paddingBottom: 0 }}>
                <CircleSelectionTabs
                    activeTab={activeTab}
                    onTabPress={setActiveTab}
                    tabs={tabs}
                    activeColor={tabsConfig.activeColor || "#FA7272"}
                    inactiveColor={tabsConfig.inactiveColor || "#F3F4F6"}
                    activeTextColor={tabsConfig.activeTextColor || "#FA7272"}
                    inactiveTextColor={tabsConfig.inactiveTextColor || "#6B7280"}
                    activeIconColor={tabsConfig.activeIconColor || "#FFFFFF"}
                    inactiveIconColor={tabsConfig.inactiveIconColor || "#6B7280"}
                    menuBackgroundColor={tabsConfig.menuBackgroundColor || 'transparent'}
                    menuShowShadow={tabsConfig.menuShowShadow}
                    activeShowShadow={tabsConfig.activeShowShadow}
                    inactiveShowShadow={tabsConfig.inactiveShowShadow}
                    fit={true}
                />
            </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'config' && renderConfigTab()}
        
        <View style={{ height: 100 }} /> 
      </ScrollView>

      {/* Floating Action Button for Invite */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowInviteModal(true)}
        activeOpacity={0.9}
      >
        <PlusIcon size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Invite Member</Text>
      </TouchableOpacity>

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
                 <Text style={{ fontSize: 24, color: '#9CA3AF' }}>×</Text>
               </TouchableOpacity>
             </View>

             <View style={styles.modalBody}>
                <View style={styles.inviteButtonsRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, { flex: 1, marginRight: 8 }]}
                        onPress={generateInviteCode}
                    >
                        <QrCodeIcon size={20} color={THEME_COLOR} />
                        <Text style={styles.actionButtonText}>Generate Code</Text>
                    </TouchableOpacity>
                </View>

                {circleData.inviteCode && (
                    <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Invite Code:</Text>
                    <View style={styles.codeDisplay}>
                        <Text style={styles.codeText}>{circleData.inviteCode}</Text>
                        <View style={styles.codeActions}>
                            <TouchableOpacity style={styles.codeActionButton} onPress={copyInviteCode}>
                                <CopyIcon size={16} color="#6B7280" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.codeActionButton} onPress={shareInviteCode}>
                                <Share2Icon size={16} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.expiryText}>
                        {formatExpiryTime(circleData.inviteCodeExpiry || '')}
                    </Text>
                    </View>
                )}

                <View style={styles.divider}>
                    <Text style={styles.dividerText}>OR BY EMAIL</Text>
                </View>
                
                <View style={styles.emailInputContainer}>
                     <MailIcon size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.emailInput}
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        placeholder="Enter email address"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                
                <TouchableOpacity
                    style={[styles.modalButton, styles.sendButton, { marginTop: 16 }]}
                    onPress={sendInviteEmail}
                    disabled={saving}
                >
                    <Text style={styles.sendButtonText}>
                        {saving ? 'Sending...' : 'Send Invite'}
                    </Text>
                </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>

    </SafeAreaView>
  );
};

export default CircleSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF', // Sticky-like appearance
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  
  // Immersive Header Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  heroLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  heroPlaceholderLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  heroEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: THEME_COLOR,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FAC7C7',
  },
  badgeText: {
    color: THEME_COLOR,
    fontWeight: '700',
    fontSize: 12,
  },
  overlappingAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  avatarStackItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  stackAvatar: {
    width: '100%',
    height: '100%',
  },

  // Tabs
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  // Content
  tabContent: {
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  
  // Basic Info Form
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginRight: 8,
  },
  inlineSaveButton: {
    backgroundColor: THEME_COLOR,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  storyContainer: {
    gap: 12,
  },

  // Modules/Config
  modulesContainer: {
    gap: 16,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleHeaderSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  moduleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  moduleDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  modulesSaveButton: {
    marginTop: 12,
  },

  // Member List
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberAvatarContainer: {
    marginRight: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  placeholderAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  memberStatus: {
    fontSize: 12,
    color: '#6B7280',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: THEME_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 0,
  },
  modalBody: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  inviteButtonsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  codeContainer: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#1F2937',
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
    color: '#9CA3AF',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dividerText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalButton: {}, // Helper
});


