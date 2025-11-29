import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, textColors } from '../../theme/colors';

interface ProfileStatsProps {
  postsCount: number;
  familyMembers: number;
  emergencyContacts: number;
  accountAge: Date;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  postsCount,
  familyMembers,
  emergencyContacts,
  accountAge,
}) => {
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getAccountAge = () => {
    const now = new Date();
    const ageInMonths = Math.floor((now.getTime() - accountAge.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (ageInMonths >= 12) {
      const years = Math.floor(ageInMonths / 12);
      return `${years}y`;
    }
    return `${ageInMonths}m`;
  };

  const stats = [
    {
      icon: 'post',
      value: formatNumber(postsCount),
      label: t('profile.posts'),
      gradient: ['#FF6B6B', '#FF8E8E'],
      description: t('profile.postsDesc'),
    },
    {
      icon: 'account-group',
      value: formatNumber(familyMembers),
      label: t('profile.hourse'),
      gradient: ['#4ECDC4', '#6ED5D5'],
      description: t('profile.familyDesc'),
    },
    {
      icon: 'phone-alert',
      value: formatNumber(emergencyContacts),
      label: t('profile.contacts'),
      gradient: ['#45B7D1', '#6BC5D1'],
      description: t('profile.contactsDesc'),
    },
    {
      icon: 'calendar-check',
      value: getAccountAge(),
      label: t('profile.member'),
      gradient: ['#96CEB4', '#A8D5C4'],
      description: t('profile.memberDesc'),
    },
  ];

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={t('profile.userStatistics')}
    >
      <Text style={styles.sectionTitle}>{t('profile.overview')}</Text>
      
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.statCard} 
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel={`${stat.label}: ${stat.value}`}
            accessibilityHint={stat.description}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={stat.gradient}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Icon name={stat.icon} size={28} color="#FFFFFF" />
                </View>
                
                <View style={styles.statInfo}>
                  <Text 
                    style={styles.statValue}
                    accessible={false}
                  >
                    {stat.value}
                  </Text>
                  <Text 
                    style={styles.statLabel}
                    accessible={false}
                  >
                    {stat.label}
                  </Text>
                </View>
              </View>
              
              {/* Decorative element */}
              <View style={styles.decorativeElement} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginTop: -30,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: textColors.primary,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statGradient: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  statContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backdropFilter: 'blur(10px)',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  decorativeElement: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
});

export default ProfileStats;