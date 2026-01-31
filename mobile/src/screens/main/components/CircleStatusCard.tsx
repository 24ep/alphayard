import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { CircleStatusMember } from '../../../types/circle';
import { homeStyles } from '../../../styles/homeStyles';

interface CircleStatusCardProps {
  member: CircleStatusMember;
}

const CircleStatusCard: React.FC<CircleStatusCardProps> = ({ member }) => {
  const renderSmoothAreaChart = (data: number[], color: string) => {
    // Chart logic placeholder
    const chartHeight = 80;
    const chartWidth = 200;
    
    return (
      <View style={homeStyles.areaChartContainer}>
        <View style={homeStyles.areaChartBackground}>
          {/* Area fill */}
          <View style={[
            homeStyles.areaChartFill,
            { 
              backgroundColor: color,
              opacity: 0.3,
              height: chartHeight,
              width: chartWidth
            }
          ]} />
          {/* Line */}
          <View style={[
            homeStyles.areaChartLine,
            { 
              backgroundColor: color,
              opacity: 0.8,
              height: 2,
              width: chartWidth
            }
          ]} />
        </View>
      </View>
    );
  };

  return (
    <View key={member.id} style={homeStyles.circleStatusCard}>
      {/* Gradient Area Chart Background */}
      <View style={homeStyles.circleStatusBackgroundChart}>
        {renderSmoothAreaChart(member.heartRateHistory, 'rgba(255, 90, 90, 0.15)')}
      </View>
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(255, 90, 90, 0.1)', 'rgba(255, 140, 140, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={homeStyles.circleStatusGradient}
      />
      
      {/* Minimal Content */}
      <View style={homeStyles.circleStatusContent}>
        {/* Top Row - Avatar, Name, Status */}
        <View style={homeStyles.circleStatusTopRow}>
          <View style={homeStyles.circleStatusAvatarContainer}>
            <Image source={{ uri: member.avatar }} style={homeStyles.circleStatusAvatar as any} />
            <View style={[
              homeStyles.onlineIndicator, 
              { backgroundColor: member.status === 'online' ? '#4CAF50' : '#9E9E9E' }
            ]} />
          </View>
          
          <View style={homeStyles.circleStatusInfo}>
            <Text style={homeStyles.circleStatusName}>{member.name}</Text>
            <Text style={homeStyles.circleStatusTime}>{member.lastActive.toLocaleDateString()}</Text>
          </View>
          
          <View style={[
            homeStyles.circleStatusStatusBadge,
            { backgroundColor: member.status === 'online' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 90, 90, 0.2)' }
          ]}>
            <Text style={[
              homeStyles.circleStatusStatusText,
              { color: member.status === 'online' ? '#4CAF50' : '#FF5A5A' }
            ]}>
              {member.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {/* Bottom Row - Key Metrics */}
        <View style={homeStyles.circleStatusBottomRow}>
          <View style={homeStyles.circleStatusMetric}>
            <View style={homeStyles.circleStatusMetricIcon}>
              <IconMC name="heart-pulse" size={16} color="#FF5A5A" />
            </View>
            <Text style={homeStyles.circleStatusMetricValue}>{member.heartRate}</Text>
            <Text style={homeStyles.circleStatusMetricLabel}>BPM</Text>
          </View>
          
          <View style={homeStyles.circleStatusMetric}>
            <View style={homeStyles.circleStatusMetricIcon}>
              <IconMC name="walk" size={16} color="#FF8C8C" />
            </View>
            <Text style={homeStyles.circleStatusMetricValue}>{member.steps}</Text>
            <Text style={homeStyles.circleStatusMetricLabel}>Steps</Text>
          </View>
          
          <View style={homeStyles.circleStatusMetric}>
            <View style={homeStyles.circleStatusMetricIcon}>
              <IconMC name="sleep" size={16} color="#4CAF50" />
            </View>
            <Text style={homeStyles.circleStatusMetricValue}>{member.sleepHours}h</Text>
            <Text style={homeStyles.circleStatusMetricLabel}>Sleep</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CircleStatusCard;
