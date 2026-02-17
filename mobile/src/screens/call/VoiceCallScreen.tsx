import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { Audio } from 'expo-av';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  isIncoming?: boolean;
  callId?: string;
}

const VoiceCallScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { contactId, contactName, contactAvatar, isIncoming = false, callId } = params;

  const { user } = useAuth();
  const { initiateCall, answerCall, endCall, sendCallSignal, on, off, isConnected } = useSocket();

  // Call state
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>(
    isIncoming ? 'ringing' : 'connecting'
  );
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  // Timers and refs
  const durationTimer = useRef<NodeJS.Timeout | null>(null);
  const ringToneRef = useRef<Audio.Sound | null>(null);

  // Start pulse animation
  useEffect(() => {
    if (callStatus === 'ringing' || callStatus === 'connecting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [callStatus, pulseAnim]);

  // Start ring animation for incoming calls
  useEffect(() => {
    if (isIncoming && callStatus === 'ringing') {
      const ring = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      );
      ring.start();

      return () => ring.stop();
    }
  }, [isIncoming, callStatus, ringAnim]);

  // Initialize call
  useEffect(() => {
    if (!isIncoming) {
      // Outgoing call - initiate
      initiateCall([contactId], 'voice');
      
      // Simulate connection after 2 seconds (in real app, wait for socket event)
      setTimeout(() => {
        setCallStatus('ringing');
      }, 1000);
      
      // Simulate answer after 3 more seconds (demo)
      setTimeout(() => {
        setCallStatus('connected');
      }, 4000);
    }

    // Setup socket listeners
    on('call-answered', handleCallAnswered);
    on('call-ended', handleCallEnded);
    on('call-signal', handleCallSignal);

    return () => {
      off('call-answered', handleCallAnswered);
      off('call-ended', handleCallEnded);
      off('call-signal', handleCallSignal);
      
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
      
      stopRingTone();
    };
  }, []);

  // Start duration timer when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      durationTimer.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      
      stopRingTone();
    }

    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    };
  }, [callStatus]);

  const handleCallAnswered = (data: any) => {
    setCallStatus('connected');
  };

  const handleCallEnded = (data: any) => {
    setCallStatus('ended');
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  const handleCallSignal = (data: any) => {
    // Handle WebRTC signaling
    console.log('Received call signal:', data);
  };

  const stopRingTone = async () => {
    if (ringToneRef.current) {
      await ringToneRef.current.stopAsync();
      await ringToneRef.current.unloadAsync();
      ringToneRef.current = null;
    }
  };

  const handleAnswer = () => {
    if (callId) {
      answerCall(contactId, true);
    }
    setCallStatus('connected');
  };

  const handleDecline = () => {
    if (callId) {
      answerCall(contactId, false);
    }
    endCall([contactId]);
    setCallStatus('ended');
    setTimeout(() => {
      navigation.goBack();
    }, 500);
  };

  const handleEndCall = () => {
    endCall([contactId]);
    setCallStatus('ended');
    setTimeout(() => {
      navigation.goBack();
    }, 500);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleSpeaker = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: isSpeakerOn,
      });
      setIsSpeakerOn(!isSpeakerOn);
    } catch (error) {
      console.error('Failed to toggle speaker:', error);
    }
  };

  const handleToggleHold = () => {
    setIsOnHold(!isOnHold);
  };

  const handleSwitchToVideo = () => {
    navigation.replace('VideoCall' as never, {
      contactId,
      contactName,
      contactAvatar,
      callId,
    } as never);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = (): string => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return isIncoming ? 'Incoming call' : 'Ringing...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };

  const renderAvatar = () => {
    const initials = contactName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const ringRotate = ringAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-5deg', '0deg', '5deg'],
    });

    return (
      <Animated.View
        style={[
          styles.avatarContainer,
          { transform: [{ scale: pulseAnim }, { rotate: ringRotate }] },
        ]}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FF5A5A', '#FF4040']}
          style={styles.avatarGradient}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </LinearGradient>
        
        {/* Pulse rings */}
        {(callStatus === 'ringing' || callStatus === 'connecting') && (
          <>
            <View style={[styles.pulseRing, styles.pulseRing1]} />
            <View style={[styles.pulseRing, styles.pulseRing2]} />
            <View style={[styles.pulseRing, styles.pulseRing3]} />
          </>
        )}
      </Animated.View>
    );
  };

  const renderControlButton = (
    icon: string,
    label: string,
    onPress: () => void,
    isActive: boolean = false,
    iconType: 'ion' | 'mc' = 'ion'
  ) => {
    const IconComponent = iconType === 'ion' ? IconIon : IconMC;
    
    return (
      <TouchableOpacity
        style={[styles.controlButton, isActive && styles.controlButtonActive]}
        onPress={onPress}
      >
        <View style={[styles.controlButtonInner, isActive && styles.controlButtonInnerActive]}>
          <IconComponent
            name={icon}
            size={24}
            color={isActive ? '#FF5A5A' : '#FFFFFF'}
          />
        </View>
        <Text style={styles.controlLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <IconIon name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.encryptedBadge}>
              <IconIon name="lock-closed" size={12} color="#4CAF50" />
              <Text style={styles.encryptedText}>End-to-end encrypted</Text>
            </View>
          </View>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            {renderAvatar()}
            
            <Text style={styles.contactName}>{contactName}</Text>
            <Text style={styles.callStatus}>{getStatusText()}</Text>
            
            {isOnHold && (
              <View style={styles.holdBadge}>
                <IconIon name="pause" size={14} color="#FFC107" />
                <Text style={styles.holdText}>Call on hold</Text>
              </View>
            )}
          </View>

          {/* Control buttons */}
          {callStatus === 'connected' && (
            <View style={styles.controlsContainer}>
              <View style={styles.controlsRow}>
                {renderControlButton(
                  isMuted ? 'mic-off' : 'mic',
                  isMuted ? 'Unmute' : 'Mute',
                  handleToggleMute,
                  isMuted
                )}
                {renderControlButton(
                  isOnHold ? 'play' : 'pause',
                  isOnHold ? 'Resume' : 'Hold',
                  handleToggleHold,
                  isOnHold
                )}
                {renderControlButton(
                  isSpeakerOn ? 'volume-high' : 'volume-medium',
                  isSpeakerOn ? 'Speaker On' : 'Speaker',
                  handleToggleSpeaker,
                  isSpeakerOn
                )}
              </View>
              
              <View style={styles.controlsRow}>
                {renderControlButton(
                  'videocam',
                  'Video',
                  handleSwitchToVideo,
                  false
                )}
                {renderControlButton(
                  'keypad',
                  'Keypad',
                  () => {},
                  false
                )}
                {renderControlButton(
                  'people',
                  'Add Call',
                  () => Alert.alert('Coming Soon', 'Conference calls coming soon!'),
                  false
                )}
              </View>
            </View>
          )}
        </View>

        {/* Bottom action buttons */}
        <View style={styles.bottomActions}>
          {isIncoming && callStatus === 'ringing' ? (
            // Incoming call - show answer and decline
            <View style={styles.incomingActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={handleDecline}
              >
                <IconIon name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.answerButton]}
                onPress={handleAnswer}
              >
                <IconIon name="call" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            // Outgoing call or connected - show end call
            <TouchableOpacity
              style={[styles.actionButton, styles.endCallButton]}
              onPress={handleEndCall}
            >
              <IconIon name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  encryptedText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 24,
    position: 'relative',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    padding: 4,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 71,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pulseRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(255, 90, 90, 0.3)',
  },
  pulseRing1: {
    transform: [{ scale: 1.1 }],
    opacity: 0.5,
  },
  pulseRing2: {
    transform: [{ scale: 1.2 }],
    opacity: 0.3,
  },
  pulseRing3: {
    transform: [{ scale: 1.3 }],
    opacity: 0.1,
  },
  contactName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  holdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  holdText: {
    color: '#FFC107',
    fontSize: 12,
    marginLeft: 6,
  },
  controlsContainer: {
    paddingHorizontal: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlButtonActive: {},
  controlButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlButtonInnerActive: {
    backgroundColor: '#FFFFFF',
  },
  controlLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  bottomActions: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  answerButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#FF5A5A',
  },
  endCallButton: {
    backgroundColor: '#FF5A5A',
  },
});

export default VoiceCallScreen;
