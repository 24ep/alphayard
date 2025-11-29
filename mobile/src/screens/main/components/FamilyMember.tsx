import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FamilyMember as FamilyMemberType } from '../../../types/home';
import { homeStyles } from '../../../styles/homeStyles';

interface FamilyMemberProps {
  member: FamilyMemberType;
  index: number;
  selectedFamily: any;
}

const FamilyMember: React.FC<FamilyMemberProps> = ({ member, index, selectedFamily }) => {
  const navigation = useNavigation();

  const handleMemberPress = (member: FamilyMemberType) => {
    if (member.isComposite) {
      // Navigate to hourse group chat
      // @ts-ignore
      navigation.navigate('FamilyGroupChat', {
        familyId: selectedFamily.id,
        familyName: selectedFamily.name,
        memberId: member.id,
        memberName: member.name,
        isGroupChat: true,
      });
    } else {
      // Navigate to individual member chat
      // @ts-ignore
      navigation.navigate('IndividualChat', {
        familyId: selectedFamily.id,
        familyName: selectedFamily.name,
        memberId: member.id,
        memberName: member.name,
        memberType: member.type,
        isGroupChat: false,
      });
    }
  };

  return (
    <TouchableOpacity 
      key={member.id} 
      style={homeStyles.memberContainer}
      onPress={() => handleMemberPress(member)}
    >
      <View style={homeStyles.memberAvatar}>
        {member.isComposite ? (
          <View style={homeStyles.compositeAvatar}>
            <View style={homeStyles.avatarGrid}>
              <View style={[homeStyles.avatarQuarter, homeStyles.avatarTopLeft]} />
              <View style={[homeStyles.avatarQuarter, homeStyles.avatarTopRight]} />
              <View style={[homeStyles.avatarQuarter, homeStyles.avatarBottomLeft]} />
              <View style={[homeStyles.avatarQuarter, homeStyles.avatarBottomRight]} />
            </View>
          </View>
        ) : (
          <View style={homeStyles.singleAvatar}>
            {member.avatarUrl ? (
              <View style={homeStyles.avatarImageContainer}>
                <Image 
                  source={{ uri: member.avatarUrl }} 
                  style={homeStyles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              // Fallback to custom avatars if no URL
              <View style={homeStyles.avatarContent}>
                {member.type === 'blonde-sunglasses' && (
                  <>
                    <View style={homeStyles.avatarHair} />
                    <View style={homeStyles.avatarSunglasses} />
                    <View style={homeStyles.avatarVest} />
                    <View style={homeStyles.avatarCup} />
                    <View style={homeStyles.avatarCane} />
                  </>
                )}
                {member.type === 'turban-beard' && (
                  <>
                    <View style={homeStyles.avatarTurban} />
                    <View style={homeStyles.avatarBeard} />
                    <View style={homeStyles.avatarSuit} />
                    <View style={homeStyles.avatarTie} />
                    <View style={homeStyles.avatarPhone} />
                  </>
                )}
                {member.type === 'curly-hair' && (
                  <>
                    <View style={homeStyles.avatarCurlyHair} />
                    <View style={homeStyles.avatarGreenTop} />
                    <View style={homeStyles.avatarNecklace} />
                    <View style={homeStyles.avatarVitiligo} />
                  </>
                )}
              </View>
            )}
          </View>
        )}
        {member.notifications > 0 && (
          <View style={homeStyles.memberBadge}>
            <Text style={homeStyles.memberBadgeText}>
              {member.notifications > 99 ? '99+' : member.notifications}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default FamilyMember;
