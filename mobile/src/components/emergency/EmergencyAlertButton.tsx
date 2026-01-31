import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Vibration, 
  StyleSheet,
  Animated,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { brandColors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';

interface EmergencyAlertButtonProps {
  onPress?: () => void;
  circleId?: string;
  circleMembers?: Array<{
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  }>;
}

const EmergencyAlertButton: React.FC<EmergencyAlertButtonProps> = ({
  onPress,
  circleId,
  circleMembers = [],
}) => {
  const { user } = useAuth();
  const [isTriggering, setIsTriggering] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const emergencyTypes = [
    {
      type: 'panic',
      title: 'Panic Alert',
      description: 'Immediate emergency situation',
      icon: 'alert-circle',
      color: '#DC3545',
    },
    {
      type: 'medical',
      title: 'Medical Emergency',
      description: 'Health-related emergency',
      icon: 'medical-bag',
      color: '#FD7E14',
    },
    {
      type: 'location',
      title: 'Location Alert',
      description: 'Share current location',
      icon: 'map-marker',
      color: brandColors.primary,
    },
    {
      type: 'custom',
      title: 'Custom Alert',
      description: 'Send custom message',
      icon: 'message-text',
      color: '#6C757D',
    },
  ];

  const handleLongPressStart = () => {
    setIsLongPressed(true);
    Vibration.vibrate(100);
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    const timer = setTimeout(() => {
      setIsLongPressed(false);
      setIsModalVisible(true);
    }, 2000);
    
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressed(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleQuickPress = () => {
    if (!isLongPressed) {
      if (onPress) {
        onPress();
      } else {
        triggerPhoneRing();
      }
    }
  };

  const triggerPhoneRing = async () => {
    try {
      setIsTriggering(true);
      
      // Simulate emergency alert
      Alert.alert(
        'Emergency Alert Sent',
        'All Circle members will receive an emergency alert and their phones will ring.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert');
    } finally {
      setIsTriggering(false);
    }
  };

  const sendEmergencyAlert = async (type: string, message?: string) => {
    try {
      setIsTriggering(true);
      
      // Simulate sending alert
      setTimeout(() => {
        Alert.alert(
          'Emergency Alert Sent',
          'Your Circle members have been notified of the emergency.',
          [{ text: 'OK' }]
        );
        setIsModalVisible(false);
        setIsTriggering(false);
      }, 1000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert');
      setIsTriggering(false);
    }
  };

  return (
    <>
      {/* Emergency Button */}
      <TouchableOpacity
        onPress={handleQuickPress}
        onLongPress={handleLongPressStart}
        onPressOut={handleLongPressEnd}
        style={styles.emergencyButton}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [
                { scale: isLongPressed ? pulseAnim : scaleAnim },
              ],
              backgroundColor: isLongPressed ? '#C82333' : brandColors.primary,
            },
          ]}
        >
          {isTriggering ? (
            <View style={styles.spinner}>
              <IconMC name="loading" size={40} color="#FFFFFF" />
            </View>
          ) : (
            <IconMC
              name={isLongPressed ? 'alert' : 'phone-alert'}
              size={40}
              color="#FFFFFF"
            />
          )}
        </Animated.View>
        
        {/* Pulse animation for long press */}
        {isLongPressed && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}
      </TouchableOpacity>

      {/* Emergency Alert Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <IconMC name="alert-circle" size={24} color="#DC3545" />
                <Text style={styles.modalTitle}>Emergency Alert</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <IconMC name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Choose the type of emergency alert to send to your Circle members:
              </Text>
              
              <View style={styles.emergencyTypesContainer}>
                {emergencyTypes.map((emergencyType) => (
                  <TouchableOpacity
                    key={emergencyType.type}
                    onPress={() => sendEmergencyAlert(emergencyType.type)}
                    disabled={isTriggering}
                    style={styles.emergencyTypeButton}
                  >
                    <View style={styles.emergencyTypeContent}>
                      <IconMC
                        name={emergencyType.icon}
                        size={24}
                        color={emergencyType.color}
                      />
                      <View style={styles.emergencyTypeText}>
                        <Text style={styles.emergencyTypeTitle}>
                          {emergencyType.title}
                        </Text>
                        <Text style={styles.emergencyTypeDescription}>
                          {emergencyType.description}
                        </Text>
                      </View>
                      <IconMC name="chevron-right" size={20} color="#CCC" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.warningBox}>
                <IconMC name="information" size={20} color="#FD7E14" />
                <Text style={styles.warningText}>
                  Emergency alerts will notify all Circle members and can trigger phone ringing.
                </Text>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  buttonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  pulseRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    backgroundColor: '#FF5A5A',
    opacity: 0.3,
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  emergencyTypesContainer: {
    marginBottom: 20,
  },
  emergencyTypeButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 12,
  },
  emergencyTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyTypeText: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emergencyTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default EmergencyAlertButton; 
