import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { FONT_STYLES } from '../../utils/fontUtils';

type MenuItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string[];
  targetAuthRoute?: keyof import('../../navigation/AuthNavigator').AuthStackParamList;
};

const MarketMenuScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const items: MenuItem[] = useMemo(
    () => [
      {
        key: 'market-second-hand',
        title: 'Second-hand Market',
        subtitle: 'Buy & sell within community',
        icon: 'storefront',
        gradient: ['#FA7272', '#FFBBB4'],
      },
      {
        key: 'market-services',
        title: 'Services',
        subtitle: 'Tutors, babysitters, repair',
        icon: 'account-cog',
        gradient: ['#7F7FD5', '#86A8E7'],
      },
      {
        key: 'market-events',
        title: 'Local Events',
        subtitle: 'Workshops & activities',
        icon: 'calendar-star',
        gradient: ['#43CEA2', '#185A9D'],
      },
    ],
    []
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FA7272", "#FFBBB4"]} style={styles.header}>
        <Text style={styles.headerTitle}>Market</Text>
        <Text style={styles.headerSubtitle}>Explore before creating an account</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => {
              // For unauthenticated preview, send to Login when interacting deeply
              navigation.navigate('Login');
            }}
          >
            <LinearGradient colors={item.gradient} style={styles.cardGradient}>
              <View style={styles.cardIconWrap}>
                <Icon name={item.icon} size={28} color="#FFFFFF" />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.ctaText}>Create free account</Text>
          <Icon name="account-plus" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 72, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: FONT_STYLES.englishHeading,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    fontSize: 14,
    fontFamily: FONT_STYLES.englishBody,
  },
  content: { padding: 20, gap: 14 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)'
  },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    marginTop: 2,
    fontFamily: FONT_STYLES.englishBody,
  },
  cta: {
    marginTop: 6,
    backgroundColor: '#FA7272',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
});

export default MarketMenuScreen;


