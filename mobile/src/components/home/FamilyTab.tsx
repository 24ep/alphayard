import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { FamilyStatusCards } from './FamilyStatusCards';
import { FamilyLocationMap } from './FamilyLocationMap';
import { FamilyMemberDrawer } from './FamilyMemberDrawer';

interface FamilyTabProps {
  familyMembers: any[];
  familyStatusMembers: any[];
  familyLocations: any[];
}

export const FamilyTab: React.FC<FamilyTabProps> = ({
  familyMembers,
  familyStatusMembers,
  familyLocations,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  

  return (
    <ScrollView 
      style={homeStyles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      

      {/* hourse Status */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Live Status</Text>
          <TouchableOpacity style={homeStyles.refreshButton}>
            <IconIon name="refresh" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <FamilyStatusCards 
          members={familyStatusMembers}
          onMemberPress={(m) => { setSelectedMember(m); setDrawerVisible(true); }}
        />
      </View>

      {/* hourse Location */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>hourse Locations</Text>
          <TouchableOpacity style={homeStyles.mapToggleButton}>
            <IconMC name="map" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <FamilyLocationMap locations={familyLocations} />
      </View>

      

      {/* hourse Insights */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>hourse Insights</Text>
          <TouchableOpacity style={homeStyles.insightsButton}>
            <IconIon name="analytics" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={homeStyles.insightsGrid}>
          <View style={homeStyles.insightCard}>
            <View style={homeStyles.insightIcon}>
              <IconMC name="heart" size={20} color="#EF4444" />
            </View>
            <Text style={homeStyles.insightValue}>98%</Text>
            <Text style={homeStyles.insightLabel}>Health Score</Text>
          </View>
          <View style={homeStyles.insightCard}>
            <View style={homeStyles.insightIcon}>
              <IconMC name="walk" size={20} color="#10B981" />
            </View>
            <Text style={homeStyles.insightValue}>12.5k</Text>
            <Text style={homeStyles.insightLabel}>Avg Steps</Text>
          </View>
          <View style={homeStyles.insightCard}>
            <View style={homeStyles.insightIcon}>
              <IconMC name="sleep" size={20} color="#3B82F6" />
            </View>
            <Text style={homeStyles.insightValue}>7.2h</Text>
            <Text style={homeStyles.insightLabel}>Avg Sleep</Text>
          </View>
          <View style={homeStyles.insightCard}>
            <View style={homeStyles.insightIcon}>
              <IconMC name="emoticon-happy" size={20} color="#F59E0B" />
            </View>
            <Text style={homeStyles.insightValue}>4.8</Text>
            <Text style={homeStyles.insightLabel}>Mood</Text>
          </View>
        </View>
      </View>
      <FamilyMemberDrawer 
        visible={drawerVisible}
        member={selectedMember}
        onClose={() => setDrawerVisible(false)}
      />
    </ScrollView>
  );
};
