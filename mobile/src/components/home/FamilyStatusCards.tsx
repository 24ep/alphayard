import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';

interface FamilyStatusMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive: Date;
  heartRate: number;
  heartRateHistory: number[];
  steps: number;
  sleepHours: number;
  location: string;
  batteryLevel: number;
  isEmergency: boolean;
  mood?: 'happy' | 'neutral' | 'sad' | 'stressed';
  activity?: string;
  temperature?: number;
}

interface FamilyStatusCardsProps {
  members: FamilyStatusMember[];
  onMemberPress?: (member: FamilyStatusMember) => void;
}

export const FamilyStatusCards: React.FC<FamilyStatusCardsProps> = ({ members, onMemberPress }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'away': return '#F59E0B';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'happy': return { name: 'happy', color: '#10B981' };
      case 'neutral': return { name: 'remove', color: '#6B7280' };
      case 'sad': return { name: 'sad', color: '#EF4444' };
      case 'stressed': return { name: 'warning', color: '#F59E0B' };
      default: return { name: 'help', color: '#6B7280' };
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#10B981';
    if (level > 20) return '#F59E0B';
    return '#EF4444';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <View style={homeStyles.familyStatusVerticalContainer}>
      {members.map((member, index) => {
        const isExpanded = expandedCard === member.id;
        const moodData = getMoodIcon(member.mood);
        
        return (
          <TouchableOpacity 
            key={member.id} 
            style={[
              homeStyles.familyStatusCard,
              isExpanded && homeStyles.familyStatusCardExpanded
            ]}
            onPress={() => {
              onMemberPress?.(member);
              setExpandedCard(isExpanded ? null : member.id);
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['transparent', 'transparent', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={homeStyles.familyStatusCardGradient}
            >
            {/* Single Row Layout: Avatar + Name + Stats */}
            <View style={homeStyles.familyStatusCardHeader}>
              {/* Avatar */}
              <View style={homeStyles.familyStatusAvatarContainer}>
                <View style={[
                  homeStyles.familyStatusAvatar,
                  { backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 60%)` }
                ]}>
                  <Text style={homeStyles.familyStatusAvatarText}>
                    {member.name.charAt(0)}
                  </Text>
                </View>
                <View style={[
                  homeStyles.familyStatusIndicator,
                  { backgroundColor: getStatusColor(member.status) }
                ]} />
              </View>
              
              {/* Name and Location */}
              <View style={homeStyles.familyStatusHeaderInfo}>
                <Text style={homeStyles.familyStatusName} numberOfLines={1}>
                  {member.name}
                </Text>
                <View style={homeStyles.familyStatusLocationRow}>
                  <CoolIcon name="location" size={12} color="#6B7280" />
                  <Text style={homeStyles.familyStatusLocation} numberOfLines={1}>
                    {member.location}
                  </Text>
                </View>
                <Text style={homeStyles.familyStatusTime}>
                  {formatTimeAgo(member.lastActive)}
                </Text>
              </View>
              
              {/* Stats in Row */}
              <View style={homeStyles.familyStatusStatsRow}>
                <View style={homeStyles.familyStatusStatItem}>
                  <View style={[homeStyles.familyStatusStatIcon, { backgroundColor: '#FEE2E2' }]}>
                    <CoolIcon name="heart" size={14} color="#EF4444" />
                  </View>
                  <Text style={homeStyles.familyStatusStatValue}>
                    {member.heartRate ? member.heartRate : '-'}
                  </Text>
                </View>
                <View style={homeStyles.familyStatusStatItem}>
                  <View style={[homeStyles.familyStatusStatIcon, { backgroundColor: '#DBEAFE' }]}>
                    <CoolIcon name="walk" size={14} color="#3B82F6" />
                  </View>
                  <Text style={homeStyles.familyStatusStatValue}>
                    {member.steps ? (member.steps > 1000 ? `${(member.steps / 1000).toFixed(1)}k` : member.steps) : '-'}
                  </Text>
                </View>
                <View style={homeStyles.familyStatusStatItem}>
                  <View style={[homeStyles.familyStatusStatIcon, { backgroundColor: '#DCFCE7' }]}>
                    <CoolIcon name="battery" size={14} color="#10B981" />
                  </View>
                  <Text style={homeStyles.familyStatusStatValue}>
                    {member.batteryLevel ? `${member.batteryLevel}%` : '-'}
                  </Text>
                </View>
                <View style={homeStyles.familyStatusStatItem}>
                  <View style={[homeStyles.familyStatusStatIcon, { backgroundColor: '#EDE9FE' }]}>
                    <CoolIcon name="sleep" size={14} color="#6366F1" />
                  </View>
                  <Text style={homeStyles.familyStatusStatValue}>
                    {member.sleepHours ? `${member.sleepHours}h` : '-'}
                  </Text>
                </View>
              </View>
              
            </View>

            {/* Expanded Content */}
            {isExpanded && (
              <View style={homeStyles.familyStatusExpandedContent}>
                {/* Additional Metrics */}
                <View style={homeStyles.familyStatusAdditionalMetrics}>
                  <View style={homeStyles.familyStatusAdditionalMetric}>
                    <CoolIcon name="sleep" size={16} color="#3B82F6" />
                    <Text style={homeStyles.familyStatusAdditionalMetricText}>
                      {member.sleepHours ? `${member.sleepHours}h sleep` : 'Sleep data not available'}
                    </Text>
                  </View>
                  
                  {member.temperature && (
                    <View style={homeStyles.familyStatusAdditionalMetric}>
                      <CoolIcon name="thermometer" size={16} color="#EF4444" />
                      <Text style={homeStyles.familyStatusAdditionalMetricText}>
                        {member.temperature}°C
                      </Text>
                    </View>
                  )}
                  
                  <View style={homeStyles.familyStatusAdditionalMetric}>
                    <CoolIcon name={moodData.name as any} size={16} color={moodData.color} />
                    <Text style={homeStyles.familyStatusAdditionalMetricText}>
                      {member.mood ? `${member.mood} mood` : 'Mood data not available'}
                    </Text>
                  </View>
                </View>

                {/* Activity */}
                {member.activity && (
                  <View style={homeStyles.familyStatusActivity}>
                    <Text style={homeStyles.familyStatusActivityLabel}>Current Activity:</Text>
                    <Text style={homeStyles.familyStatusActivityText}>{member.activity}</Text>
                  </View>
                )}

                {/* Quick Actions */}
                <View style={homeStyles.familyStatusQuickActions}>
                  <TouchableOpacity style={homeStyles.familyStatusActionButton}>
                    <CoolIcon name="call" size={16} color="#10B981" />
                    <Text style={homeStyles.familyStatusActionText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={homeStyles.familyStatusActionButton}>
                    <CoolIcon name="chatbubble" size={16} color="#3B82F6" />
                    <Text style={homeStyles.familyStatusActionText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={homeStyles.familyStatusActionButton}>
                    <CoolIcon name="location" size={16} color="#F59E0B" />
                    <Text style={homeStyles.familyStatusActionText}>Location</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};