import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Icon,
  Pressable,
  useColorModeValue,
  Avatar,
  Badge,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Button,
  ScrollView,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import IconIon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { useDisclosure } from '../../hooks/useDisclosure';

const { width } = Dimensions.get('window');

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  isOnline: boolean;
  isCircle: boolean;
  lastSeen?: string;
}

interface CallHistory {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  date: string;
  isVideo: boolean;
}

interface CallApplicationScreenProps {
  route?: any;
}

const CallApplicationScreen: React.FC<CallApplicationScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'recent' | 'contacts' | 'favorites'>('recent');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[900]);
  const cardBgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  useEffect(() => {
    loadContacts();
    loadCallHistory();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    // Mock data - replace with actual API call
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'Mom',
        avatar: 'https://picsum.photos/200/200?random=1',
        phone: '+1 (555) 123-4567',
        isOnline: true,
        isCircle: true,
        lastSeen: '2 minutes ago',
      },
      {
        id: '2',
        name: 'Dad',
        avatar: 'https://picsum.photos/200/200?random=2',
        phone: '+1 (555) 234-5678',
        isOnline: false,
        isCircle: true,
        lastSeen: '1 hour ago',
      },
      {
        id: '3',
        name: 'Sister',
        avatar: 'https://picsum.photos/200/200?random=3',
        phone: '+1 (555) 345-6789',
        isOnline: true,
        isCircle: true,
        lastSeen: 'Online',
      },
      {
        id: '4',
        name: 'Brother',
        avatar: 'https://picsum.photos/200/200?random=4',
        phone: '+1 (555) 456-7890',
        isOnline: false,
        isCircle: true,
        lastSeen: '3 hours ago',
      },
      {
        id: '5',
        name: 'Grandma',
        avatar: 'https://picsum.photos/200/200?random=5',
        phone: '+1 (555) 567-8901',
        isOnline: true,
        isCircle: true,
        lastSeen: 'Online',
      },
      {
        id: '6',
        name: 'Uncle John',
        avatar: 'https://picsum.photos/200/200?random=6',
        phone: '+1 (555) 678-9012',
        isOnline: false,
        isCircle: true,
        lastSeen: 'Yesterday',
      },
    ];
    setContacts(mockContacts);
    setIsLoading(false);
  };

  const loadCallHistory = async () => {
    // Mock data - replace with actual API call
    const mockCallHistory: CallHistory[] = [
      {
        id: '1',
        contactId: '1',
        contactName: 'Mom',
        contactAvatar: 'https://picsum.photos/200/200?random=1',
        type: 'outgoing',
        duration: '5:23',
        date: '2024-01-15 14:30',
        isVideo: false,
      },
      {
        id: '2',
        contactId: '3',
        contactName: 'Sister',
        contactAvatar: 'https://picsum.photos/200/200?random=3',
        type: 'incoming',
        duration: '12:45',
        date: '2024-01-15 10:15',
        isVideo: true,
      },
      {
        id: '3',
        contactId: '2',
        contactName: 'Dad',
        contactAvatar: 'https://picsum.photos/200/200?random=2',
        type: 'missed',
        duration: '--',
        date: '2024-01-14 16:20',
        isVideo: false,
      },
      {
        id: '4',
        contactId: '5',
        contactName: 'Grandma',
        contactAvatar: 'https://picsum.photos/200/200?random=5',
        type: 'outgoing',
        duration: '8:12',
        date: '2024-01-14 09:45',
        isVideo: false,
      },
      {
        id: '5',
        contactId: '4',
        contactName: 'Brother',
        contactAvatar: 'https://picsum.photos/200/200?random=4',
        type: 'incoming',
        duration: '3:28',
        date: '2024-01-13 20:10',
        isVideo: true,
      },
    ];
    setCallHistory(mockCallHistory);
  };

  const handleContactPress = (contact: Contact) => {
    setSelectedContact(contact);
    onOpen();
  };

  const handleCallPress = (contact: Contact, isVideo: boolean = false) => {
    // Navigate to call screen
    navigation.navigate(isVideo ? 'VideoCall' : 'VoiceCall', {
      contactId: contact.id,
      contactName: contact.name,
      contactAvatar: contact.avatar,
    });
  };

  const handleCallHistoryPress = (call: CallHistory) => {
    const contact = contacts.find(c => c.id === call.contactId);
    if (contact) {
      handleCallPress(contact, call.isVideo);
    }
  };

  const getFilteredContacts = () => {
    if (!searchQuery) return contacts;
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
    );
  };

  const getFilteredCallHistory = () => {
    if (!searchQuery) return callHistory;
    return callHistory.filter(call =>
      call.contactName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <Pressable onPress={() => handleContactPress(item)}>
      <Box
        bg={cardBgColor}
        p={4}
        mb={2}
        borderRadius="lg"
        borderWidth={1}
        borderColor={colors.gray[200]}
      >
        <HStack space={3} alignItems="center">
          <Box position="relative">
            <Avatar
              size="md"
              source={{ uri: item.avatar }}
              bg={colors.primary[500]}
            >
              {item.name.charAt(0).toUpperCase()}
            </Avatar>
            {item.isOnline && (
              <Box
                position="absolute"
                bottom={0}
                right={0}
                w={3}
                h={3}
                borderRadius="full"
                bg={colors.green[500]}
                borderWidth={2}
                borderColor={colors.white[500]}
              />
            )}
          </Box>
          
          <VStack flex={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {item.name}
              </Text>
              {item.isCircle && (
                <Badge colorScheme="primary" variant="subtle" size="sm">
                  Circle
                </Badge>
              )}
            </HStack>
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {item.phone}
            </Text>
            <Text style={textStyles.caption} color={colors.gray[500]}>
              {item.isOnline ? 'Online' : `Last seen ${item.lastSeen}`}
            </Text>
          </VStack>

          <VStack space={2}>
            <IconButton
              icon={<Icon as={IconIon} name="call" />}
              variant="ghost"
              colorScheme="primary"
              size="sm"
              onPress={() => handleCallPress(item, false)}
            />
            <IconButton
              icon={<Icon as={IconIon} name="videocam" />}
              variant="ghost"
              colorScheme="primary"
              size="sm"
              onPress={() => handleCallPress(item, true)}
            />
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  const renderCallHistory = ({ item }: { item: CallHistory }) => (
    <Pressable onPress={() => handleCallHistoryPress(item)}>
      <Box
        bg={cardBgColor}
        p={4}
        mb={2}
        borderRadius="lg"
        borderWidth={1}
        borderColor={colors.gray[200]}
      >
        <HStack space={3} alignItems="center">
          <Avatar
            size="md"
            source={{ uri: item.contactAvatar }}
            bg={colors.primary[500]}
          >
            {item.contactName.charAt(0).toUpperCase()}
          </Avatar>
          
          <VStack flex={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {item.contactName}
              </Text>
              <HStack space={2} alignItems="center">
                <Icon
                  as={item.isVideo ? IconIon : IconIon}
                  name={item.isVideo ? 'videocam' : 'call'}
                  size="sm"
                  color={colors.gray[500]}
                />
                <Icon
                  as={IconIon}
                  name={
                    item.type === 'incoming' ? 'call-received' :
                    item.type === 'outgoing' ? 'call-made' : 'call-missed'
                  }
                  size="sm"
                  color={
                    item.type === 'missed' ? colors.red[500] :
                    item.type === 'incoming' ? colors.green[500] : colors.blue[500]
                  }
                />
              </HStack>
            </HStack>
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {item.duration} • {new Date(item.date).toLocaleDateString()}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  const renderFavorites = () => {
    const favorites = contacts.filter(contact => contact.isCircle);
    return (
      <VStack space={4}>
        <Text style={textStyles.h3} color={textColor} fontWeight="600">
          Quick Call
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={4} px={4}>
            {favorites.map((contact) => (
              <VStack key={contact.id} alignItems="center" space={2}>
                <Pressable onPress={() => handleCallPress(contact, false)}>
                  <Box
                    w={16}
                    h={16}
                    bg={colors.primary[500]}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                    shadow={2}
                  >
                    <Icon as={IconIon} name="call" size={6} color={colors.white[500]} />
                  </Box>
                </Pressable>
                <Text style={textStyles.caption} color={textColor} textAlign="center">
                  {contact.name}
                </Text>
              </VStack>
            ))}
          </HStack>
        </ScrollView>
      </VStack>
    );
  };

  return (
    <Box flex={1} bg={bgColor} safeArea>
      {/* Header */}
      <Box bg={colors.primary[500]} px={4} py={6}>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text style={textStyles.h2} color={colors.white[500]} fontWeight="600">
              Calls
            </Text>
            <Text style={textStyles.caption} color={colors.white[400]}>
              Circle communication
            </Text>
          </VStack>
          <IconButton
            icon={<Icon as={IconIon} name="add" />}
            variant="ghost"
            colorScheme="white"
            onPress={() => navigation.navigate('AddContact')}
          />
        </HStack>
      </Box>

      {/* Search Bar */}
      <Box px={4} py={4}>
        <Input
          placeholder="Search contacts or calls..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          bg={cardBgColor}
          borderWidth={1}
          borderColor={colors.gray[200]}
          borderRadius="lg"
          InputLeftElement={
            <Icon as={IconIon} name="search" size={5} color={colors.gray[500]} ml={3} />
          }
        />
      </Box>

      {/* Tab Navigation */}
      <Box px={4} mb={4}>
        <HStack space={2} bg={colors.gray[100]} p={1} borderRadius="lg">
          {[
            { key: 'recent', label: 'Recent', icon: 'time' },
            { key: 'contacts', label: 'Contacts', icon: 'people' },
            { key: 'favorites', label: 'Favorites', icon: 'star' },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              flex={1}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Box
                bg={activeTab === tab.key ? colors.primary[500] : 'transparent'}
                py={2}
                px={3}
                borderRadius="md"
                alignItems="center"
              >
                <HStack space={1} alignItems="center">
                  <Icon
                    as={IconIon}
                    name={tab.icon}
                    size="sm"
                    color={activeTab === tab.key ? colors.white[500] : colors.gray[600]}
                  />
                  <Text
                    style={textStyles.caption}
                    color={activeTab === tab.key ? colors.white[500] : colors.gray[600]}
                    fontWeight={activeTab === tab.key ? '600' : '400'}
                  >
                    {tab.label}
                  </Text>
                </HStack>
              </Box>
            </Pressable>
          ))}
        </HStack>
      </Box>

      {/* Content */}
      <Box flex={1} px={4}>
        {isLoading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Spinner size="lg" color={colors.primary[500]} />
          </Box>
        ) : (
          <>
            {activeTab === 'recent' && (
              <FlatList
                data={getFilteredCallHistory()}
                renderItem={renderCallHistory}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Box py={8} alignItems="center">
                    <Icon as={IconIon} name="call" size={12} color={colors.gray[400]} />
                    <Text style={textStyles.h4} color={colors.gray[500]} mt={2}>
                      No recent calls
                    </Text>
                  </Box>
                }
              />
            )}

            {activeTab === 'contacts' && (
              <FlatList
                data={getFilteredContacts()}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Box py={8} alignItems="center">
                    <Icon as={IconIon} name="people" size={12} color={colors.gray[400]} />
                    <Text style={textStyles.h4} color={colors.gray[500]} mt={2}>
                      No contacts found
                    </Text>
                  </Box>
                }
              />
            )}

            {activeTab === 'favorites' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {renderFavorites()}
                <Box mt={6}>
                  <Text style={textStyles.h3} color={textColor} fontWeight="600" mb={4}>
                    Circle Members
                  </Text>
                  <FlatList
                    data={getFilteredContacts().filter(c => c.isCircle)}
                    renderItem={renderContact}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </Box>
              </ScrollView>
            )}
          </>
        )}
      </Box>

      {/* Contact Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack space={3} alignItems="center">
              <Avatar
                size="md"
                source={{ uri: selectedContact?.avatar }}
                bg={colors.primary[500]}
              >
                {selectedContact?.name.charAt(0).toUpperCase()}
              </Avatar>
              <VStack>
                <Text style={textStyles.h3} color={textColor}>
                  {selectedContact?.name}
                </Text>
                <Text style={textStyles.caption} color={colors.gray[600]}>
                  {selectedContact?.phone}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <TouchableOpacity onPress={() => {
                onClose();
                if (selectedContact) handleCallPress(selectedContact, false);
              }}>
                <HStack space={3} alignItems="center">
                  <Box
                    w={12}
                    h={12}
                    bg={colors.green[100]}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon as={IconIon} name="call" size={6} color={colors.green[500]} />
                  </Box>
                  <VStack flex={1}>
                    <Text style={textStyles.h4} color={textColor} fontWeight="500">
                      Voice Call
                    </Text>
                    <Text style={textStyles.caption} color={colors.gray[600]}>
                      Make a voice call
                    </Text>
                  </VStack>
                </HStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
                onClose();
                if (selectedContact) handleCallPress(selectedContact, true);
              }}>
                <HStack space={3} alignItems="center">
                  <Box
                    w={12}
                    h={12}
                    bg={colors.blue[100]}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon as={IconIon} name="videocam" size={6} color={colors.blue[500]} />
                  </Box>
                  <VStack flex={1}>
                    <Text style={textStyles.h4} color={textColor} fontWeight="500">
                      Video Call
                    </Text>
                    <Text style={textStyles.caption} color={colors.gray[600]}>
                      Start a video call
                    </Text>
                  </VStack>
                </HStack>
              </TouchableOpacity>

              <TouchableOpacity>
                <HStack space={3} alignItems="center">
                  <Box
                    w={12}
                    h={12}
                    bg={colors.gray[100]}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon as={IconIon} name="chatbubble" size={6} color={colors.gray[500]} />
                  </Box>
                  <VStack flex={1}>
                    <Text style={textStyles.h4} color={textColor} fontWeight="500">
                      Send Message
                    </Text>
                    <Text style={textStyles.caption} color={colors.gray[600]}>
                      Open chat conversation
                    </Text>
                  </VStack>
                </HStack>
              </TouchableOpacity>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CallApplicationScreen; 
