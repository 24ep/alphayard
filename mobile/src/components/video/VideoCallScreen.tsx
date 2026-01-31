import React, { useState, useEffect, useRef } from 'react';
import { View, Dimensions, Alert, Platform } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  IconButton,
  Badge,
  Pressable,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Input,
  FormControl,
  FormControlLabel,
  Select,
  CheckIcon,
  Divider,
  Spinner,
  FlatList,
  Avatar,
  Progress,
  Fab,
  FabIcon,
  FabLabel,
} from 'native-base';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../services/socketService';

const { width, height } = Dimensions.get('window');

interface VideoParticipant {
  id: string;
  name: string;
  avatar?: string;
  isLocal: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  stream?: any; // WebRTC stream
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  role: 'host' | 'participant';
  joinedAt: Date;
}

interface VideoCall {
  id: string;
  title: string;
  participants: VideoParticipant[];
  startTime: Date;
  isRecording: boolean;
  isScreenSharing: boolean;
  settings: {
    videoEnabled: boolean;
    audioEnabled: boolean;
    cameraFacing: 'front' | 'back';
    quality: 'low' | 'medium' | 'high';
    backgroundBlur: boolean;
    virtualBackground?: string;
  };
}

interface VideoCallScreenProps {
  callId: string;
  circleId: string;
  onCallEnd?: () => void;
  onCallMinimize?: () => void;
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  callId,
  circleId,
  onCallEnd,
  onCallMinimize,
}) => {
  const { user } = useAuth();
  const { socketService } = useSocket();
  const [participants, setParticipants] = useState<VideoParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<VideoParticipant | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.black, colors.black);
  const cardBgColor = useColorModeValue(colors.gray[800], colors.gray[900]);
  const textColor = useColorModeValue(colors.white[500], colors.white[500]);

  // WebRTC refs
  const localVideoRef = useRef<any>(null);
  const remoteVideoRefs = useRef<{ [key: string]: any }>({});
  const peerConnections = useRef<{ [key: string]: any }>({});
  const localStream = useRef<any>(null);

  // Timer for call duration
  const durationTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeCall();
    startCallTimer();
    
    return () => {
      cleanupCall();
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    };
  }, []);

  const initializeCall = async () => {
    try {
      setIsConnecting(true);
      
      // Initialize local participant
      const local: VideoParticipant = {
        id: user?.id || '',
        name: user?.name || 'You',
        avatar: user?.avatar,
        isLocal: true,
        isVideoEnabled: true,
        isAudioEnabled: true,
        isSpeaking: false,
        isScreenSharing: false,
        connectionQuality: 'excellent',
        role: 'host',
        joinedAt: new Date(),
      };
      
      setLocalParticipant(local);
      setParticipants([local]);

      // Initialize WebRTC
      await initializeWebRTC();
      
      // Join call room
      socketService.joinVideoCall(callId, {
        userId: user?.id || '',
        userName: user?.name || '',
        userAvatar: user?.avatar,
      });

      // Listen for call events
      setupCallEventListeners();
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Failed to initialize call:', error);
      Alert.alert('Error', 'Failed to join video call');
      onCallEnd?.();
    }
  };

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStream.current = stream;
      
      // Set local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Update local participant with stream
      setLocalParticipant(prev => prev ? { ...prev, stream } : null);
    } catch (error) {
      console.error('Failed to get user media:', error);
      Alert.alert('Error', 'Failed to access camera and microphone');
    }
  };

  const setupCallEventListeners = () => {
    // Participant joined
    socketService.onParticipantJoined((participant) => {
      setParticipants(prev => [...prev, participant]);
      createPeerConnection(participant.id);
    });

    // Participant left
    socketService.onParticipantLeft((participantId) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      closePeerConnection(participantId);
    });

    // Video/audio state changes
    socketService.onParticipantStateChange((participantId, updates) => {
      setParticipants(prev => prev.map(p => 
        p.id === participantId ? { ...p, ...updates } : p
      ));
    });

    // Chat messages
    socketService.onChatMessage((message) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Connection quality updates
    socketService.onConnectionQualityChange((participantId, quality) => {
      setParticipants(prev => prev.map(p => 
        p.id === participantId ? { ...p, connectionQuality: quality } : p
      ));
    });
  };

  const createPeerConnection = (participantId: string) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // Add local stream
      if (localStream.current) {
        localStream.current.getTracks().forEach((track: any) => {
          pc.addTrack(track, localStream.current);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (remoteVideoRefs.current[participantId]) {
          remoteVideoRefs.current[participantId].srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.sendIceCandidate(callId, participantId, event.candidate);
        }
      };

      peerConnections.current[participantId] = pc;
    } catch (error) {
      console.error('Failed to create peer connection:', error);
    }
  };

  const closePeerConnection = (participantId: string) => {
    const pc = peerConnections.current[participantId];
    if (pc) {
      pc.close();
      delete peerConnections.current[participantId];
    }
  };

  const startCallTimer = () => {
    durationTimer.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const cleanupCall = () => {
    // Stop local stream
    if (localStream.current) {
      localStream.current.getTracks().forEach((track: any) => track.stop());
    }

    // Close peer connections
    Object.values(peerConnections.current).forEach((pc: any) => {
      pc.close();
    });
    peerConnections.current = {};

    // Leave call room
    socketService.leaveVideoCall(callId);
  };

  const handleToggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Update local participant
        setLocalParticipant(prev => prev ? { ...prev, isAudioEnabled: audioTrack.enabled } : null);
        
        // Notify other participants
        socketService.updateParticipantState(callId, { isAudioEnabled: audioTrack.enabled });
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        
        // Update local participant
        setLocalParticipant(prev => prev ? { ...prev, isVideoEnabled: videoTrack.enabled } : null);
        
        // Notify other participants
        socketService.updateParticipantState(callId, { isVideoEnabled: videoTrack.enabled });
      }
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = Object.values(peerConnections.current).find((pc: any) => 
          pc.getSenders().some((s: any) => s.track?.kind === 'video')
        );
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        setIsScreenSharing(true);
        setLocalParticipant(prev => prev ? { ...prev, isScreenSharing: true } : null);
      } else {
        // Stop screen sharing
        const videoTrack = localStream.current?.getVideoTracks()[0];
        if (videoTrack) {
          const sender = Object.values(peerConnections.current).find((pc: any) => 
            pc.getSenders().some((s: any) => s.track?.kind === 'video')
          );
          
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(false);
        setLocalParticipant(prev => prev ? { ...prev, isScreenSharing: false } : null);
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      Alert.alert('Error', 'Failed to toggle screen sharing');
    }
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            cleanupCall();
            onCallEnd?.();
          },
        },
      ]
    );
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        senderId: user?.id || '',
        senderName: user?.name || 'You',
        content: newMessage.trim(),
        timestamp: new Date(),
      };
      
      socketService.sendChatMessage(callId, message);
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
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

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return colors.green[500];
      case 'good': return colors.yellow[500];
      case 'poor': return colors.red[500];
      case 'disconnected': return colors.gray[500];
      default: return colors.gray[500];
    }
  };

  const renderParticipantVideo = (participant: VideoParticipant) => {
    const isMainView = participants.length <= 2 || participant.isLocal;
    
    return (
      <Box
        key={participant.id}
        position="relative"
        borderRadius={12}
        overflow="hidden"
        bg={colors.gray[900]}
        borderWidth={2}
        borderColor={participant.isSpeaking ? colors.primary[500] : 'transparent'}
      >
        {participant.isVideoEnabled ? (
          <video
            ref={participant.isLocal ? localVideoRef : (el) => { remoteVideoRefs.current[participant.id] = el; }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            autoPlay
            playsInline
            muted={participant.isLocal}
          />
        ) : (
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            bg={colors.gray[800]}
            minH={isMainView ? 400 : 200}
          >
            <Avatar
              size={isMainView ? '2xl' : 'lg'}
              source={{ uri: participant.avatar }}
              bg={colors.primary[500]}
            >
              {participant.name.charAt(0)}
            </Avatar>
            <Text style={textStyles.h4} color={textColor} mt={2}>
              {participant.name}
            </Text>
            <Text style={textStyles.caption} color={colors.gray[400]}>
              Camera off
            </Text>
          </Box>
        )}
        
        {/* Participant info overlay */}
        <Box
          position="absolute"
          bottom={2}
          left={2}
          right={2}
          bg="rgba(0,0,0,0.7)"
          borderRadius={8}
          p={2}
        >
          <HStack space={2} alignItems="center">
            <Text style={textStyles.caption} color={textColor} fontWeight="600">
              {participant.name}
            </Text>
            {participant.isLocal && (
              <Badge colorScheme="primary" variant="subtle" size="xs">
                You
              </Badge>
            )}
            <Box flex={1} />
            <HStack space={1}>
              {!participant.isAudioEnabled && (
                <Icon as={IconMC} name="microphone-off" size={3} color={colors.red[500]} />
              )}
              {participant.isScreenSharing && (
                <Icon as={IconMC} name="monitor-share" size={3} color={colors.primary[500]} />
              )}
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={getConnectionQualityColor(participant.connectionQuality)}
              />
            </HStack>
          </HStack>
        </Box>
      </Box>
    );
  };

  if (isConnecting) {
    return (
      <Box flex={1} bg={bgColor} justifyContent="center" alignItems="center">
        <VStack space={4} alignItems="center">
          <Spinner size="lg" color={colors.primary[500]} />
          <Text style={textStyles.h4} color={textColor}>
            Connecting to call...
          </Text>
          <Text style={textStyles.caption} color={colors.gray[400]}>
            Please wait while we establish your connection
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={bgColor}>
      {/* Main video area */}
      <Box flex={1} position="relative">
        {participants.length === 1 ? (
          // Single participant (local only)
          renderParticipantVideo(participants[0])
        ) : participants.length === 2 ? (
          // Two participants - side by side
          <HStack space={2} p={2}>
            {participants.map(renderParticipantVideo)}
          </HStack>
        ) : (
          // Multiple participants - grid layout
          <Box p={2}>
            <FlatList
              data={participants}
              renderItem={({ item }) => renderParticipantVideo(item)}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
            />
          </Box>
        )}
      </Box>

      {/* Call controls */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg="rgba(0,0,0,0.8)"
        p={4}
      >
        <VStack space={4}>
          {/* Call info */}
          <HStack space={3} alignItems="center" justifyContent="center">
            <Text style={textStyles.h4} color={textColor}>
              {formatDuration(callDuration)}
            </Text>
            <Badge colorScheme="primary" variant="subtle">
              {participants.length} participants
            </Badge>
            {isRecording && (
              <Badge colorScheme="red" variant="solid">
                Recording
              </Badge>
            )}
          </HStack>

          {/* Control buttons */}
          <HStack space={4} justifyContent="center" alignItems="center">
            <IconButton
              icon={<Icon as={IconMC} name={isMuted ? 'microphone-off' : 'microphone'} size={6} />}
              onPress={handleToggleMute}
              variant="ghost"
              size="lg"
              colorScheme={isMuted ? 'red' : 'gray'}
              bg={isMuted ? colors.red[500] : colors.gray[600]}
              _pressed={{ bg: isMuted ? colors.red[600] : colors.gray[700] }}
            />
            
            <IconButton
              icon={<Icon as={IconMC} name={isVideoOff ? 'video-off' : 'video'} size={6} />}
              onPress={handleToggleVideo}
              variant="ghost"
              size="lg"
              colorScheme={isVideoOff ? 'red' : 'gray'}
              bg={isVideoOff ? colors.red[500] : colors.gray[600]}
              _pressed={{ bg: isVideoOff ? colors.red[600] : colors.gray[700] }}
            />
            
            <IconButton
              icon={<Icon as={IconMC} name="monitor-share" size={6} />}
              onPress={handleToggleScreenShare}
              variant="ghost"
              size="lg"
              colorScheme={isScreenSharing ? 'primary' : 'gray'}
              bg={isScreenSharing ? colors.primary[500] : colors.gray[600]}
              _pressed={{ bg: isScreenSharing ? colors.primary[600] : colors.gray[700] }}
            />
            
            <IconButton
              icon={<Icon as={IconMC} name="account-group" size={6} />}
              onPress={() => setShowParticipants(!showParticipants)}
              variant="ghost"
              size="lg"
              colorScheme={showParticipants ? 'primary' : 'gray'}
              bg={showParticipants ? colors.primary[500] : colors.gray[600]}
              _pressed={{ bg: showParticipants ? colors.primary[600] : colors.gray[700] }}
            />
            
            <IconButton
              icon={<Icon as={IconMC} name="message" size={6} />}
              onPress={() => setShowChat(!showChat)}
              variant="ghost"
              size="lg"
              colorScheme={showChat ? 'primary' : 'gray'}
              bg={showChat ? colors.primary[500] : colors.gray[600]}
              _pressed={{ bg: showChat ? colors.primary[600] : colors.gray[700] }}
            />
            
            <IconButton
              icon={<Icon as={IconMC} name="phone-hangup" size={6} />}
              onPress={handleEndCall}
              variant="ghost"
              size="lg"
              colorScheme="red"
              bg={colors.red[500]}
              _pressed={{ bg: colors.red[600] }}
            />
          </HStack>
        </VStack>
      </Box>

      {/* Participants list */}
      {showParticipants && (
        <Modal isOpen={showParticipants} onClose={() => setShowParticipants(false)} size="md">
          <ModalOverlay />
          <ModalContent bg={cardBgColor}>
            <ModalHeader>
              <Text style={textStyles.h3} color={textColor}>
                Participants ({participants.length})
              </Text>
            </ModalHeader>
            <ModalBody>
              <VStack space={3}>
                {participants.map((participant) => (
                  <HStack key={participant.id} space={3} alignItems="center">
                    <Avatar
                      size="sm"
                      source={{ uri: participant.avatar }}
                      bg={colors.primary[500]}
                    >
                      {participant.name.charAt(0)}
                    </Avatar>
                    <VStack flex={1}>
                      <HStack space={2} alignItems="center">
                        <Text style={textStyles.body} color={textColor} fontWeight="500">
                          {participant.name}
                        </Text>
                        {participant.isLocal && (
                          <Badge colorScheme="primary" variant="subtle" size="xs">
                            You
                          </Badge>
                        )}
                        {participant.role === 'host' && (
                          <Badge colorScheme="yellow" variant="subtle" size="xs">
                            Host
                          </Badge>
                        )}
                      </HStack>
                      <Text style={textStyles.caption} color={colors.gray[400]}>
                        {participant.isAudioEnabled ? 'Audio on' : 'Audio off'} • {participant.isVideoEnabled ? 'Video on' : 'Video off'}
                      </Text>
                    </VStack>
                    <Box
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={getConnectionQualityColor(participant.connectionQuality)}
                    />
                  </HStack>
                ))}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Chat panel */}
      {showChat && (
        <Modal isOpen={showChat} onClose={() => setShowChat(false)} size="md">
          <ModalOverlay />
          <ModalContent bg={cardBgColor} h={400}>
            <ModalHeader>
              <Text style={textStyles.h3} color={textColor}>
                Chat
              </Text>
            </ModalHeader>
            <ModalBody flex={1}>
              <VStack space={3} flex={1}>
                <FlatList
                  data={chatMessages}
                  renderItem={({ item }) => (
                    <Box
                      bg={item.senderId === user?.id ? colors.primary[500] : colors.gray[700]}
                      p={3}
                      borderRadius={12}
                      alignSelf={item.senderId === user?.id ? 'flex-end' : 'flex-start'}
                      maxW="80%"
                    >
                      <Text style={textStyles.caption} color={colors.gray[300]}>
                        {item.senderName}
                      </Text>
                      <Text style={textStyles.body} color={textColor}>
                        {item.content}
                      </Text>
                    </Box>
                  )}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  flex={1}
                />
                
                <HStack space={2}>
                  <Input
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    flex={1}
                    bg={colors.gray[700]}
                    borderColor={colors.gray[600]}
                    color={textColor}
                    _focus={{ borderColor: colors.primary[500] }}
                  />
                  <IconButton
                    icon={<Icon as={IconMC} name="send" size={5} />}
                    onPress={handleSendMessage}
                    bg={colors.primary[500]}
                    _pressed={{ bg: colors.primary[600] }}
                  />
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default VideoCallScreen; 
