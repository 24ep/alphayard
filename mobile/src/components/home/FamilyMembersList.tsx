import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface FamilyMember {
  id: string;
  name: string;
  notifications: number;
  isComposite: boolean;
  type: string;
  familyId: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
  role?: string;
}

interface FamilyMembersListProps {
  members: FamilyMember[];
}

export const FamilyMembersList: React.FC<FamilyMembersListProps> = ({ members }) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'away': return '#F59E0B';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'parent': return 'person';
      case 'child': return 'person-outline';
      case 'guardian': return 'shield';
      default: return 'person';
    }
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={homeStyles.familyMembersScrollView}
      contentContainerStyle={homeStyles.familyMembersScrollContent}
    >
      {members.map((member, index) => (
        <TouchableOpacity 
          key={member.id} 
          style={[
            homeStyles.familyMemberCard,
            selectedMember === member.id && homeStyles.familyMemberCardSelected
          ]}
          onPress={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
          activeOpacity={0.8}
        >
          <View style={homeStyles.familyMemberCardContent}>
            {/* Avatar with Status */}
            <View style={homeStyles.familyMemberAvatarContainer}>
              <View style={[
                homeStyles.familyMemberAvatar,
                { backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 60%)` }
              ]}>
                {member.avatarUrl ? (
                  <View style={homeStyles.familyMemberAvatarImage}>
                    <Text style={homeStyles.familyMemberAvatarText}>
                      {member.name.charAt(0)}
                    </Text>
                  </View>
                ) : (
                  <Text style={homeStyles.familyMemberAvatarText}>
                    {member.name.charAt(0)}
                  </Text>
                )}
              </View>
              
              {/* Status Indicator */}
              <View style={[
                homeStyles.familyMemberStatusIndicator,
                { backgroundColor: getStatusColor(member.status) }
              ]} />
              
              {/* Notification Badge */}
              {member.notifications > 0 && (
                <View style={homeStyles.familyMemberNotificationBadge}>
                  <Text style={homeStyles.familyMemberNotificationText}>
                    {member.notifications > 99 ? '99+' : member.notifications}
                  </Text>
                </View>
              )}
            </View>

            {/* Member Info */}
            <View style={homeStyles.familyMemberInfo}>
              <Text style={homeStyles.familyMemberName} numberOfLines={1}>
                {member.name}
              </Text>
              
              <View style={homeStyles.familyMemberDetails}>
                <View style={homeStyles.familyMemberRole}>
                  <IconIon 
                    name={getRoleIcon(member.role)} 
                    size={12} 
                    color="#6B7280" 
                  />
                  <Text style={homeStyles.familyMemberRoleText}>
                    {member.role || 'Member'}
                  </Text>
                </View>
                
                {member.lastSeen && (
                  <Text style={homeStyles.familyMemberLastSeen}>
                    {member.lastSeen}
                  </Text>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            {selectedMember === member.id && (
              <View style={homeStyles.familyMemberQuickActions}>
                <TouchableOpacity style={homeStyles.familyMemberActionButton}>
                  <IconIon name="call" size={16} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity style={homeStyles.familyMemberActionButton}>
                  <IconIon name="chatbubble" size={16} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity style={homeStyles.familyMemberActionButton}>
                  <IconIon name="location" size={16} color="#F59E0B" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
      
      {/* Add Member Card */}
      <TouchableOpacity style={homeStyles.addFamilyMemberCard}>
        <View style={homeStyles.addFamilyMemberIcon}>
          <IconIon name="add" size={24} color="#6B7280" />
        </View>
        <Text style={homeStyles.addFamilyMemberText}>Add Member</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
