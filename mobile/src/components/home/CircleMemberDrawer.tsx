import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { X, ChevronRight, User } from 'lucide-react-native';

// Icon proxies
const XIcon = X as any;
const ChevronRightIcon = ChevronRight as any;
const UserIcon = User as any;

interface CircleMemberDrawerProps {
  visible: boolean;
  onClose: () => void;
  member: any | null; // Selected member to view details
  members?: any[];    // Full list if viewing all
}

export const CircleMemberDrawer: React.FC<CircleMemberDrawerProps> = ({
  visible,
  onClose,
  member,
  members = []
}) => {
  const [viewMember, setViewMember] = useState<any | null>(null);

  // Effect to sync internal state with prop, but allow navigation within drawer
  React.useEffect(() => {
    setViewMember(member);
  }, [member, visible]);

  const activeMember = viewMember || member;
  const showList = !activeMember && members.length > 0;

  const renderMemberItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
        style={styles.memberRow} 
        onPress={() => setViewMember(item)}
    >
        <View style={styles.avatarContainer}>
            {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
            ) : (
                <View style={[styles.avatarSmall, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
                    <UserIcon size={20} color="#9CA3AF" />
                </View>
            )}
            {item.status === 'online' && <View style={styles.onlineBadge} />}
        </View>
        <View style={styles.memberInfoRow}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberStatus}>{item.status || 'Offline'}</Text>
        </View>
        <ChevronRightIcon size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.container}>
            <View style={styles.handleContainer}>
                <View style={styles.handle} />
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>
                    {activeMember ? 'Member Profile' : `Circle Members (${members.length})`}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <XIcon size={24} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {activeMember ? (
                <View style={styles.profileContent}>
                    {/* Back to list if we have a list */}
                    {!member && members.length > 0 && (
                        <TouchableOpacity onPress={() => setViewMember(null)} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Back to list</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.profileHeader}>
                        <View style={styles.avatarLargeContainer}>
                            {activeMember.avatar ? (
                                <Image source={{ uri: activeMember.avatar }} style={styles.avatarLarge} />
                            ) : (
                                <View style={[styles.avatarLarge, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
                                    <UserIcon size={40} color="#9CA3AF" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.profileName}>{activeMember.name}</Text>
                        <Text style={styles.profileStatus}>{activeMember.status || 'Offline'}</Text>
                    </View>
                    
                    {/* Placeholder for more profile details */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailItem}>
                             <Text style={styles.detailLabel}>Role</Text>
                             <Text style={styles.detailValue}>{activeMember.role || 'Member'}</Text>
                        </View>
                         <View style={styles.detailItem}>
                             <Text style={styles.detailLabel}>Joined</Text>
                             <Text style={styles.detailValue}>Jan 2024</Text>
                        </View>
                    </View>
                 </View>
            ) : (
                <FlatList
                    data={members}
                    renderItem={renderMemberItem}
                    keyExtractor={(item, index) => item.id || String(index)}
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
      alignItems: 'center',
      paddingVertical: 12,
  },
  handle: {
      width: 40,
      height: 5,
      backgroundColor: '#E5E7EB',
      borderRadius: 2.5,
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
  },
  title: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
  },
  closeButton: {
      padding: 4,
  },
  
  // List Styles
  list: {
      flex: 1,
  },
  memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#F9FAFB',
  },
  avatarContainer: {
      position: 'relative',
      marginRight: 16,
  },
  avatarSmall: {
      width: 48,
      height: 48,
      borderRadius: 24,
  },
  onlineBadge: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#10B981',
      position: 'absolute',
      bottom: 0,
      right: 0,
      borderWidth: 2,
      borderColor: '#FFFFFF',
  },
  memberInfoRow: {
      flex: 1,
  },
  memberName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
  },
  memberStatus: {
      fontSize: 13,
      color: '#6B7280',
      marginTop: 2,
  },

  // Profile Styles
  profileContent: {
      flex: 1,
      padding: 24,
  },
  backButton: {
      marginBottom: 20,
  },
  backButtonText: {
      color: '#FA7272',
      fontSize: 15,
      fontWeight: '500',
  },
  profileHeader: {
      alignItems: 'center',
      marginBottom: 32,
  },
  avatarLargeContainer: {
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
  },
  avatarLarge: {
      width: 100,
      height: 100,
      borderRadius: 50,
  },
  profileName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 4,
  },
  profileStatus: {
      fontSize: 16,
      color: '#6B7280',
  },
  detailsContainer: {
      backgroundColor: '#F9FAFB',
      borderRadius: 16,
      padding: 20,
  },
  detailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
      fontSize: 15,
      color: '#6B7280',
  },
  detailValue: {
      fontSize: 15,
      fontWeight: '600',
      color: '#1F2937',
  },
});
