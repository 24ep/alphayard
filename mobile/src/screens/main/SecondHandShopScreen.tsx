import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CoolIcon from '../../components/common/CoolIcon';

const SecondHandShopScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <LinearGradient
        colors={['#FFB6C1', '#FFD1DC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1F2937' }}>Second Hand Shop</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: 10, borderRadius: 12 }}>
              <CoolIcon name="search" size={18} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#4B5563', marginBottom: 16 }}>
          Browse and post second-hand items. Choose Buy to discover items, or Sell to list your own. Negotiations happen directly between users.
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <TouchableOpacity style={{ flex: 1 }}>
            <LinearGradient colors={[ '#60A5FA', '#3B82F6' ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
              <CoolIcon name="search" size={22} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', marginTop: 8 }}>Want to Buy</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }}>
            <LinearGradient colors={[ '#34D399', '#10B981' ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
              <CoolIcon name="plus" size={22} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', marginTop: 8 }}>Sell Item</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' }}>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>
            This is a placeholder screen. We will add listings, filters, and chat/offer flow here next. For now, use the buttons above to indicate your intent.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default SecondHandShopScreen;


