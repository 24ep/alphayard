import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { FamilyStatusMember } from '../../../types/home';
import { homeStyles } from '../../../styles/homeStyles';

interface FamilyStatusCardProps {
  member: FamilyStatusMember;
}

const FamilyStatusCard: React.FC<FamilyStatusCardProps> = ({ member }) => {
  const renderSmoothAreaChart = (data: number[], color: string) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;
    const chartHeight = 80;
    const chartWidth = 200;
    const pointWidth = chartWidth / (data.length - 1);
    
    // Generate SVG path for smooth area chart
    const points = data.map((value, index) => {
      const x = index * pointWidth;
      const y = chartHeight - ((value - minValue) / range) * chartHeight;
      return `${x},${y}`;
    });
    
    const areaPath = `M 0,${chartHeight} L ${points.join(' L ')} L ${chartWidth},${chartHeight} Z`;
    const linePath = `M ${points.join(' L ')}`;
    
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
    <View key={member.id} style={homeStyles.familyStatusCard}>
      {/* Gradient Area Chart Background */}
      <View style={homeStyles.familyStatusBackgroundChart}>
        {renderSmoothAreaChart(member.heartRateHistory, 'rgba(255, 90, 90, 0.15)')}
      </View>
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(255, 90, 90, 0.1)', 'rgba(255, 140, 140, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={homeStyles.familyStatusGradient}
      />
      
      {/* Minimal Content */}
      <View style={homeStyles.familyStatusContent}>
        {/* Top Row - Avatar, Name, Status */}
        <View style={homeStyles.familyStatusTopRow}>
          <View style={homeStyles.familyStatusAvatarContainer}>
            <Image source={{ uri: member.avatar }} style={homeStyles.familyStatusAvatar} />
            <View style={[
              homeStyles.onlineIndicator, 
              { backgroundColor: member.status === 'online' ? '#4CAF50' : '#9E9E9E' }
            ]} />
          </View>
          
          <View style={homeStyles.familyStatusInfo}>
            <Text style={homeStyles.familyStatusName}>{member.name}</Text>
            <Text style={homeStyles.familyStatusTime}>{member.lastActive.toLocaleDateString()}</Text>
          </View>
          
          <View style={[
            homeStyles.familyStatusStatusBadge,
            { backgroundColor: member.status === 'online' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 90, 90, 0.2)' }
          ]}>
            <Text style={[
              homeStyles.familyStatusStatusText,
              { color: member.status === 'online' ? '#4CAF50' : '#FF5A5A' }
            ]}>
              {member.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {/* Bottom Row - Key Metrics */}
        <View style={homeStyles.familyStatusBottomRow}>
          <View style={homeStyles.familyStatusMetric}>
            <View style={homeStyles.familyStatusMetricIcon}>
              <IconMC name="heart-pulse" size={16} color="#FF5A5A" />
            </View>
            <Text style={homeStyles.familyStatusMetricValue}>{member.heartRate}</Text>
            <Text style={homeStyles.familyStatusMetricLabel}>BPM</Text>
          </View>
          
          <View style={homeStyles.familyStatusMetric}>
            <View style={homeStyles.familyStatusMetricIcon}>
              <IconMC name="walk" size={16} color="#FF8C8C" />
            </View>
            <Text style={homeStyles.familyStatusMetricValue}>{member.steps}</Text>
            <Text style={homeStyles.familyStatusMetricLabel}>Steps</Text>
          </View>
          
          <View style={homeStyles.familyStatusMetric}>
            <View style={homeStyles.familyStatusMetricIcon}>
              <IconMC name="sleep" size={16} color="#4CAF50" />
            </View>
            <Text style={homeStyles.familyStatusMetricValue}>{member.sleepHours}h</Text>
            <Text style={homeStyles.familyStatusMetricLabel}>Sleep</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FamilyStatusCard;
