import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface Appointment {
  id: string;
  title: string;
  time: string;
  location: string;
  type: string;
}

interface AppointmentsListProps {
  appointments: Appointment[];
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments }) => {
  if (!appointments || !Array.isArray(appointments)) {
    return null;
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={homeStyles.appointmentsScrollView}
      contentContainerStyle={homeStyles.appointmentsContent}
    >
      <View style={homeStyles.appointmentTimelineContainer}>
        <View style={homeStyles.appointmentTimelineLine} />
        {appointments.map((appointment, index) => (
          <View key={appointment.id} style={homeStyles.appointmentTimelineItem}>
            <View style={homeStyles.appointmentTimelineNode}>
              <LinearGradient
                colors={index === 0 ? ['#FFB6C1', '#FF6B6B', '#E5E7EB'] : ['rgba(156, 163, 175, 0.8)', 'rgba(156, 163, 175, 0.6)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={homeStyles.appointmentIconCycle}
              >
                <IconMC 
                  name={appointment.type === 'medical' ? 'medical-bag' : 'calendar'} 
                  size={16} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </View>
            <View style={homeStyles.appointmentContent}>
              <Text style={homeStyles.appointmentTime}>{appointment.time}</Text>
              <Text style={homeStyles.appointmentTitle}>{appointment.title}</Text>
              <View style={homeStyles.appointmentLocationRow}>
                <IconMC name="map-marker" size={14} color="#6B7280" />
                <Text style={homeStyles.appointmentLocation}>{appointment.location}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
