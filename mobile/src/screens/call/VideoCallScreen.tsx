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
import { useSocket } from '../../contexts/SocketContext';

// Conditionally import expo-camera (not available on web)
let Camera: any = null;
let Audio: any = null;
try {
  Camera = require('expo-camera').Camera;
  Audio = require('expo-av').Audio;
} catch (e) {
  // expo-camera not available (e.g., on web)
  console.log('expo-camera/expo-av not available, using fallback');
}
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  isIncoming?: boolean;
  callId?: string;
}

const VideoCallScreen: React.FC = () => {
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
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Camera permission
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const controlsAnim = useRef(new Animated.Value(1)).current;
  const localVideoScale = useRef(new Animated.Value(1)).current;

  // Timers
  const durationTimer = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Request camera and microphone permissions
  useEffect(() => {
    (async () => {
      // On web or when expo-camera is not available, skip permission requests
      if (!Camera || !Audio || Platform.OS === 'web') {
        setHasPermission(true); // Allow UI to render on web
        return;
      }
      
      try {
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: audioStatus } = await Audio.requestPermissionsAsync();
        setHasPermission(cameraStatus === 'granted' && audioStatus === 'granted');
      } catch (e) {
        console.log('Permission request failed:', e);
        setHasPermission(true); // Fallback to allow UI
      }
    })();
  }, []);

  // Start pulse animation for connecting state
  useEffect(() => {
    if (callStatus === 'ringing' || callStatus === 'connecting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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

  // Initialize call
  useEffect(() => {
    if (!isIncoming) {
      initiateCall([contactId], 'video');
      
      // Simulate connection
      setTimeout(() => setCallStatus('ringing'), 1000);
      setTimeout(() => setCallStatus('connected'), 4000);
    }

    on('call-answered', handleCallAnswered);
    on('call-ended', handleCallEnded);
    on('call-signal', handleCallSignal);

    return () => {
      off('call-answered', handleCallAnswered);
      off('call-ended', handleCallEnded);
      off('call-signal', handleCallSignal);
      if (durationTimer.current) clearInterval(durationTimer.current);
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      durationTimer.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      
      // Auto-hide controls
      startHideControlsTimer();
    }
    return () => {
      if (durationTimer.current) clearInterval(durationTimer.current);
    };
  }, [callStatus]);

  const handleCallAnswered = (data: any) => {
    setCallStatus('connected');
  };

  const handleCallEnded = (data: any) => {
    setCallStatus('ended');
    setTimeout(() => navigation.goBack(), 1500);
  };

  const handleCallSignal = (data: any) => {
    console.log('Received call signal:', data);
  };

  const startHideControlsTimer = () => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      Animated.timing(controlsAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    }, 5000);
  };

  const handleScreenTap = () => {
    if (callStatus === 'connected') {
      setShowControls(true);
      Animated.timing(controlsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      startHideControlsTimer();
    }
  };

  const handleAnswer = () => {
    if (callId) answerCall(contactId, true);
    setCallStatus('connected');
  };

  const handleDecline = () => {
    if (callId) answerCall(contactId, false);
    endCall([contactId]);
    setCallStatus('ended');
    setTimeout(() => navigation.goBack(), 500);
  };

  const handleEndCall = () => {
    endCall([contactId]);
    setCallStatus('ended');
    setTimeout(() => navigation.goBack(), 500);
  };

  const handleToggleMute = () => setIsMuted(!isMuted);
  const handleToggleVideo = () => setIsVideoOff(!isVideoOff);
  const handleFlipCamera = () => setIsFrontCamera(!isFrontCamera);

  const handleSwitchToVoice = () => {
    navigation.replace('VoiceCall' as never, {
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
      case 'connecting': return 'Connecting...';
      case 'ringing': return isIncoming ? 'Incoming video call' : 'Ringing...';
      case 'connected': return formatDuration(callDuration);
      case 'ended': return 'Call ended';
      default: return '';
    }
  };

  const renderRemoteVideo = () => {
    const initials = contactName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    // In a real app, this would show the remote participant's video stream
    // For demo, we show an avatar placeholder
    return (
      <View style={styles.remoteVideoContainer}>
        {callStatus === 'connected' ? (
          <View style={styles.remoteVideoPlaceholder}>
            {/* Simulated remote video with gradient background */}
            <LinearGradient
              colors={['#2c3e50', '#34495e', '#2c3e50']}
              style={styles.remoteVideoGradient}
            >
              <View style={styles.remoteAvatarContainer}>
                <View style={styles.remoteAvatar}>
                  <Text style={styles.remoteAvatarText}>{initials}</Text>
                </View>
                <Text style={styles.remoteNameText}>{contactName}</Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.connectingContainer}
          >
            <Animated.View
              style={[styles.connectingAvatar, { transform: [{ scale: pulseAnim }] }]}
            >
              <LinearGradient colors={['#FF6B6B', '#FF5A5A']} style={styles.avatarGradient}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.connectingName}>{contactName}</Text>
            <Text style={styles.connectingStatus}>{getStatusText()}</Text>
          </LinearGradient>
        )}
      </View>
    );
  };

  const renderLocalVideo = () => {
    if (isVideoOff) {
      return (
        <View style={styles.localVideoOff}>
          <IconIon name="videocam-off" size={24} color="#FFF" />
        </View>
      );
    }

    if (hasPermission && callStatus === 'connected') {
      // Only render actual camera on native platforms where Camera is available
      if (Camera && Platform.OS !== 'web') {
        return (
          <Animated.View
            style={[
              styles.localVideoContainer,
              { transform: [{ scale: localVideoScale }] },
            ]}
          >
            <Camera
              style={styles.localVideo}
              type={isFrontCamera ? 'front' : 'back'}
            />
            <TouchableOpacity style={styles.flipCameraButton} onPress={handleFlipCamera}>
              <IconIon name="camera-reverse" size={16} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        );
      }
      
      // Web fallback - show placeholder
      return (
        <Animated.View
          style={[
            styles.localVideoContainer,
            { transform: [{ scale: localVideoScale }] },
          ]}
        >
          <View style={styles.localVideoPlaceholder}>
            <IconIon name="videocam" size={24} color="#FFF" />
            <Text style={{ color: '#FFF', fontSize: 10, marginTop: 4 }}>Camera</Text>
          </View>
          <TouchableOpacity style={styles.flipCameraButton} onPress={handleFlipCamera}>
            <IconIon name="camera-reverse" size={16} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <View style={styles.localVideoContainer}>
        <View style={styles.localVideoPlaceholder}>
          <IconIon name="person" size={24} color="#FFF" />
        </View>
      </View>
    );
  };

  const renderControlButton = (
    icon: string,
    onPress: () => void,
    isActive: boolean = false,
    isDestructive: boolean = false
  ) => (
    <TouchableOpacity
      style={[
        styles.controlButton,
        isActive && styles.controlButtonActive,
        isDestructive && styles.controlButtonDestructive,
      ]}
      onPress={onPress}
    >
      <IconIon
        name={icon}
        size={24}
        color={isActive ? '#FF5A5A' : isDestructive ? '#FFF' : '#FFF'}
      />
    </TouchableOpacity>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera and microphone access required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => navigation.goBack()}>
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Remote video (full screen) */}
      <TouchableOpacity
        style={styles.remoteVideoWrapper}
        activeOpacity={1}
        onPress={handleScreenTap}
      >
        {renderRemoteVideo()}
      </TouchableOpacity>

      {/* Local video (picture-in-picture) */}
      {callStatus === 'connected' && renderLocalVideo()}

      {/* Top bar */}
      <Animated.View style={[styles.topBar, { opacity: controlsAnim }]}>
        <SafeAreaView>
          <View style={styles.topBarContent}>
            <TouchableOpacity style={styles.minimizeButton} onPress={() => navigation.goBack()}>
              <IconIon name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.topBarInfo}>
              <View style={styles.encryptedBadge}>
                <IconIon name="lock-closed" size={12} color="#4CAF50" />
                <Text style={styles.encryptedText}>Encrypted</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.switchCameraButton} onPress={handleFlipCamera}>
              <IconIon name="camera-reverse" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Bottom controls */}
      {callStatus === 'ringing' && isIncoming ? (
        // Incoming call controls
        <View style={styles.incomingControls}>
          <TouchableOpacity
            style={[styles.incomingButton, styles.declineButton]}
            onPress={handleDecline}
          >
            <IconIon name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
            <Text style={styles.incomingButtonText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.incomingButton, styles.answerButton]}
            onPress={handleAnswer}
          >
            <IconIon name="videocam" size={32} color="#FFF" />
            <Text style={styles.incomingButtonText}>Answer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Connected/outgoing call controls
        <Animated.View style={[styles.bottomControls, { opacity: controlsAnim }]}>
          <View style={styles.controlsRow}>
            {renderControlButton(isMuted ? 'mic-off' : 'mic', handleToggleMute, isMuted)}
            {renderControlButton(isVideoOff ? 'videocam-off' : 'videocam', handleToggleVideo, isVideoOff)}
            {renderControlButton('call', handleSwitchToVoice)}
            {renderControlButton('chatbubble', () => navigation.goBack())}
          </View>

          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <IconIon name="call" size={28} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>

          {callStatus === 'connected' && (
            <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FF5A5A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  remoteVideoWrapper: {
    flex: 1,
  },
  remoteVideoContainer: {
    flex: 1,
  },
  remoteVideoPlaceholder: {
    flex: 1,
  },
  remoteVideoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteAvatarContainer: {
    alignItems: 'center',
  },
  remoteAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  remoteAvatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFF',
  },
  remoteNameText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    padding: 4,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 66,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFF',
  },
  connectingName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  connectingStatus: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  localVideoContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight! + 60 : 100,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  localVideo: {
    flex: 1,
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  localVideoOff: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight! + 60 : 100,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  flipCameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 8 : 8,
    paddingBottom: 8,
  },
  minimizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarInfo: {
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
    marginLeft: 4,
  },
  switchCameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
    paddingTop: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  controlButtonActive: {
    backgroundColor: '#FFF',
  },
  controlButtonDestructive: {
    backgroundColor: '#FF5A5A',
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF5A5A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5A5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  durationText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 16,
  },
  incomingControls: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 48,
  },
  incomingButton: {
    alignItems: 'center',
  },
  declineButton: {},
  answerButton: {},
  incomingButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },
});

export default VideoCallScreen;
