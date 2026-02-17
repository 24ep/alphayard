import React, { useState, useEffect } from 'react';
import { View, Alert, RefreshControl } from 'react-native';
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
  Image,
  ScrollView,
} from 'native-base';
import { MapCN as MapView, Marker, Circle } from '../../components/common/MapCN';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../services/socketService';

interface Neighbor {
  id: string;
  name: string;
  avatar?: string;
  distance: number; // in meters
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  circleSize: number;
  interests: string[];
  isOnline: boolean;
  lastSeen: Date;
  isVerified: boolean;
  trustScore: number; // 0-100
  mutualConnections: number;
  joinedAt: Date;
}

interface VillageGroup {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  memberCount: number;
  category: 'community' | 'hobby' | 'support' | 'business' | 'event';
  isPrivate: boolean;
  isJoined: boolean;
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  rules: string[];
  admins: string[];
}

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  image?: string;
  startTime: Date;
  endTime: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  category: 'social' | 'community' | 'education' | 'health' | 'business';
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendees: Array<{
    id: string;
    name: string;
    avatar?: string;
    isConfirmed: boolean;
  }>;
  maxAttendees?: number;
  isFree: boolean;
  price?: number;
  tags: string[];
  isInterested: boolean;
  isAttending: boolean;
}

interface CommunityPost {
  id: string;
  content: string;
  images?: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isShared: boolean;
  category: 'general' | 'help' | 'announcement' | 'event' | 'business';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface NeighborsScreenProps {
  circleId: string;
  onNeighborPress?: (neighbor: Neighbor) => void;
  onGroupPress?: (group: VillageGroup) => void;
  onEventPress?: (event: LocalEvent) => void;
}

const NeighborsScreen: React.FC<NeighborsScreenProps> = ({
  circleId,
  onNeighborPress,
  onGroupPress,
  onEventPress,
}) => {
  const { user } = useAuth();
  const { socketService } = useSocket();
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [villageGroups, setVillageGroups] = useState<VillageGroup[]>([]);
  const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [selectedNeighbor, setSelectedNeighbor] = useState<Neighbor | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<VillageGroup | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<LocalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'neighbors' | 'groups' | 'events' | 'community'>('neighbors');
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 13.7563, // Bangkok default
    longitude: 100.5018,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isGroupOpen, onOpen: onGroupOpen, onClose: onGroupClose } = useDisclosure();
  const { isOpen: isEventOpen, onOpen: onEventOpen, onClose: onEventClose } = useDisclosure();
  const { isOpen: isCreatePostOpen, onOpen: onCreatePostOpen, onClose: onCreatePostClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const cardBgColor = useColorModeValue(colors.gray[50], colors.gray[700]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  // Form state
  const [postForm, setPostForm] = useState({
    content: '',
    category: 'general' as const,
    images: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadNeighbors(),
        loadVillageGroups(),
        loadLocalEvents(),
        loadCommunityPosts(),
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNeighbors = async () => {
    // Mock data - replace with actual API call
    const mockNeighbors: Neighbor[] = [
      {
        id: '1',
        name: 'Somchai Circle',
        avatar: 'https://picsum.photos/200/200?random=1',
        distance: 150,
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: '123 Sukhumvit Road, Bangkok',
        },
        circleSize: 4,
        interests: ['gardening', 'cooking', 'music'],
        isOnline: true,
        lastSeen: new Date(),
        isVerified: true,
        trustScore: 85,
        mutualConnections: 3,
        joinedAt: new Date('2023-06-15'),
      },
      {
        id: '2',
        name: 'Pim Circle',
        avatar: 'https://picsum.photos/200/200?random=2',
        distance: 300,
        location: {
          latitude: 13.7564,
          longitude: 100.5019,
          address: '456 Silom Road, Bangkok',
        },
        circleSize: 3,
        interests: ['sports', 'reading', 'travel'],
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isVerified: true,
        trustScore: 92,
        mutualConnections: 5,
        joinedAt: new Date('2023-05-20'),
      },
      {
        id: '3',
        name: 'Nong Circle',
        avatar: 'https://picsum.photos/200/200?random=3',
        distance: 500,
        location: {
          latitude: 13.7565,
          longitude: 100.5020,
          address: '789 Rama 9 Road, Bangkok',
        },
        circleSize: 5,
        interests: ['art', 'photography', 'technology'],
        isOnline: true,
        lastSeen: new Date(),
        isVerified: false,
        trustScore: 45,
        mutualConnections: 1,
        joinedAt: new Date('2024-01-10'),
      },
    ];
    setNeighbors(mockNeighbors);
  };

  const loadVillageGroups = async () => {
    // Mock data - replace with actual API call
    const mockGroups: VillageGroup[] = [
      {
        id: '1',
        name: 'Bangkok Community Gardeners',
        description: 'Share gardening tips and organize community garden events',
        coverImage: 'https://picsum.photos/400/200?random=4',
        memberCount: 45,
        category: 'hobby',
        isPrivate: false,
        isJoined: true,
        createdBy: 'user1',
        createdAt: new Date('2023-03-15'),
        lastActivity: new Date(),
        rules: ['Be respectful', 'Share knowledge', 'No spam'],
        admins: ['user1', 'user2'],
      },
      {
        id: '2',
        name: 'Local Business Network',
        description: 'Connect with local business owners and entrepreneurs',
        coverImage: 'https://picsum.photos/400/200?random=5',
        memberCount: 23,
        category: 'business',
        isPrivate: true,
        isJoined: false,
        createdBy: 'user3',
        createdAt: new Date('2023-08-20'),
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        rules: ['Business discussions only', 'No advertising', 'Professional conduct'],
        admins: ['user3'],
      },
      {
        id: '3',
        name: 'Neighborhood Watch',
        description: 'Keep our community safe and informed',
        coverImage: 'https://picsum.photos/400/200?random=6',
        memberCount: 67,
        category: 'community',
        isPrivate: false,
        isJoined: true,
        createdBy: 'user4',
        createdAt: new Date('2023-01-10'),
        lastActivity: new Date(),
        rules: ['Report suspicious activity', 'Be vigilant', 'Help neighbors'],
        admins: ['user4', 'user5', 'user6'],
      },
    ];
    setVillageGroups(mockGroups);
  };

  const loadLocalEvents = async () => {
    // Mock data - replace with actual API call
    const mockEvents: LocalEvent[] = [
      {
        id: '1',
        title: 'Community Cleanup Day',
        description: 'Join us for a neighborhood cleanup event. Bring your own gloves and bags.',
        image: 'https://picsum.photos/400/200?random=7',
        startTime: new Date('2024-02-15T09:00:00'),
        endTime: new Date('2024-02-15T12:00:00'),
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: 'Central Park, Bangkok',
        },
        category: 'community',
        organizer: {
          id: 'user1',
          name: 'Somchai Circle',
          avatar: 'https://picsum.photos/200/200?random=1',
        },
        attendees: [
          { id: 'user1', name: 'Somchai', avatar: 'https://picsum.photos/200/200?random=1', isConfirmed: true },
          { id: 'user2', name: 'Pim', avatar: 'https://picsum.photos/200/200?random=2', isConfirmed: true },
        ],
        maxAttendees: 50,
        isFree: true,
        tags: ['community', 'environment', 'volunteer'],
        isInterested: true,
        isAttending: false,
      },
      {
        id: '2',
        title: 'Local Food Festival',
        description: 'Taste delicious local cuisine from neighborhood restaurants',
        image: 'https://picsum.photos/400/200?random=8',
        startTime: new Date('2024-02-20T17:00:00'),
        endTime: new Date('2024-02-20T22:00:00'),
        location: {
          latitude: 13.7564,
          longitude: 100.5019,
          address: 'Food Street Market, Bangkok',
        },
        category: 'social',
        organizer: {
          id: 'user3',
          name: 'Local Business Network',
          avatar: 'https://picsum.photos/200/200?random=3',
        },
        attendees: [
          { id: 'user1', name: 'Somchai', avatar: 'https://picsum.photos/200/200?random=1', isConfirmed: false },
        ],
        maxAttendees: 100,
        isFree: false,
        price: 200,
        tags: ['food', 'culture', 'social'],
        isInterested: false,
        isAttending: false,
      },
    ];
    setLocalEvents(mockEvents);
  };

  const loadCommunityPosts = async () => {
    // Mock data - replace with actual API call
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        content: 'Does anyone know a good plumber in the area? Our kitchen sink is clogged and we need help ASAP!',
        author: {
          id: 'user1',
          name: 'Somchai Circle',
          avatar: 'https://picsum.photos/200/200?random=1',
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 5,
        comments: 3,
        shares: 1,
        isLiked: false,
        isShared: false,
        category: 'help',
      },
      {
        id: '2',
        content: 'Great news! The new playground in Central Park is finally open. Perfect for families with young children.',
        images: ['https://picsum.photos/400/300?random=9'],
        author: {
          id: 'user2',
          name: 'Pim Circle',
          avatar: 'https://picsum.photos/200/200?random=2',
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        likes: 12,
        comments: 7,
        shares: 4,
        isLiked: true,
        isShared: false,
        category: 'announcement',
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: 'Central Park, Bangkok',
        },
      },
    ];
    setCommunityPosts(mockPosts);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleNeighborPress = (neighbor: Neighbor) => {
    setSelectedNeighbor(neighbor);
    onOpen();
    onNeighborPress?.(neighbor);
  };

  const handleGroupPress = (group: VillageGroup) => {
    setSelectedGroup(group);
    onGroupOpen();
    onGroupPress?.(group);
  };

  const handleEventPress = (event: LocalEvent) => {
    setSelectedEvent(event);
    onEventOpen();
    onEventPress?.(event);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      setVillageGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, isJoined: true, memberCount: group.memberCount + 1 } : group
      ));
      Alert.alert('Success', 'You have joined the group!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      setVillageGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, isJoined: false, memberCount: group.memberCount - 1 } : group
      ));
      Alert.alert('Success', 'You have left the group');
    } catch (error) {
      Alert.alert('Error', 'Failed to leave group');
    }
  };

  const handleEventInterest = async (eventId: string) => {
    setLocalEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, isInterested: !event.isInterested } : event
    ));
  };

  const handleEventAttendance = async (eventId: string) => {
    setLocalEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, isAttending: !event.isAttending } : event
    ));
  };

  const handleCreatePost = async () => {
    if (!postForm.content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      const newPost: CommunityPost = {
        id: `post_${Date.now()}`,
        content: postForm.content.trim(),
        images: postForm.images,
        author: {
          id: user?.id || '',
          name: user?.name || 'You',
          avatar: user?.avatar,
        },
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isShared: false,
        category: postForm.category,
      };

      setCommunityPosts(prev => [newPost, ...prev]);
      setPostForm({ content: '', category: 'general', images: [] });
      onCreatePostClose();
      Alert.alert('Success', 'Post created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleLikePost = (postId: string) => {
    setCommunityPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
    ));
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return colors.green[500];
    if (score >= 60) return colors.yellow[500];
    return colors.red[500];
  };

  const renderNeighborItem = ({ item: neighbor }: { item: Neighbor }) => (
    <Pressable onPress={() => handleNeighborPress(neighbor)}>
      <Box
        bg={cardBgColor}
        p={4}
        borderRadius={12}
        mb={3}
        borderWidth={1}
        borderColor={colors.gray[200]}
      >
        <HStack space={3} alignItems="center">
          <Box position="relative">
            <Avatar
              size="lg"
              source={{ uri: neighbor.avatar }}
              bg={colors.primary[500]}
            >
              {neighbor.name.charAt(0)}
            </Avatar>
            <Box
              position="absolute"
              bottom={0}
              right={0}
              w={4}
              h={4}
              borderRadius="full"
              bg={neighbor.isOnline ? colors.green[500] : colors.gray[400]}
              borderWidth={2}
              borderColor={colors.white[500]}
            />
          </Box>
          
          <VStack flex={1}>
            <HStack space={2} alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {neighbor.name}
              </Text>
              {neighbor.isVerified && (
                <Icon as={IconMC} name="check-decagram" size={4} color={colors.blue[500]} />
              )}
            </HStack>
            
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {formatDistance(neighbor.distance)} away • {neighbor.circleSize} Circle members
            </Text>
            
            <HStack space={2} mt={1} flexWrap="wrap">
              {neighbor.interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} colorScheme="primary" variant="subtle" size="xs">
                  {interest}
                </Badge>
              ))}
            </HStack>
            
            <HStack space={2} mt={2} alignItems="center">
              <Progress
                value={neighbor.trustScore}
                colorScheme={neighbor.trustScore >= 80 ? 'green' : neighbor.trustScore >= 60 ? 'yellow' : 'red'}
                size="xs"
                flex={1}
              />
              <Text style={textStyles.caption} color={colors.gray[600]}>
                {neighbor.trustScore}%
              </Text>
            </HStack>
          </VStack>
          
          <VStack space={1} alignItems="flex-end">
            <Text style={textStyles.caption} color={colors.gray[500]}>
              {neighbor.mutualConnections} mutual
            </Text>
            <IconButton
              icon={<Icon as={IconMC} name="message" size={4} />}
              variant="ghost"
              size="sm"
              colorScheme="primary"
            />
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  const renderGroupItem = ({ item: group }: { item: VillageGroup }) => (
    <Pressable onPress={() => handleGroupPress(group)}>
      <Box
        bg={cardBgColor}
        borderRadius={12}
        mb={3}
        borderWidth={1}
        borderColor={colors.gray[200]}
        overflow="hidden"
      >
        {group.coverImage && (
          <Image
            source={{ uri: group.coverImage }}
            alt={group.name}
            h={120}
            w="100%"
          />
        )}
        
        <Box p={4}>
          <HStack space={3} alignItems="center" mb={2}>
            <VStack flex={1}>
              <HStack space={2} alignItems="center">
                <Text style={textStyles.h4} color={textColor} fontWeight="600">
                  {group.name}
                </Text>
                {group.isPrivate && (
                  <Icon as={IconMC} name="lock" size={4} color={colors.gray[500]} />
                )}
              </HStack>
              
              <Text style={textStyles.caption} color={colors.gray[600]}>
                {group.memberCount} members • {group.category}
              </Text>
            </VStack>
            
            <Button
              size="sm"
              variant={group.isJoined ? 'outline' : 'solid'}
              colorScheme={group.isJoined ? 'gray' : 'primary'}
              onPress={() => group.isJoined ? handleLeaveGroup(group.id) : handleJoinGroup(group.id)}
            >
              {group.isJoined ? 'Joined' : 'Join'}
            </Button>
          </HStack>
          
          <Text style={textStyles.body} color={textColor} numberOfLines={2}>
            {group.description}
          </Text>
          
          <Text style={textStyles.caption} color={colors.gray[500]} mt={2}>
            Last active {formatTimeAgo(group.lastActivity)}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );

  const renderEventItem = ({ item: event }: { item: LocalEvent }) => (
    <Pressable onPress={() => handleEventPress(event)}>
      <Box
        bg={cardBgColor}
        borderRadius={12}
        mb={3}
        borderWidth={1}
        borderColor={colors.gray[200]}
        overflow="hidden"
      >
        {event.image && (
          <Image
            source={{ uri: event.image }}
            alt={event.title}
            h={150}
            w="100%"
          />
        )}
        
        <Box p={4}>
          <HStack space={3} alignItems="center" mb={2}>
            <VStack flex={1}>
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {event.title}
              </Text>
              <Text style={textStyles.caption} color={colors.gray[600]}>
                {formatTimeAgo(event.startTime)} • {event.category}
              </Text>
            </VStack>
            
            <Badge colorScheme={event.isFree ? 'green' : 'blue'} variant="subtle">
              {event.isFree ? 'Free' : `฿${event.price}`}
            </Badge>
          </HStack>
          
          <Text style={textStyles.body} color={textColor} numberOfLines={2}>
            {event.description}
          </Text>
          
          <HStack space={2} mt={3} alignItems="center">
            <Icon as={IconMC} name="map-marker" size={4} color={colors.gray[500]} />
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {event.location.address}
            </Text>
          </HStack>
          
          <HStack space={2} mt={3}>
            <Button
              size="sm"
              variant={event.isInterested ? 'solid' : 'outline'}
              colorScheme="yellow"
              onPress={() => handleEventInterest(event.id)}
            >
              {event.isInterested ? 'Interested' : 'Interested'}
            </Button>
            <Button
              size="sm"
              variant={event.isAttending ? 'solid' : 'outline'}
              colorScheme="primary"
              onPress={() => handleEventAttendance(event.id)}
            >
              {event.isAttending ? 'Attending' : 'Attend'}
            </Button>
          </HStack>
        </Box>
      </Box>
    </Pressable>
  );

  const renderPostItem = ({ item: post }: { item: CommunityPost }) => (
    <Box
      bg={cardBgColor}
      p={4}
      borderRadius={12}
      mb={3}
      borderWidth={1}
      borderColor={colors.gray[200]}
    >
      <HStack space={3} alignItems="center" mb={3}>
        <Avatar
          size="sm"
          source={{ uri: post.author.avatar }}
          bg={colors.primary[500]}
        >
          {post.author.name.charAt(0)}
        </Avatar>
        
        <VStack flex={1}>
          <Text style={textStyles.body} color={textColor} fontWeight="600">
            {post.author.name}
          </Text>
          <Text style={textStyles.caption} color={colors.gray[600]}>
            {formatTimeAgo(post.createdAt)} • {post.category}
          </Text>
        </VStack>
      </HStack>
      
      <Text style={textStyles.body} color={textColor} mb={3}>
        {post.content}
      </Text>
      
      {post.images && post.images.length > 0 && (
        <Image
          source={{ uri: post.images[0] }}
          alt="Post image"
          h={200}
          w="100%"
          borderRadius={8}
          mb={3}
        />
      )}
      
      <HStack space={4} justifyContent="space-between">
        <HStack space={4}>
          <Pressable onPress={() => handleLikePost(post.id)}>
            <HStack space={1} alignItems="center">
              <Icon
                as={IconMC}
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={4}
                color={post.isLiked ? colors.red[500] : colors.gray[500]}
              />
              <Text style={textStyles.caption} color={colors.gray[600]}>
                {post.likes}
              </Text>
            </HStack>
          </Pressable>
          
          <HStack space={1} alignItems="center">
            <Icon as={IconMC} name="comment-outline" size={4} color={colors.gray[500]} />
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {post.comments}
            </Text>
          </HStack>
          
          <HStack space={1} alignItems="center">
            <Icon as={IconMC} name="share-outline" size={4} color={colors.gray[500]} />
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {post.shares}
            </Text>
          </HStack>
        </HStack>
      </HStack>
    </Box>
  );

  return (
    <Box flex={1} bg={bgColor}>
      {/* Header */}
      <HStack space={3} alignItems="center" mb={4}>
        <Icon
          as={IconMC}
          name="account-group"
          size={6}
          color={colors.primary[500]}
        />
        <VStack flex={1}>
          <Text style={textStyles.h3} color={textColor} fontWeight="600">
            Neighbors & Community
          </Text>
          <Text style={textStyles.caption} color={colors.gray[600]}>
            Connect with your local community
          </Text>
        </VStack>
        <HStack space={2}>
          <IconButton
            icon={<Icon as={IconMC} name={showMap ? 'view-list' : 'map'} size={5} />}
            onPress={() => setShowMap(!showMap)}
            variant="ghost"
            size="sm"
            colorScheme="primary"
          />
          <IconButton
            icon={<Icon as={IconMC} name="plus" size={5} />}
            onPress={onCreatePostOpen}
            variant="ghost"
            size="sm"
            colorScheme="primary"
          />
        </HStack>
      </HStack>

      {/* Tab Navigation */}
      <HStack space={2} mb={4} flexWrap="wrap">
        {[
          { key: 'neighbors', label: 'Neighbors', icon: 'account-group', count: neighbors.length },
          { key: 'groups', label: 'Groups', icon: 'account-multiple', count: villageGroups.length },
          { key: 'events', label: 'Events', icon: 'calendar', count: localEvents.length },
          { key: 'community', label: 'Community', icon: 'forum', count: communityPosts.length },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Box
              bg={activeTab === tab.key ? colors.primary[500] : cardBgColor}
              px={4}
              py={2}
              borderRadius={16}
              borderWidth={1}
              borderColor={activeTab === tab.key ? colors.primary[500] : colors.gray[200]}
            >
              <HStack space={2} alignItems="center">
                <Icon
                  as={IconMC}
                  name={tab.icon as any}
                  size={4}
                  color={activeTab === tab.key ? colors.white[500] : colors.gray[600]}
                />
                <Text
                  style={textStyles.caption}
                  color={activeTab === tab.key ? colors.white[500] : colors.gray[600]}
                  fontWeight={activeTab === tab.key ? '600' : '400'}
                >
                  {tab.label}
                </Text>
                <Badge
                  colorScheme={activeTab === tab.key ? 'white' : 'gray'}
                  variant="solid"
                  size="xs"
                >
                  {tab.count}
                </Badge>
              </HStack>
            </Box>
          </Pressable>
        ))}
      </HStack>

      {/* Map View */}
      {showMap && (
        <Box h={300} mb={4} borderRadius={12} overflow="hidden">
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
          >
            {neighbors.map((neighbor) => (
              <Marker
                key={neighbor.id}
                coordinate={neighbor.location}
                title={neighbor.name}
                description={`${formatDistance(neighbor.distance)} away`}
              >
                <Box
                  bg={neighbor.isOnline ? colors.green[500] : colors.gray[500]}
                  borderRadius="full"
                  p={2}
                  borderWidth={2}
                  borderColor={colors.white[500]}
                >
                  <Icon as={IconMC} name="account" size={4} color={colors.white[500]} />
                </Box>
              </Marker>
            ))}
          </MapView>
        </Box>
      )}

      {/* Content */}
      {isLoading ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" color={colors.primary[500]} />
          <Text style={textStyles.body} color={colors.gray[600]} mt={2}>
            Loading {activeTab}...
          </Text>
        </Box>
      ) : (
        <FlatList
          data={
            activeTab === 'neighbors' ? neighbors :
            activeTab === 'groups' ? villageGroups :
            activeTab === 'events' ? localEvents :
            communityPosts
          }
          renderItem={
            activeTab === 'neighbors' ? renderNeighborItem :
            activeTab === 'groups' ? renderGroupItem :
            activeTab === 'events' ? renderEventItem :
            renderPostItem
          }
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
            />
          }
          ListEmptyComponent={
            <Box alignItems="center" py={8}>
              <Icon
                as={IconMC}
                name={
                  activeTab === 'neighbors' ? 'account-group-outline' :
                  activeTab === 'groups' ? 'account-multiple-outline' :
                  activeTab === 'events' ? 'calendar-blank' :
                  'forum-outline'
                }
                size={12}
                color={colors.gray[400]}
                mb={3}
              />
              <Text style={textStyles.h4} color={colors.gray[600]} textAlign="center">
                No {activeTab} found
              </Text>
              <Text style={textStyles.caption} color={colors.gray[500]} textAlign="center">
                {activeTab === 'neighbors' ? 'Connect with your neighbors to see them here' :
                 activeTab === 'groups' ? 'Join community groups to see them here' :
                 activeTab === 'events' ? 'Local events will appear here' :
                 'Community posts will appear here'}
              </Text>
            </Box>
          }
        />
      )}

      {/* Neighbor Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack space={3} alignItems="center">
              <Avatar
                size="md"
                source={{ uri: selectedNeighbor?.avatar }}
                bg={colors.primary[500]}
              >
                {selectedNeighbor?.name.charAt(0)}
              </Avatar>
              <VStack>
                <Text style={textStyles.h3} color={textColor}>
                  {selectedNeighbor?.name}
                </Text>
                <Badge
                  colorScheme={selectedNeighbor?.isOnline ? 'success' : 'gray'}
                  variant="subtle"
                  size="sm"
                >
                  {selectedNeighbor?.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {selectedNeighbor && (
              <VStack space={4}>
                <Box>
                  <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                    Circle Info
                  </Text>
                  <Text style={textStyles.body} color={textColor}>
                    {selectedNeighbor.circleSize} Circle members
                  </Text>
                  <Text style={textStyles.body} color={textColor}>
                    {formatDistance(selectedNeighbor.distance)} away
                  </Text>
                </Box>

                <Box>
                  <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                    Interests
                  </Text>
                  <HStack space={2} flexWrap="wrap">
                    {selectedNeighbor.interests.map((interest, index) => (
                      <Badge key={index} colorScheme="primary" variant="subtle">
                        {interest}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                <Box>
                  <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                    Trust Score
                  </Text>
                  <HStack space={2} alignItems="center">
                    <Progress
                      value={selectedNeighbor.trustScore}
                      colorScheme={selectedNeighbor.trustScore >= 80 ? 'green' : selectedNeighbor.trustScore >= 60 ? 'yellow' : 'red'}
                      flex={1}
                    />
                    <Text style={textStyles.body} color={textColor}>
                      {selectedNeighbor.trustScore}%
                    </Text>
                  </HStack>
                </Box>

                <Box>
                  <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                    Location
                  </Text>
                  <Text style={textStyles.body} color={textColor}>
                    {selectedNeighbor.location.address}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack space={3}>
              <Button variant="ghost" onPress={onClose}>
                Close
              </Button>
              <Button
                bg={colors.primary[500]}
                _pressed={{ bg: colors.primary[600] }}
                onPress={() => {
                  // TODO: Start chat
                  Alert.alert('Chat', 'Chat feature coming soon!');
                }}
              >
                Message
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Post Modal */}
      <Modal isOpen={isCreatePostOpen} onClose={onCreatePostClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text style={textStyles.h3} color={textColor}>
              Create Post
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Category</Text>
                </FormControl.Label>
                <Select
                  selectedValue={postForm.category}
                  onValueChange={(value) => setPostForm(prev => ({ ...prev, category: value as any }))}
                  size="lg"
                  borderRadius={12}
                >
                  <Select.Item label="General" value="general" />
                  <Select.Item label="Help" value="help" />
                  <Select.Item label="Announcement" value="announcement" />
                  <Select.Item label="Event" value="event" />
                  <Select.Item label="Business" value="business" />
                </Select>
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Content</Text>
                </FormControl.Label>
                <Input
                  value={postForm.content}
                  onChangeText={(text) => setPostForm(prev => ({ ...prev, content: text }))}
                  placeholder="Share something with your community..."
                  size="lg"
                  borderRadius={12}
                  multiline
                  numberOfLines={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space={3}>
              <Button variant="ghost" onPress={onCreatePostClose}>
                Cancel
              </Button>
              <Button
                onPress={handleCreatePost}
                bg={colors.primary[500]}
                _pressed={{ bg: colors.primary[600] }}
              >
                Post
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default NeighborsScreen; 
