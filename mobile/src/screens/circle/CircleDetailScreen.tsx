import React, { useState } from 'react';
import { Alert, View, Text as RNText, ScrollView, Image } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Pressable,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Avatar,
  Badge,
  Divider,
  useDisclosure,
} from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { StorageApp } from '../../components/apps/StorageApp';
import { CalendarApp } from '../../components/apps/CalendarApp';

// Mockup Circle data
const mockCircle = {
  id: 'Circle-1',
  name: 'The Johnson Circle',
  description: 'A loving Circle of 5 members',
  createdAt: new Date('2015-03-15'), // 9 years ago
  photo: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Circle',
  members: [
    {
      id: '1',
      name: 'John Johnson',
      role: 'Father',
      age: 45,
      avatar: 'https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=JJ',
      email: 'john@example.com',
      phone: '+1-555-0123',
      isAdmin: true,
      joinedAt: new Date('2015-03-15'),
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Mother',
      age: 42,
      avatar: 'https://via.placeholder.com/100x100/45B7D1/FFFFFF?text=SJ',
      email: 'sarah@example.com',
      phone: '+1-555-0124',
      isAdmin: true,
      joinedAt: new Date('2015-03-15'),
    },
    {
      id: '3',
      name: 'Emma Johnson',
      role: 'Daughter',
      age: 18,
      avatar: 'https://via.placeholder.com/100x100/96CEB4/FFFFFF?text=EJ',
      email: 'emma@example.com',
      phone: '+1-555-0125',
      isAdmin: false,
      joinedAt: new Date('2015-03-15'),
    },
    {
      id: '4',
      name: 'Michael Johnson',
      role: 'Son',
      age: 15,
      avatar: 'https://via.placeholder.com/100x100/FFEAA7/FFFFFF?text=MJ',
      email: 'michael@example.com',
      phone: '+1-555-0126',
      isAdmin: false,
      joinedAt: new Date('2015-03-15'),
    },
    {
      id: '5',
      name: 'Grandma Rose',
      role: 'Grandmother',
      age: 68,
      avatar: 'https://via.placeholder.com/100x100/DDA0DD/FFFFFF?text=GR',
      email: 'rose@example.com',
      phone: '+1-555-0127',
      isAdmin: false,
      joinedAt: new Date('2016-06-10'),
    },
  ],
  stats: {
    totalMembers: 5,
    activeMembers: 5,
    yearsTogether: 9,
    eventsThisMonth: 3,
    photosShared: 156,
  },
};

const CircleDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState<'details' | 'members' | 'chart' | 'storage' | 'calendar' | 'notes'>('details');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
  const { isOpen: isMemberOpen, onOpen: onMemberOpen, onClose: onMemberClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[900]);
  const cardBgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  const calculateYearsTogether = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - mockCircle.createdAt.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  };

  const handleInviteMember = () => {
    if (!inviteEmail || !inviteName || !inviteRole) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    Alert.alert(
      'Invite Sent',
      `Invitation sent to ${inviteName} (${inviteEmail})`,
      [{ text: 'OK', onPress: () => onInviteClose() }]
    );
    
    setInviteEmail('');
    setInviteName('');
    setInviteRole('');
  };

  const handleRemoveMember = (member: any) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from the Circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Member Removed', `${member.name} has been removed from the Circle`);
            onMemberClose();
          }
        },
      ]
    );
  };

  const handleMemberPress = (member: any) => {
    setSelectedMember(member);
    onMemberOpen();
  };

  const renderCircleChart = () => {
    return (
      <Box bg={cardBgColor} borderRadius="lg" p={4} shadow={2}>
        <Text style={textStyles.h3} color={textColor} mb={4}>
          Circle Tree
        </Text>
        <VStack space={4}>
          {/* Grandparents */}
          <HStack justifyContent="center" space={4}>
            <Box bg={colors.gray[100]} p={3} borderRadius="md" alignItems="center">
              <Text style={textStyles.caption} color="gray.600">Grandpa Tom</Text>
              <Text style={textStyles.caption} color="gray.500">75 years</Text>
            </Box>
            <Box bg={colors.gray[100]} p={3} borderRadius="md" alignItems="center">
              <Text style={textStyles.caption} color="gray.600">Grandma Rose</Text>
              <Text style={textStyles.caption} color="gray.500">68 years</Text>
            </Box>
          </HStack>
          
          {/* Parents */}
          <HStack justifyContent="center" space={4}>
            <Box bg={colors.blue[100]} p={3} borderRadius="md" alignItems="center">
              <Text style={textStyles.caption} color="blue.700">John Johnson</Text>
              <Text style={textStyles.caption} color="blue.600">Father, 45 years</Text>
            </Box>
            <Box bg={colors.pink[100]} p={3} borderRadius="md" alignItems="center">
              <Text style={textStyles.caption} color="pink.700">Sarah Johnson</Text>
              <Text style={textStyles.caption} color="pink.600">Mother, 42 years</Text>
            </Box>
          </HStack>
          
          {/* Children */}
          <HStack justifyContent="center" space={4}>
            <Box bg={colors.green[100]} p={3} borderRadius="md" alignItems="center">
              <Text style={textStyles.caption} color="green.700">Emma Johnson</Text>
              <Text style={textStyles.caption} color="green.600">Daughter, 18 years</Text>
            </Box>
            <Box bg={colors.orange[100]} p={3} borderRadius="md" alignItems="center">
              <Text style={textStyles.caption} color="orange.700">Michael Johnson</Text>
              <Text style={textStyles.caption} color="orange.600">Son, 15 years</Text>
            </Box>
          </HStack>
        </VStack>
      </Box>
    );
  };

  return (
    <Box flex={1} bg={bgColor} safeArea>
      {/* Header */}
      <Box bg={cardBgColor} px={4} py={3} shadow={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Pressable onPress={() => navigation.goBack()}>
            <Icon as={IconMC} name="arrow-left" size="md" color={textColor} />
          </Pressable>
          <Text style={textStyles.h2} color={textColor}>
            Circle Details
          </Text>
          <HStack space={4} alignItems="center">
            <Pressable onPress={() => navigation.navigate('CircleSettings')}>
              <Icon as={IconMC} name="pencil" size="md" color={textColor} />
            </Pressable>
            <Pressable onPress={onInviteOpen}>
              <Icon as={IconMC} name="account-plus" size="md" color={textColor} />
            </Pressable>
          </HStack>
        </HStack>
      </Box>

      {/* Tab Navigation */}
      <Box bg={cardBgColor} px={4} py={2}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={4} minW="100%">
            <Pressable
              minW={80}
              py={2}
              borderBottomWidth={2}
              borderBottomColor={activeTab === 'details' ? 'blue.500' : 'transparent'}
              onPress={() => setActiveTab('details')}
            >
              <Text
                textAlign="center"
                color={activeTab === 'details' ? 'blue.500' : textColor}
                fontWeight={activeTab === 'details' ? 'bold' : 'normal'}
              >
                Details
              </Text>
            </Pressable>
            <Pressable
              minW={100}
              py={2}
              borderBottomWidth={2}
              borderBottomColor={activeTab === 'members' ? 'blue.500' : 'transparent'}
              onPress={() => setActiveTab('members')}
            >
              <Text
                textAlign="center"
                color={activeTab === 'members' ? 'blue.500' : textColor}
                fontWeight={activeTab === 'members' ? 'bold' : 'normal'}
              >
                Members ({mockCircle.members.length})
              </Text>
            </Pressable>
            <Pressable
              minW={80}
              py={2}
              borderBottomWidth={2}
              borderBottomColor={activeTab === 'chart' ? 'blue.500' : 'transparent'}
              onPress={() => setActiveTab('chart')}
            >
              <Text
                textAlign="center"
                color={activeTab === 'chart' ? 'blue.500' : textColor}
                fontWeight={activeTab === 'chart' ? 'bold' : 'normal'}
              >
                Chart
              </Text>
            </Pressable>
            <Pressable
              minW={80}
              py={2}
              borderBottomWidth={2}
              borderBottomColor={activeTab === 'storage' ? 'blue.500' : 'transparent'}
              onPress={() => setActiveTab('storage')}
            >
              <Text
                textAlign="center"
                color={activeTab === 'storage' ? 'blue.500' : textColor}
                fontWeight={activeTab === 'storage' ? 'bold' : 'normal'}
              >
                Storage
              </Text>
            </Pressable>
            <Pressable
              minW={80}
              py={2}
              borderBottomWidth={2}
              borderBottomColor={activeTab === 'calendar' ? 'blue.500' : 'transparent'}
              onPress={() => setActiveTab('calendar')}
            >
              <Text
                textAlign="center"
                color={activeTab === 'calendar' ? 'blue.500' : textColor}
                fontWeight={activeTab === 'calendar' ? 'bold' : 'normal'}
              >
                Calendar
              </Text>
            </Pressable>
            <Pressable
              minW={80}
              py={2}
              borderBottomWidth={2}
              borderBottomColor={activeTab === 'notes' ? 'blue.500' : 'transparent'}
              onPress={() => setActiveTab('notes')}
            >
              <Text
                textAlign="center"
                color={activeTab === 'notes' ? 'blue.500' : textColor}
                fontWeight={activeTab === 'notes' ? 'bold' : 'normal'}
              >
                Notes
              </Text>
            </Pressable>
          </HStack>
        </ScrollView>
      </Box>

      {/* Content */}
      <ScrollView flex={1} px={4} py={2}>
        {activeTab === 'details' && (
          <VStack space={4}>
            {/* Circle Info */}
            <Box bg={cardBgColor} borderRadius="lg" p={4} shadow={2}>
              <HStack space={4} alignItems="center">
                <Image
                  source={{ uri: mockCircle.photo }}
                  alt={mockCircle.name}
                  width={80}
                  height={80}
                  borderRadius="full"
                  resizeMode="cover"
                />
                <VStack flex={1}>
                  <Text style={textStyles.h3} color={textColor}>
                    {mockCircle.name}
                  </Text>
                  <Text style={textStyles.body1} color="gray.500">
                    {mockCircle.description}
                  </Text>
                  <HStack space={2} mt={2}>
                    <Badge colorScheme="blue" variant="subtle">
                      {mockCircle.stats.yearsTogether} years together
                    </Badge>
                    <Badge colorScheme="green" variant="subtle">
                      {mockCircle.stats.totalMembers} members
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
            </Box>

            {/* Stats */}
            <Box bg={cardBgColor} borderRadius="lg" p={4} shadow={2}>
              <Text style={textStyles.h4} color={textColor} mb={3}>
                Circle Statistics
              </Text>
              <VStack space={3}>
                <HStack justifyContent="space-between">
                  <Text style={textStyles.body1} color="gray.600">Years Together</Text>
                  <Text style={textStyles.body1} color={textColor} fontWeight="bold">
                    {calculateYearsTogether()} years
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text style={textStyles.body1} color="gray.600">Total Members</Text>
                  <Text style={textStyles.body1} color={textColor} fontWeight="bold">
                    {mockCircle.stats.totalMembers}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text style={textStyles.body1} color="gray.600">Active Members</Text>
                  <Text style={textStyles.body1} color={textColor} fontWeight="bold">
                    {mockCircle.stats.activeMembers}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text style={textStyles.body1} color="gray.600">Events This Month</Text>
                  <Text style={textStyles.body1} color={textColor} fontWeight="bold">
                    {mockCircle.stats.eventsThisMonth}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text style={textStyles.body1} color="gray.600">Photos Shared</Text>
                  <Text style={textStyles.body1} color={textColor} fontWeight="bold">
                    {mockCircle.stats.photosShared}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Circle Created */}
            <Box bg={cardBgColor} borderRadius="lg" p={4} shadow={2}>
              <Text style={textStyles.h4} color={textColor} mb={2}>
                Circle Created
              </Text>
              <Text style={textStyles.body} color="gray.600">
                {mockCircle.createdAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </Box>
          </VStack>
        )}

        {activeTab === 'members' && (
          <VStack space={3}>
            {mockCircle.members.map((member) => (
              <Pressable key={member.id} onPress={() => handleMemberPress(member)}>
                <Box bg={cardBgColor} borderRadius="lg" p={4} shadow={2}>
                  <HStack space={3} alignItems="center">
                    <Avatar
                      source={{ uri: member.avatar }}
                      size="md"
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <VStack flex={1}>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text style={textStyles.h4} color={textColor}>
                          {member.name}
                        </Text>
                        {member.isAdmin && (
                          <Badge colorScheme="blue" variant="subtle" size="sm">
                            Admin
                          </Badge>
                        )}
                      </HStack>
                      <Text style={textStyles.body1} color="gray.500">
                        {member.role} • {member.age} years old
                      </Text>
                      <Text style={textStyles.caption} color="gray.400">
                        Joined {member.joinedAt.toLocaleDateString()}
                      </Text>
                    </VStack>
                    <Icon as={IconMC} name="chevron-right" size="sm" color="gray.400" />
                  </HStack>
                </Box>
              </Pressable>
            ))}
          </VStack>
        )}

        {activeTab === 'chart' && (
          <VStack space={4}>
            {renderCircleChart()}
          </VStack>
        )}

        {activeTab === 'storage' && (
          <VStack space={4}>
            <StorageApp 
              circleId={mockCircle.id}
              onFilePress={(file) => {
                Alert.alert('File Selected', `Selected file: ${file.name}`);
              }}
              onFolderPress={(folder) => {
                Alert.alert('Folder Selected', `Selected folder: ${folder.name}`);
              }}
            />
          </VStack>
        )}

        {activeTab === 'calendar' && (
          <VStack space={4}>
            <CalendarApp 
              circleId={mockCircle.id}
              onEventPress={(event) => {
                Alert.alert('Event Selected', `Selected event: ${event.title}`);
              }}
              onDatePress={(date) => {
                Alert.alert('Date Selected', `Selected date: ${date.toLocaleDateString()}`);
              }}
            />
          </VStack>
        )}

        {activeTab === 'notes' && (
          <VStack space={4}>
            <Box bg={cardBgColor} borderRadius="lg" p={4} shadow={2}>
              <HStack justifyContent="space-between" alignItems="center" mb={4}>
                <Text style={textStyles.h4} color={textColor}>
                  Circle Notes
                </Text>
                <Button size="sm" colorScheme="blue" onPress={() => Alert.alert('Add Note', 'Add note functionality will be implemented')}>
                  <Icon as={IconMC} name="plus" size="sm" color="white" mr={1} />
                  Add Note
                </Button>
              </HStack>
              
              <VStack space={3}>
                <Box bg={colors.gray[50]} p={3} borderRadius="md">
                  <Text style={textStyles.body} color={textColor} fontWeight="bold" mb={1}>
                    Circle Meeting Notes
                  </Text>
                  <Text style={textStyles.caption} color="gray.500" mb={2}>
                    Last updated: {new Date().toLocaleDateString()}
                  </Text>
                  <Text style={textStyles.body1} color="gray.600">
                    Discussed upcoming vacation plans and budget allocation for the summer trip.
                  </Text>
                </Box>
                
                <Box bg={colors.gray[50]} p={3} borderRadius="md">
                  <Text style={textStyles.body} color={textColor} fontWeight="bold" mb={1}>
                    Important Reminders
                  </Text>
                  <Text style={textStyles.caption} color="gray.500" mb={2}>
                    Last updated: {new Date(Date.now() - 86400000).toLocaleDateString()}
                  </Text>
                  <Text style={textStyles.body1} color="gray.600">
                    • Emma's graduation ceremony next month
                    • Michael's soccer tournament this weekend
                    • Circle photo session scheduled
                  </Text>
                </Box>
                
                <Box bg={colors.gray[50]} p={3} borderRadius="md">
                  <Text style={textStyles.body} color={textColor} fontWeight="bold" mb={1}>
                    Shopping List
                  </Text>
                  <Text style={textStyles.caption} color="gray.500" mb={2}>
                    Last updated: {new Date(Date.now() - 172800000).toLocaleDateString()}
                  </Text>
                  <Text style={textStyles.body1} color="gray.600">
                    • Groceries for the week
                    • School supplies for Michael
                    • Birthday gift for Grandma Rose
                  </Text>
                </Box>
              </VStack>
            </Box>
          </VStack>
        )}
      </ScrollView>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteOpen} onClose={onInviteClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite New Member</ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <Input
                placeholder="Full Name"
                value={inviteName}
                onChangeText={setInviteName}
                bg={bgColor}
              />
              <Input
                placeholder="Email Address"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                bg={bgColor}
                keyboardType="email-address"
              />
              <Input
                placeholder="Role (e.g., Son, Daughter, Friend)"
                value={inviteRole}
                onChangeText={setInviteRole}
                bg={bgColor}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onInviteClose}>
              Cancel
            </Button>
            <Button onPress={handleInviteMember} ml={3}>
              Send Invite
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Member Detail Modal */}
      <Modal isOpen={isMemberOpen} onClose={onMemberClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Member Details</ModalHeader>
          <ModalBody>
            {selectedMember && (
              <VStack space={4}>
                <HStack space={3} alignItems="center">
                  <Avatar
                    source={{ uri: selectedMember.avatar }}
                    size="lg"
                  >
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <VStack flex={1}>
                    <Text style={textStyles.h4} color={textColor}>
                      {selectedMember.name}
                    </Text>
                    <Text style={textStyles.body1} color="gray.500">
                      {selectedMember.role} • {selectedMember.age} years old
                    </Text>
                    {selectedMember.isAdmin && (
                      <Badge colorScheme="blue" variant="subtle" mt={1}>
                        Circle Admin
                      </Badge>
                    )}
                  </VStack>
                </HStack>
                
                <Divider />
                
                <VStack space={3}>
                  <HStack justifyContent="space-between">
                    <Text style={textStyles.body1} color="gray.600">Email</Text>
                    <Text style={textStyles.body} color={textColor}>
                      {selectedMember.email}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text style={textStyles.body1} color="gray.600">Phone</Text>
                    <Text style={textStyles.body} color={textColor}>
                      {selectedMember.phone}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text style={textStyles.body1} color="gray.600">Joined</Text>
                    <Text style={textStyles.body} color={textColor}>
                      {selectedMember.joinedAt.toLocaleDateString()}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onMemberClose}>
              Close
            </Button>
            {selectedMember && !selectedMember.isAdmin && (
              <Button 
                variant="outline" 
                colorScheme="red" 
                onPress={() => handleRemoveMember(selectedMember)}
                ml={3}
              >
                Remove Member
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CircleDetailScreen; 
