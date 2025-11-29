import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { Appointment } from '../../types/home';

interface AppointmentsWidgetProps {
  appointments: Appointment[];
  onAppointmentPress: (appointment: Appointment) => void;
  onAddAppointment: () => void;
}

const AppointmentsWidget: React.FC<AppointmentsWidgetProps> = ({
  appointments,
  onAppointmentPress,
  onAddAppointment,
}) => {
  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return 'medical-bag';
      case 'education':
        return 'school';
      case 'hourse':
        return 'home-heart';
      case 'work':
        return 'briefcase';
      default:
        return 'calendar';
    }
  };

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'medical':
        return '#FF5A5A';
      case 'education':
        return '#4F46E5';
      case 'hourse':
        return '#10B981';
      case 'work':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={homeStyles.widgetContainer}>
      <View style={homeStyles.widgetHeader}>
        <Text style={homeStyles.widgetTitle}>Today's Appointments</Text>
        <TouchableOpacity onPress={onAddAppointment} style={homeStyles.addButton}>
          <IconMC name="plus" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.widgetScrollContent}
      >
        {appointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            style={[
              homeStyles.appointmentCard,
              { borderLeftColor: getAppointmentColor(appointment.type) }
            ]}
            onPress={() => onAppointmentPress(appointment)}
          >
            <View style={homeStyles.appointmentHeader}>
              <IconMC 
                name={getAppointmentIcon(appointment.type)} 
                size={20} 
                color={getAppointmentColor(appointment.type)} 
              />
              <Text style={homeStyles.appointmentTime}>{appointment.time}</Text>
            </View>
            
            <Text style={homeStyles.appointmentTitle}>{appointment.title}</Text>
            <Text style={homeStyles.appointmentLocation}>{appointment.location}</Text>
            
            <View style={homeStyles.appointmentAttendees}>
              <Text style={homeStyles.appointmentAttendeesText}>
                {appointment.attendees.join(', ')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default AppointmentsWidget;
