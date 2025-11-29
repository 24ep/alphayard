import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EditFamilyModal } from '../../components/hourse/EditFamilyModal';
import { AddMemberModal } from '../../components/hourse/AddMemberModal';
import { BrandingModal } from '../../components/hourse/BrandingModal';
import { colors, brandColors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'child';
  isOnline: boolean;
  lastSeen?: string;
  joinDate: string;
  permissions: {
    canInvite: boolean;
    canEditFamily: boolean;
    canViewLocation: boolean;
    canManageEvents: boolean;
  };
}

interface FamilySettings {
  name: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  privacy: 'public' | 'private' | 'invite-only';
  locationSharing: boolean;
  eventNotifications: boolean;
  safetyAlerts: boolean;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    customName?: string;
  };
}

const FamilyScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { currentFamily, updateFamily, leaveFamily } = useFamily();
  
  const [hourse, setFamily] = useState<FamilySettings | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings' | 'branding'>('overview');

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockFamily: FamilySettings = {
        name: 'The Johnson hourse',
        description: 'A loving hourse of 5 with 2 parents and 3 children',
        avatar: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
        privacy: 'private',
        locationSharing: true,
        eventNotifications: true,
        safetyAlerts: true,
        branding: {
          primaryColor: '#FF5A5A',
          secondaryColor: '#FF8C8C',
          customName: 'Johnson Clan',
        },
      };

      const mockMembers: FamilyMember[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
          role: 'admin',
          isOnline: true,
          lastSeen: 'Online',
          joinDate: '2023-01-15',
          permissions: {
            canInvite: true,
            canEditFamily: true,
            canViewLocation: true,
            canManageEvents: true,
          },
        },
        {
          id: '2',
          name: 'Mike Johnson',
          email: 'mike.johnson@email.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
          role: 'admin',
          isOnline: false,
          lastSeen: '2 hours ago',
          joinDate: '2023-01-15',
          permissions: {
            canInvite: true,
            canEditFamily: true,
            canViewLocation: true,
            canManageEvents: true,
          },
        },
      ];

      setFamily(mockFamily);
      setMembers(mockMembers);
    } catch (error) {
      console.error('Error loading hourse data:', error);
      Alert.alert(t('error'), t('hourse.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFamilyData();
    setRefreshing(false);
  };

  const handleUpdateFamily = async (updatedData: Partial<FamilySettings>) => {
    try {
      setFamily(prev => prev ? { ...prev, ...updatedData } : null);
      setShowEditModal(false);
      Alert.alert('Success', 'hourse updated successfully');
    } catch (error) {
      console.error('Error updating hourse:', error);
      Alert.alert('Error', 'Failed to update hourse');
    }
  };

  const handleAddMember = async (memberData: { name: string; email: string; role: string }) => {
    try {
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: memberData.name,
        email: memberData.email,
        role: memberData.role as 'admin' | 'member' | 'child',
        isOnline: false,
        lastSeen: 'Never',
        joinDate: new Date().toISOString().split('T')[0],
        permissions: {
          canInvite: memberData.role === 'admin',
          canEditFamily: memberData.role === 'admin',
          canViewLocation: memberData.role !== 'child',
          canManageEvents: memberData.role === 'admin',
        },
      };
      setMembers(prev => [...prev, newMember]);
      setShowAddMemberModal(false);
      Alert.alert('Success', 'Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'Failed to add member');
    }
  };

  const handleUpdateBranding = async (brandingData: any) => {
    try {
      setFamily(prev => prev ? {
        ...prev,
        branding: { ...prev.branding, ...brandingData }
      } : null);
      setShowBrandingModal(false);
      Alert.alert('Success', 'Branding updated successfully');
    } catch (error) {
      console.error('Error updating branding:', error);
      Alert.alert('Error', 'Failed to update branding');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#0078d4';
      case 'member': return '#4CAF50';
      case 'child': return '#FF9800';
      default: return '#666';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>{hourse?.name}</Text>
                <Text style={styles.headerSubtitle}>
                  {members.length} members
                </Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerButton} onPress={() => setShowEditModal(true)}>
                  <IconIon name="settings-outline" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMemberModal(true)}>
                  <IconIon name="person-add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {[
              { key: 'overview', label: 'Overview', icon: 'home-outline' },
              { key: 'members', label: 'Members', icon: 'people-outline' },
              { key: 'settings', label: 'Settings', icon: 'settings-outline' },
              { key: 'branding', label: 'Branding', icon: 'color-palette-outline' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <IconIon 
                  name={tab.icon} 
                  size={18} 
                  color={activeTab === tab.key ? '#0078d4' : '#666'} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <View style={styles.content}>
              <Text style={styles.familyName}>{hourse?.name}</Text>
              <Text style={styles.familyDescription}>{hourse?.description}</Text>
              
              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{members.length}</Text>
                  <Text style={styles.statLabel}>Total Members</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {members.filter(m => m.isOnline).length}
                  </Text>
                  <Text style={styles.statLabel}>Online Now</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {members.filter(m => m.role === 'admin').length}
                  </Text>
                  <Text style={styles.statLabel}>Admins</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'members' && (
            <View style={styles.content}>
              <View style={styles.membersHeader}>
                <Text style={styles.sectionTitle}>hourse Members</Text>
                <TouchableOpacity style={styles.inviteButton} onPress={() => setShowAddMemberModal(true)}>
                  <IconIon name="person-add" size={16} color="#0078d4" />
                  <Text style={styles.inviteButtonText}>Add Member</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.membersList}>
                {members.map((member) => (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <Image 
                        source={{ uri: member.avatar }} 
                        style={styles.memberAvatar}
                      />
                      <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberEmail}>{member.email}</Text>
                        <View style={styles.memberMeta}>
                          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) }]}>
                            <Text style={styles.roleText}>{member.role}</Text>
                          </View>
                          <View style={styles.statusIndicator}>
                            <View style={[styles.statusDot, { backgroundColor: member.isOnline ? '#4CAF50' : '#ccc' }]} />
                            <Text style={styles.statusText}>
                              {member.isOnline ? 'Online' : member.lastSeen}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'settings' && (
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>hourse Settings</Text>
              
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSubtitle}>Privacy</Text>
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>hourse Visibility</Text>
                    <Text style={styles.settingDescription}>Control who can see your hourse</Text>
                  </View>
                  <View style={styles.settingValue}>
                    <Text style={styles.settingValueText}>{hourse?.privacy}</Text>
                    <IconIon name="chevron-forward" size={16} color="#666" />
                  </View>
                </View>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.settingsSubtitle}>Notifications</Text>
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Location Sharing</Text>
                    <Text style={styles.settingDescription}>Share location with hourse members</Text>
                  </View>
                  <View style={[styles.toggle, hourse?.locationSharing && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, hourse?.locationSharing && styles.toggleThumbActive]} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'branding' && (
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>hourse Branding</Text>
              
              <View style={styles.brandingPreview}>
                <View style={[styles.brandingCard, { backgroundColor: hourse?.branding.primaryColor }]}>
                  <Text style={styles.brandingName}>{hourse?.branding.customName}</Text>
                  <Text style={styles.brandingSubtitle}>{hourse?.name}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.customizationButton} onPress={() => setShowBrandingModal(true)}>
                <IconIon name="color-palette" size={16} color="#0078d4" />
                <Text style={styles.customizationButtonText}>Customize Branding</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <EditFamilyModal
        visible={showEditModal}
        hourse={hourse}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdateFamily}
      />

      <AddMemberModal
        visible={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddMember}
      />

      <BrandingModal
        visible={showBrandingModal}
        branding={hourse?.branding || { primaryColor: '#FF5A5A', secondaryColor: '#FF8C8C' }}
        onClose={() => setShowBrandingModal(false)}
        onUpdate={handleUpdateBranding}
      />
    </View>
  );
};

export default FamilyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '300',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0078d4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666666',
  },
  activeTabText: {
    color: '#0078d4',
    fontWeight: '500',
  },

  // Content
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  familyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  familyDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 24,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },

  // Members
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f8ff',
    gap: 6,
  },
  inviteButtonText: {
    fontSize: 13,
    color: '#0078d4',
    fontWeight: '500',
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: '#666666',
  },

  // Settings
  settingsSection: {
    marginBottom: 24,
  },
  settingsSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666666',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    fontSize: 14,
    color: '#666666',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#0078d4',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },

  // Branding
  brandingPreview: {
    marginBottom: 24,
  },
  brandingCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  brandingName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  brandingSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  customizationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 12,
  },
  customizationButtonText: {
    fontSize: 15,
    color: '#0078d4',
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 20,
  },
}); 