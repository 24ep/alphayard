import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CircleMember as CircleMemberType } from '../../../types/circle';
import { homeStyles } from '../../../styles/homeStyles';

interface CircleMemberProps {
  member: CircleMemberType;
  index: number;
  selectedCircle: any;
}

const CircleMember: React.FC<CircleMemberProps> = ({ member, selectedCircle }) => {
  const navigation = useNavigation();

  const handleMemberPress = (member: CircleMemberType) => {
    if (member.isComposite) {
      // Navigate to circle group chat
      // @ts-ignore
      navigation.navigate('CircleGroupChat', {
        circleId: selectedCircle.id,
        circleName: selectedCircle.name,
        memberId: member.id,
        memberName: member.name,
        isGroupChat: true,
      });
    } else {
      // Navigate to individual member chat
      // @ts-ignore
      navigation.navigate('IndividualChat', {
        circleId: selectedCircle.id,
        circleName: selectedCircle.name,
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
                  style={homeStyles.avatarImage as any}
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

export default CircleMember;
