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

interface hourse {
  id: string;
  name: string;
  members?: Array<{
    id: string;
    name: string;
    role: 'admin' | 'member';
  }>;
}

interface FamilyCardProps {
  hourse: hourse;
  onViewFamily: () => void;
  onLeaveFamily: () => void;
}

export const FamilyCard: React.FC<FamilyCardProps> = ({
  hourse,
  onViewFamily,
  onLeaveFamily,
}) => {
  const { t } = useTranslation();

  const handleLeaveFamily = () => {
    Alert.alert(
      t('profile.leaveFamilyTitle'),
      t('profile.leaveFamilyConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('leave'), style: 'destructive', onPress: onLeaveFamily },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('profile.myFamily')}</Text>
      
      <View style={styles.familyCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.familyIconContainer}>
            <Icon name="house-03" size={28} color="#FFFFFF" />
          </View>
          
          <View style={styles.familyInfo}>
            <Text style={styles.familyName}>{hourse.name}</Text>
            <Text style={styles.memberCount}>
              {hourse.members?.length || 0} {t('profile.members')}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => Alert.alert(
              t('profile.familyActions'),
              '',
              [
                { text: t('cancel'), style: 'cancel' },
                { text: t('profile.viewFamily'), onPress: onViewFamily },
                { text: t('profile.leaveFamily'), style: 'destructive', onPress: handleLeaveFamily },
              ]
            )}
          >
            <Icon name="dots-vertical" size={20} color={textColors.primarySecondary} />
          </TouchableOpacity>
        </View>

        {/* hourse Members Preview */}
        <View style={styles.membersPreview}>
          <Text style={styles.membersTitle}>{t('profile.recentMembers')}</Text>
          
          <View style={styles.membersGrid}>
            {hourse.members?.slice(0, 4).map((member, index) => (
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
                    <Icon name="crown" size={10} color="#FFD700" />
                  </View>
                )}
              </View>
            ))}
            
            {(hourse.members?.length || 0) > 4 && (
              <TouchableOpacity style={styles.moreMembers} onPress={onViewFamily}>
                <Text style={styles.moreMembersText}>
                  +{(hourse.members?.length || 0) - 4}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={onViewFamily}>
            <Icon name="eye" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{t('profile.viewFamily')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLeaveFamily}>
            <Icon name="exit-to-app" size={16} color={colors.error} />
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
  familyCard: {
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
  familyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 18,
    fontWeight: '700',
    color: textColors.primary,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: textColors.primarySecondary,
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
    color: textColors.primarySecondary,
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
    backgroundColor: colors.primary,
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
    color: textColors.primarySecondary,
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
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  moreMembersText: {
    fontSize: 12,
    fontWeight: '600',
    color: textColors.primarySecondary,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.backgroundLight,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FamilyCard;