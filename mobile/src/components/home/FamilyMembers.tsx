import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import { homeStyles } from '../../styles/homeStyles';
import { FamilyMember } from '../../types/home';

interface FamilyMembersProps {
  members: FamilyMember[];
  onMemberPress: (member: FamilyMember) => void;
  onAddMemberPress: () => void;
}

const FamilyMembers: React.FC<FamilyMembersProps> = ({
  members,
  onMemberPress,
  onAddMemberPress,
}) => {
  const renderMemberAvatar = (member: FamilyMember) => {
    if (member.isComposite) {
      return (
        <View style={homeStyles.compositeAvatar}>
          <View style={homeStyles.avatarGrid}>
            <View style={[homeStyles.avatarQuarter, homeStyles.avatarTopLeft]} />
            <View style={[homeStyles.avatarQuarter, homeStyles.avatarTopRight]} />
            <View style={[homeStyles.avatarQuarter, homeStyles.avatarBottomLeft]} />
            <View style={[homeStyles.avatarQuarter, homeStyles.avatarBottomRight]} />
          </View>
        </View>
      );
    }

    return (
      <View style={homeStyles.singleAvatar}>
        {member.avatarUrl ? (
          <Image source={{ uri: member.avatarUrl }} style={homeStyles.avatarImage} />
        ) : (
          <Text style={{ fontSize: 20, color: '#333333' }}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={homeStyles.familyMembersSection}>
      {/* Group Avatar */}
      <View style={homeStyles.groupAvatarCard}>
        <IconIon name="people" size={32} color="#FF5A5A" />
      </View>

      {/* Individual Members */}
      <View style={homeStyles.individualMembersCard}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={homeStyles.individualMembersScroll}
        >
          {members.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={homeStyles.memberContainer}
              onPress={() => onMemberPress(member)}
            >
              <View style={homeStyles.memberAvatar}>
                {renderMemberAvatar(member)}
                {member.notifications > 0 && (
                  <View style={homeStyles.memberBadge}>
                    <Text style={homeStyles.memberBadgeText}>
                      {member.notifications > 99 ? '99+' : member.notifications}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={homeStyles.memberContainer}
            onPress={onAddMemberPress}
          >
            <View style={homeStyles.moreMembers}>
              <IconIon name="add" size={20} color="#666666" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default FamilyMembers;
