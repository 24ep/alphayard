import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Modal } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  isOnline: boolean;
}

interface GroupManagementProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  members: GroupMember[];
  allFamilyMembers: any[];
  onCreateGroup: (groupName: string, selectedMembers: string[]) => void;
  onInviteMembers: (groupId: string, memberIds: string[]) => void;
  onRemoveMember: (groupId: string, memberId: string) => void;
  onLeaveGroup: (groupId: string) => void;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({
  visible,
  onClose,
  groupId,
  groupName,
  members,
  allFamilyMembers,
  onCreateGroup,
  onInviteMembers,
  onRemoveMember,
  onLeaveGroup,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isCreateMode = !groupId;
  const isManageMode = !!groupId;

  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }
    onCreateGroup(newGroupName.trim(), selectedMembers);
    setNewGroupName('');
    setSelectedMembers([]);
    onClose();
  };

  const handleInviteMembers = () => {
    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select members to invite');
      return;
    }
    onInviteMembers(groupId!, selectedMembers);
    setSelectedMembers([]);
    onClose();
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onRemoveMember(groupId!, memberId)
        }
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            onLeaveGroup(groupId!);
            onClose();
          }
        }
      ]
    );
  };

  const filteredFamilyMembers = allFamilyMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !members.some(groupMember => groupMember.id === member.id)
  );

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? '#10B981' : '#6B7280';
  };

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
          <Text style={styles.headerTitle}>
            {isCreateMode ? 'Create Group' : 'Manage Group'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        {isManageMode && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'create' && styles.activeTab]}
              onPress={() => setActiveTab('create')}
            >
              <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
                Invite Members
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'manage' && styles.activeTab]}
              onPress={() => setActiveTab('manage')}
            >
              <Text style={[styles.tabText, activeTab === 'manage' && styles.activeTabText]}>
                Manage Members
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Create Group Section */}
          {(isCreateMode || activeTab === 'create') && (
            <View style={styles.section}>
              {isCreateMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.sectionTitle}>Group Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter group name..."
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    maxLength={50}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.sectionTitle}>
                  {isCreateMode ? 'Select Members' : 'Invite Members'}
                </Text>
                
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <IconIon name="search" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search hourse members..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {/* Selected Members Count */}
                {selectedMembers.length > 0 && (
                  <Text style={styles.selectedCount}>
                    {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                  </Text>
                )}

                {/* hourse Members List */}
                <View style={styles.membersList}>
                  {filteredFamilyMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberItem,
                        selectedMembers.includes(member.id) && styles.selectedMemberItem
                      ]}
                      onPress={() => handleMemberToggle(member.id)}
                    >
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                          {member.name.charAt(0)}
                        </Text>
                        <View style={[
                          styles.onlineIndicator,
                          { backgroundColor: getStatusColor(member.status === 'online') }
                        ]} />
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberStatus}>
                          {member.status === 'online' ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                      {selectedMembers.includes(member.id) && (
                        <IconIon name="checkmark-circle" size={24} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Manage Members Section */}
          {isManageMode && activeTab === 'manage' && (
            <View style={styles.section}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{groupName}</Text>
                <Text style={styles.memberCount}>
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={styles.membersList}>
                {members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {member.name.charAt(0)}
                      </Text>
                      <View style={[
                        styles.onlineIndicator,
                        { backgroundColor: getStatusColor(member.isOnline) }
                      ]} />
                    </View>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        {member.isAdmin && (
                          <View style={styles.adminBadge}>
                            <Text style={styles.adminText}>Admin</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberStatus}>
                        {member.isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                    {!member.isAdmin && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveMember(member.id, member.name)}
                      >
                        <IconIon name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Leave Group Button */}
              <TouchableOpacity style={styles.leaveGroupButton} onPress={handleLeaveGroup}>
                <IconIon name="exit-outline" size={20} color="#EF4444" />
                <Text style={styles.leaveGroupText}>Leave Group</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {(isCreateMode || (isManageMode && activeTab === 'create')) && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.primaryButton,
                (selectedMembers.length === 0 || (isCreateMode && !newGroupName.trim())) && styles.disabledButton
              ]}
              onPress={isCreateMode ? handleCreateGroup : handleInviteMembers}
              disabled={selectedMembers.length === 0 || (isCreateMode && !newGroupName.trim())}
            >
              <Text style={styles.actionButtonText}>
                {isCreateMode ? 'Create Group' : 'Invite Members'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
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
  inputContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  selectedCount: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 12,
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
  },
  selectedMemberItem: {
    backgroundColor: '#FEF7F7',
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  memberAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  memberAvatarText: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB6C1',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 40,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  adminBadge: {
    backgroundColor: '#FFB6C1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  adminText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  memberStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeButton: {
    padding: 4,
  },
  groupInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  leaveGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    paddingVertical: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  leaveGroupText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFB6C1',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
