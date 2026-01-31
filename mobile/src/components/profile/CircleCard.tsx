import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, textColors } from '../../theme/colors';

const IconMC = Icon as any;

interface Circle {
  id: string;
  name: string;
  members?: Array<{
    id: string;
    name: string;
    role: 'admin' | 'member';
  }>;
}

interface CircleCardProps {
  circle: Circle;
  onViewCircle: () => void;
  onLeaveCircle: () => void;
}

export const CircleCard: React.FC<CircleCardProps> = ({
  circle,
  onViewCircle,
  onLeaveCircle,
}) => {
  const { t } = useTranslation();

  const handleLeaveCircle = () => {
    Alert.alert(
      t('profile.leaveCircleTitle'),
      t('profile.leaveCircleConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('leave'), style: 'destructive', onPress: onLeaveCircle },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('profile.myCircle')}</Text>
      
      <View style={styles.circleCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.circleIconContainer}>
            <IconMC name="account-group" size={28} color="#FFFFFF" />
          </View>
          
          <View style={styles.circleInfo}>
            <Text style={styles.circleName}>{circle.name}</Text>
            <Text style={styles.memberCount}>
              {circle.members?.length || 0} {t('profile.members')}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => Alert.alert(
              t('profile.circleActions'),
              '',
              [
                { text: t('cancel'), style: 'cancel' },
                { text: t('profile.viewCircle'), onPress: onViewCircle },
                { text: t('profile.leaveCircle'), style: 'destructive', onPress: handleLeaveCircle },
              ]
            )}
          >
            <IconMC name="dots-vertical" size={20} color={textColors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Circle Members Preview */}
        <View style={styles.membersPreview}>
          <Text style={styles.membersTitle}>{t('profile.recentMembers')}</Text>
          
          <View style={styles.membersGrid}>
            {circle.members?.slice(0, 4).map((member, index) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name}
                </Text>
                {member.role === 'admin' && (
                  <View style={styles.adminBadge}>
                    <IconMC name="crown" size={10} color="#FFD700" />
                  </View>
                )}
              </View>
            ))}
            
            {(circle.members?.length || 0) > 4 && (
              <TouchableOpacity style={styles.moreMembers} onPress={onViewCircle}>
                <Text style={styles.moreMembersText}>
                  +{(circle.members?.length || 0) - 4}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={onViewCircle}>
            <IconMC name="eye" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{t('profile.viewCircle')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLeaveCircle}>
            <IconMC name="exit-to-app" size={16} color={colors.error} />
            <Text style={styles.secondaryButtonText}>{t('profile.leave')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: textColors.primary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  circleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: 18,
    fontWeight: '700',
    color: textColors.primary,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: textColors.secondary,
  },
  moreButton: {
    padding: 8,
  },
  membersPreview: {
    marginBottom: 20,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: textColors.secondary,
    marginBottom: 12,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberItem: {
    alignItems: 'center',
    width: 60,
    position: 'relative',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: 10,
    color: textColors.secondary,
    textAlign: 'center',
  },
  adminBadge: {
    position: 'absolute',
    top: -2,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  moreMembers: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[50], // backgroundLight
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200], // border
    borderStyle: 'dashed',
  },
  moreMembersText: {
    fontSize: 12,
    fontWeight: '600',
    color: textColors.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50], // backgroundLight
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200], // border
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
});
