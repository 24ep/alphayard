import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../services/api/chat';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CallParticipant {
  userId: string;
  displayName?: string;
  status: 'invited' | 'ringing' | 'joined' | 'left' | 'declined' | 'missed';
  isMuted: boolean;
  isVideoOff: boolean;
}

interface Call {
  id: string;
  callType: 'voice' | 'video';
  status: 'initiated' | 'ringing' | 'ongoing' | 'ended';
  participants?: CallParticipant[];
}

interface CallScreenProps {
  visible: boolean;
  call: Call;
  isIncoming?: boolean;
  callerName?: string;
  onClose: () => void;
  onAnswer?: () => void;
  onDecline?: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  visible,
  call,
  isIncoming = false,
  callerName = 'Unknown',
  onClose,
  onAnswer,
  onDecline,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(call.callType === 'voice');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (call.status === 'ringing' || isIncoming) {
      // Pulse animation for ringing
      const pulse = Animated.loop(
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
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [call.status, isIncoming]);

  useEffect(() => {
    if (call.status === 'ongoing') {
      const timer = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [call.status]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    try {
      await chatApi.leaveCall(call.id);
      onClose();
    } catch (error) {
      console.error('Error ending call:', error);
      onClose();
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // In real app, would call API to update state
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In real app, would call API to update state
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In real app, would toggle audio output
  };

  const handleAnswer = async () => {
    try {
      await chatApi.joinCall(call.id);
      onAnswer?.();
    } catch (error) {
      console.error('Error answering call:', error);
    }
  };

  const handleDecline = async () => {
    try {
      await chatApi.declineCall(call.id);
      onDecline?.();
      onClose();
    } catch (error) {
      console.error('Error declining call:', error);
      onClose();
    }
  };

  const getStatusText = () => {
    switch (call.status) {
      case 'initiated':
        return 'Calling...';
      case 'ringing':
        return isIncoming ? 'Incoming Call' : 'Ringing...';
      case 'ongoing':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call Ended';
      default:
        return '';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[
        styles.container,
        call.callType === 'video' && styles.videoContainer
      ]}>
        {/* Video placeholder */}
        {call.callType === 'video' && !isVideoOff && (
          <View style={styles.videoView}>
            <Text style={styles.videoPlaceholder}>Video Feed</Text>
          </View>
        )}

        {/* Call Info */}
        <View style={styles.callInfo}>
          <Animated.View style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {callerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </Animated.View>

          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callStatus}>{getStatusText()}</Text>

          {/* Participants */}
          {call.participants && call.participants.length > 1 && (
            <View style={styles.participants}>
              {call.participants.map((p, i) => (
                <View key={i} style={styles.participantBadge}>
                  <Text style={styles.participantName}>{p.displayName}</Text>
                  {p.isMuted && <Ionicons name="mic-off" size={12} color="#EF4444" />}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {call.status === 'ongoing' ? (
            <>
              {/* Ongoing call controls */}
              <View style={styles.controlRow}>
                <TouchableOpacity
                  style={[styles.controlButton, isMuted && styles.controlActive]}
                  onPress={handleToggleMute}
                >
                  <Ionicons
                    name={isMuted ? 'mic-off' : 'mic'}
                    size={28}
                    color={isMuted ? '#FFFFFF' : '#1F2937'}
                  />
                  <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>

                {call.callType === 'video' && (
                  <TouchableOpacity
                    style={[styles.controlButton, isVideoOff && styles.controlActive]}
                    onPress={handleToggleVideo}
                  >
                    <Ionicons
                      name={isVideoOff ? 'videocam-off' : 'videocam'}
                      size={28}
                      color={isVideoOff ? '#FFFFFF' : '#1F2937'}
                    />
                    <Text style={[styles.controlLabel, isVideoOff && styles.controlLabelActive]}>
                      {isVideoOff ? 'Video On' : 'Video Off'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.controlButton, isSpeakerOn && styles.controlActive]}
                  onPress={handleToggleSpeaker}
                >
                  <Ionicons
                    name={isSpeakerOn ? 'volume-high' : 'volume-medium'}
                    size={28}
                    color={isSpeakerOn ? '#FFFFFF' : '#1F2937'}
                  />
                  <Text style={[styles.controlLabel, isSpeakerOn && styles.controlLabelActive]}>
                    Speaker
                  </Text>
                </TouchableOpacity>
              </View>

              {/* End call button */}
              <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
                <Ionicons name="call" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          ) : isIncoming ? (
            /* Incoming call controls */
            <View style={styles.incomingControls}>
              <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                <Ionicons name="close" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
                <Ionicons name="call" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            /* Outgoing call - waiting */
            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <Ionicons name="call" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Incoming call notification
interface IncomingCallNotificationProps {
  callerName: string;
  callType: 'voice' | 'video';
  onAnswer: () => void;
  onDecline: () => void;
}

export const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  callerName,
  callType,
  onAnswer,
  onDecline,
}) => {
  return (
    <View style={styles.notification}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationAvatar}>
          <Text style={styles.notificationAvatarText}>
            {callerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationName}>{callerName}</Text>
          <Text style={styles.notificationType}>
            Incoming {callType} call
          </Text>
        </View>
      </View>
      <View style={styles.notificationActions}>
        <TouchableOpacity style={styles.notificationDecline} onPress={onDecline}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationAnswer} onPress={onAnswer}>
          <Ionicons name="call" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Call button for chat header
interface CallButtonProps {
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

export const CallButton: React.FC<CallButtonProps> = ({
  onVoiceCall,
  onVideoCall,
}) => {
  return (
    <View style={styles.callButtons}>
      <TouchableOpacity style={styles.headerCallButton} onPress={onVoiceCall}>
        <Ionicons name="call" size={22} color="#3B82F6" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerCallButton} onPress={onVideoCall}>
        <Ionicons name="videocam" size={22} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  videoContainer: {
    backgroundColor: '#000000',
  },
  videoView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  videoPlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  callInfo: {
    alignItems: 'center',
    paddingTop: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  callerName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  participants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  participantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 40,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlActive: {
    backgroundColor: '#3B82F6',
  },
  controlLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  controlLabelActive: {
    color: '#FFFFFF',
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 80,
  },
  declineButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Notification
  notification: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationInfo: {},
  notificationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationType: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 16,
  },
  notificationDecline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationAnswer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header buttons
  callButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerCallButton: {
    padding: 8,
  },
});

export default CallScreen;
