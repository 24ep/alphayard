import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Alert, Vibration, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  timestamp: Date;
}

interface ActiveCall {
  callId: string;
  participants: string[];
  callType: 'voice' | 'video';
  startTime: Date;
  status: 'connecting' | 'ringing' | 'connected' | 'ended';
  isMuted: boolean;
  isVideoOff: boolean;
}

interface CallContextType {
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  callHistory: CallHistoryItem[];
  isInCall: boolean;
  acceptCall: () => void;
  declineCall: () => void;
  endCurrentCall: () => void;
  startCall: (participants: string[], callType: 'voice' | 'video') => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

interface CallHistoryItem {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  callType: 'voice' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed' | 'declined';
  duration: number; // in seconds
  timestamp: Date;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

interface CallProviderProps {
  children: ReactNode;
}

// Example call history data
const EXAMPLE_CALL_HISTORY: CallHistoryItem[] = [
  {
    id: '1',
    participantId: 'user-1',
    participantName: 'Mom',
    callType: 'video',
    direction: 'outgoing',
    status: 'answered',
    duration: 324, // 5:24
    timestamp: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: '2',
    participantId: 'user-2',
    participantName: 'Dad',
    callType: 'voice',
    direction: 'incoming',
    status: 'answered',
    duration: 187, // 3:07
    timestamp: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: '3',
    participantId: 'user-3',
    participantName: 'Sister',
    callType: 'video',
    direction: 'incoming',
    status: 'missed',
    duration: 0,
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: '4',
    participantId: 'user-4',
    participantName: 'Brother',
    callType: 'voice',
    direction: 'outgoing',
    status: 'declined',
    duration: 0,
    timestamp: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: '5',
    participantId: 'user-1',
    participantName: 'Mom',
    callType: 'voice',
    direction: 'incoming',
    status: 'answered',
    duration: 892, // 14:52
    timestamp: new Date(Date.now() - 86400000 * 3),
  },
];

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { on, off, answerCall, endCall, initiateCall, isConnected } = useSocket();
  const navigation = useNavigation();

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(EXAMPLE_CALL_HISTORY);
  const [ringtoneSound, setRingtoneSound] = useState<Audio.Sound | null>(null);

  const isInCall = activeCall !== null && activeCall.status !== 'ended';

  // Listen for incoming calls
  useEffect(() => {
    if (!isConnected) return;

    const handleIncomingCall = (data: any) => {
      console.log('Incoming call:', data);
      
      // Don't accept new calls if already in a call
      if (isInCall) {
        // Send busy signal
        answerCall(data.callerId, false);
        return;
      }

      const call: IncomingCall = {
        callId: data.callId || Date.now().toString(),
        callerId: data.callerId,
        callerName: data.callerName || 'Unknown',
        callerAvatar: data.callerAvatar,
        callType: data.callType || 'voice',
        timestamp: new Date(),
      };

      setIncomingCall(call);
      startRinging();
      
      // Navigate to incoming call screen
      navigation.navigate('IncomingCall' as never, {
        callId: call.callId,
        callerId: call.callerId,
        callerName: call.callerName,
        callerAvatar: call.callerAvatar,
        callType: call.callType,
      } as never);
    };

    const handleCallEnded = (data: any) => {
      console.log('Call ended:', data);
      stopRinging();
      
      if (incomingCall && data.callId === incomingCall.callId) {
        // Missed call
        addToHistory({
          participantId: incomingCall.callerId,
          participantName: incomingCall.callerName,
          participantAvatar: incomingCall.callerAvatar,
          callType: incomingCall.callType,
          direction: 'incoming',
          status: 'missed',
          duration: 0,
        });
        setIncomingCall(null);
      }
      
      if (activeCall && data.callId === activeCall.callId) {
        const duration = Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000);
        setActiveCall((prev) => prev ? { ...prev, status: 'ended' } : null);
        
        // Clear after a moment
        setTimeout(() => setActiveCall(null), 2000);
      }
    };

    const handleCallAnswered = (data: any) => {
      console.log('Call answered:', data);
      stopRinging();
      
      setActiveCall((prev) => prev ? { ...prev, status: 'connected' } : null);
    };

    on('incoming-call', handleIncomingCall);
    on('call-ended', handleCallEnded);
    on('call-answered', handleCallAnswered);

    return () => {
      off('incoming-call', handleIncomingCall);
      off('call-ended', handleCallEnded);
      off('call-answered', handleCallAnswered);
    };
  }, [isConnected, isInCall, incomingCall, activeCall]);

  const startRinging = async () => {
    try {
      // Vibrate
      const pattern = Platform.OS === 'android' ? [500, 1000] : [500, 1000, 500, 1000];
      Vibration.vibrate(pattern, true);

      // Play ringtone (would need actual audio file)
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../../assets/sounds/ringtone.mp3'),
      //   { shouldPlay: true, isLooping: true }
      // );
      // setRingtoneSound(sound);
    } catch (error) {
      console.error('Failed to start ringing:', error);
    }
  };

  const stopRinging = async () => {
    Vibration.cancel();
    if (ringtoneSound) {
      await ringtoneSound.stopAsync();
      await ringtoneSound.unloadAsync();
      setRingtoneSound(null);
    }
  };

  const addToHistory = (item: Omit<CallHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: CallHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setCallHistory((prev) => [newItem, ...prev]);
  };

  const acceptCall = useCallback(() => {
    if (!incomingCall) return;

    stopRinging();
    answerCall(incomingCall.callerId, true);

    const call: ActiveCall = {
      callId: incomingCall.callId,
      participants: [incomingCall.callerId],
      callType: incomingCall.callType,
      startTime: new Date(),
      status: 'connected',
      isMuted: false,
      isVideoOff: false,
    };

    setActiveCall(call);
    setIncomingCall(null);

    // Navigate to call screen
    const screen = call.callType === 'video' ? 'VideoCall' : 'VoiceCall';
    navigation.navigate(screen as never, {
      contactId: incomingCall.callerId,
      contactName: incomingCall.callerName,
      contactAvatar: incomingCall.callerAvatar,
      callId: call.callId,
      isIncoming: true,
    } as never);
  }, [incomingCall, answerCall, navigation]);

  const declineCall = useCallback(() => {
    if (!incomingCall) return;

    stopRinging();
    answerCall(incomingCall.callerId, false);

    addToHistory({
      participantId: incomingCall.callerId,
      participantName: incomingCall.callerName,
      participantAvatar: incomingCall.callerAvatar,
      callType: incomingCall.callType,
      direction: 'incoming',
      status: 'declined',
      duration: 0,
    });

    setIncomingCall(null);
    navigation.goBack();
  }, [incomingCall, answerCall, navigation]);

  const endCurrentCall = useCallback(() => {
    if (!activeCall) return;

    endCall(activeCall.participants);

    const duration = Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000);

    addToHistory({
      participantId: activeCall.participants[0],
      participantName: 'User', // Would need actual name
      callType: activeCall.callType,
      direction: 'outgoing',
      status: 'answered',
      duration,
    });

    setActiveCall((prev) => prev ? { ...prev, status: 'ended' } : null);
    setTimeout(() => setActiveCall(null), 2000);
  }, [activeCall, endCall]);

  const startCall = useCallback((participants: string[], callType: 'voice' | 'video') => {
    if (isInCall) {
      Alert.alert('Already in call', 'Please end your current call first.');
      return;
    }

    initiateCall(participants, callType);

    const call: ActiveCall = {
      callId: Date.now().toString(),
      participants,
      callType,
      startTime: new Date(),
      status: 'connecting',
      isMuted: false,
      isVideoOff: false,
    };

    setActiveCall(call);
  }, [isInCall, initiateCall]);

  const toggleMute = useCallback(() => {
    setActiveCall((prev) => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  }, []);

  const toggleVideo = useCallback(() => {
    setActiveCall((prev) => prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null);
  }, []);

  const contextValue: CallContextType = {
    incomingCall,
    activeCall,
    callHistory,
    isInCall,
    acceptCall,
    declineCall,
    endCurrentCall,
    startCall,
    toggleMute,
    toggleVideo,
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (context === undefined) {
    // Return safe defaults if provider is not present
    console.warn('useCall: CallProvider not found, using defaults');
    return {
      incomingCall: null,
      activeCall: null,
      callHistory: [],
      isInCall: false,
      acceptCall: () => {},
      declineCall: () => {},
      endCurrentCall: () => {},
      startCall: () => {},
      toggleMute: () => {},
      toggleVideo: () => {},
    };
  }
  return context;
};

export default CallContext;
