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
  Vibration,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import IconIon from 'react-native-vector-icons/Ionicons';
import { Audio } from 'expo-av';
import { useSocket } from '../../contexts/SocketContext';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
}

const IncomingCallScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { callId, callerId, callerName, callerAvatar, callType } = params;

  const { answerCall, endCall } = useSocket();

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Sound
  const ringtoneRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Start animations
    startPulseAnimation();
    startRingAnimation();
    startSlideAnimation();
    
    // Start vibration pattern
    const vibrationPattern = [500, 1000];
    Vibration.vibrate(vibrationPattern, true);

    // Play ringtone
    playRingtone();

    return () => {
      Vibration.cancel();
      stopRingtone();
    };
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    ).start();
  };

  const startSlideAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const playRingtone = async () => {
    try {
      // Note: Add a ringtone.mp3 file to assets/sounds/ for actual ringtone
      // For now, we'll skip audio playback if the file doesn't exist
      console.log('Ringtone would play here (add assets/sounds/ringtone.mp3)');
    } catch (error) {
      console.log('Could not play ringtone:', error);
    }
  };

  const stopRingtone = async () => {
    if (ringtoneRef.current) {
      await ringtoneRef.current.stopAsync();
      await ringtoneRef.current.unloadAsync();
      ringtoneRef.current = null;
    }
  };

  const handleAnswer = async () => {
    Vibration.cancel();
    await stopRingtone();
    
    answerCall(callerId, true);
    
    // Navigate to appropriate call screen
    const screen = callType === 'video' ? 'VideoCall' : 'VoiceCall';
    navigation.replace(screen as never, {
      contactId: callerId,
      contactName: callerName,
      contactAvatar: callerAvatar,
      callId,
      isIncoming: true,
    } as never);
  };

  const handleDecline = async () => {
    Vibration.cancel();
    await stopRingtone();
    
    answerCall(callerId, false);
    endCall([callerId]);
    
    navigation.goBack();
  };

  const handleMessage = () => {
    // Send a quick message response
    handleDecline();
    // Navigate to chat
    navigation.navigate('ChatRoom' as never, {
      chatId: callerId,
      chatName: callerName,
    } as never);
  };

  const renderAvatar = () => {
    const initials = callerName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const rotate = ringAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-10deg', '0deg', '10deg'],
    });

    return (
      <Animated.View
        style={[
          styles.avatarContainer,
          { transform: [{ scale: pulseAnim }, { rotate }] },
        ]}
      >
        {/* Pulse rings */}
        <View style={[styles.pulseRing, styles.pulseRing1]} />
        <View style={[styles.pulseRing, styles.pulseRing2]} />
        <View style={[styles.pulseRing, styles.pulseRing3]} />
        
        <LinearGradient
          colors={['#FF6B6B', '#FF5A5A', '#FF4040']}
          style={styles.avatarGradient}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const slideTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const slideOpacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Call type badge */}
        <View style={styles.header}>
          <View style={styles.callTypeBadge}>
            <IconIon
              name={callType === 'video' ? 'videocam' : 'call'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.callTypeText}>
              {callType === 'video' ? 'Video Call' : 'Voice Call'}
            </Text>
          </View>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {renderAvatar()}
          
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callLabel}>Incoming {callType} call</Text>

          {/* Quick message options */}
          <View style={styles.quickMessages}>
            <TouchableOpacity style={styles.quickMessageButton}>
              <Text style={styles.quickMessageText}>Can't talk now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickMessageButton}>
              <Text style={styles.quickMessageText}>Call you back</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Swipe hint */}
        <Animated.View
          style={[
            styles.swipeHint,
            { transform: [{ translateY: slideTranslate }], opacity: slideOpacity },
          ]}
        >
          <IconIon name="chevron-up" size={24} color="rgba(255,255,255,0.5)" />
          <Text style={styles.swipeHintText}>Swipe up to answer</Text>
        </Animated.View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* Decline button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={handleDecline}
          >
            <IconIon
              name="call"
              size={32}
              color="#FFFFFF"
              style={{ transform: [{ rotate: '135deg' }] }}
            />
            <Text style={styles.actionLabel}>Decline</Text>
          </TouchableOpacity>

          {/* Message button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={handleMessage}
          >
            <IconIon name="chatbubble" size={28} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Message</Text>
          </TouchableOpacity>

          {/* Answer button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.answerButton]}
            onPress={handleAnswer}
          >
            <IconIon name="call" size={32} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Answer</Text>
          </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
  },
  callTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 90, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callTypeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 140,
    height: 140,
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
    color: '#FFFFFF',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255, 90, 90, 0.4)',
  },
  pulseRing1: {
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -10,
    left: -10,
    opacity: 0.6,
  },
  pulseRing2: {
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -20,
    left: -20,
    opacity: 0.4,
  },
  pulseRing3: {
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -30,
    left: -30,
    opacity: 0.2,
  },
  callerName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  callLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
  quickMessages: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quickMessageButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  quickMessageText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  swipeHint: {
    alignItems: 'center',
    marginBottom: 20,
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  actionButton: {
    alignItems: 'center',
  },
  declineButton: {},
  messageButton: {},
  answerButton: {},
  actionLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },
});

// Override action button styles for the actual button circle
StyleSheet.create({});

const actionButtonStyles = StyleSheet.create({
  button: {
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
  decline: {
    backgroundColor: '#FF5A5A',
  },
  message: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  answer: {
    backgroundColor: '#4CAF50',
  },
});

// Update the main styles with proper button styles
styles.actionButton = {
  alignItems: 'center',
} as any;

styles.declineButton = {
  ...styles.actionButton,
} as any;

styles.messageButton = {
  ...styles.actionButton,
} as any;

styles.answerButton = {
  ...styles.actionButton,
} as any;

// Create styled buttons component
const StyledActionButton: React.FC<{
  type: 'decline' | 'message' | 'answer';
  onPress: () => void;
  children: React.ReactNode;
  label: string;
}> = ({ type, onPress, children, label }) => {
  const buttonColors = {
    decline: '#FF5A5A',
    message: 'rgba(255,255,255,0.2)',
    answer: '#4CAF50',
  };

  return (
    <TouchableOpacity style={{ alignItems: 'center' }} onPress={onPress}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: buttonColors[type],
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {children}
      </View>
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default IncomingCallScreen;
