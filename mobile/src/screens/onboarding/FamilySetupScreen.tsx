import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Icon,
  Pressable,
  useColorModeValue,
  FormControl,
  Textarea,
  Image,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../hooks/useFamily';

const FamilySetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { createFamily, joinFamily, isLoading } = useFamily();
  
  const [familyName, setFamilyName] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [setupMode, setSetupMode] = useState<'create' | 'join'>('create');
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[900]);
  const cardBgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  const familyAvatars = [
    '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👩‍👦', '👨‍👩‍👧',
    '👨‍👨‍👧‍👦', '👩‍👩‍👧‍👦', '👨‍👨‍👦‍👦', '👩‍👩‍👦‍👦', '👨‍👨‍👧‍👧',
    '👩‍👩‍👧‍👧', '👨‍👨‍👦', '👩‍👩‍👦', '👨‍👨‍👧', '👩‍👩‍👧',
  ];

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a hourse name');
      return;
    }

    try {
      await createFamily({
        name: familyName,
        description: familyDescription,
        avatar: selectedAvatar || familyAvatars[0],
      });
      
      navigation.navigate('ProfileSetup');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create hourse');
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      await joinFamily(inviteCode);
      navigation.navigate('ProfileSetup');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to join hourse');
    }
  };

  const handleSkip = () => {
    navigation.navigate('ProfileSetup');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Box flex={1} bg={bgColor} safeArea>
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack flex={1} px={6} py={8} space={8}>
            {/* Header */}
            <VStack space={4} alignItems="center">
              <Box
                w={100}
                h={100}
                bg={colors.primary[500]}
                borderRadius={50}
                justifyContent="center"
                alignItems="center"
                shadow={5}
              >
                <Icon
                  as={IconMC}
                  name="account-group"
                  size={50}
                  color={colors.white[500]}
                />
              </Box>
              
              <VStack space={2} alignItems="center">
                <Text style={textStyles.h1} color={colors.primary[500]} textAlign="center">
                  hourse Setup
                </Text>
                <Text style={textStyles.body} color={colors.gray[600]} textAlign="center">
                  Create a new hourse or join an existing one
                </Text>
              </VStack>
            </VStack>

            {/* Setup Mode Toggle */}
            <VStack space={4} bg={cardBgColor} p={6} borderRadius={20} shadow={3}>
              <Text style={textStyles.h3} color={textColor} textAlign="center">
                Choose Setup Option
              </Text>
              
              <HStack space={4}>
                <Pressable
                  flex={1}
                  onPress={() => setSetupMode('create')}
                  bg={setupMode === 'create' ? colors.primary[500] : colors.gray[200]}
                  p={4}
                  borderRadius={12}
                  alignItems="center"
                >
                  <Icon
                    as={IconMC}
                    name="plus-circle"
                    size={6}
                    color={setupMode === 'create' ? colors.white[500] : colors.gray[600]}
                    mb={2}
                  />
                  <Text
                    style={textStyles.h4}
                    color={setupMode === 'create' ? colors.white[500] : colors.gray[600]}
                    fontWeight="600"
                  >
                    Create hourse
                  </Text>
                </Pressable>

                <Pressable
                  flex={1}
                  onPress={() => setSetupMode('join')}
                  bg={setupMode === 'join' ? colors.primary[500] : colors.gray[200]}
                  p={4}
                  borderRadius={12}
                  alignItems="center"
                >
                  <Icon
                    as={IconMC}
                    name="account-plus"
                    size={6}
                    color={setupMode === 'join' ? colors.white[500] : colors.gray[600]}
                    mb={2}
                  />
                  <Text
                    style={textStyles.h4}
                    color={setupMode === 'join' ? colors.white[500] : colors.gray[600]}
                    fontWeight="600"
                  >
                    Join hourse
                  </Text>
                </Pressable>
              </HStack>
            </VStack>

            {/* Create hourse Form */}
            {setupMode === 'create' && (
              <VStack space={6} bg={cardBgColor} p={6} borderRadius={20} shadow={3}>
                <Text style={textStyles.h2} color={textColor} textAlign="center">
                  Create New hourse
                </Text>

                <FormControl>
                  <FormControl.Label>
                    <Text style={textStyles.h4} color={textColor}>hourse Name</Text>
                  </FormControl.Label>
                  <Input
                    value={familyName}
                    onChangeText={setFamilyName}
                    placeholder="Enter hourse name"
                    size="lg"
                    borderRadius={12}
                    borderColor={colors.gray[300]}
                    _focus={{
                      borderColor: colors.primary[500],
                      bg: colors.white[500],
                    }}
                    InputLeftElement={
                      <Icon
                        as={IconMC}
                        name="account-group"
                        size={5}
                        ml={3}
                        color={colors.gray[500]}
                      />
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormControl.Label>
                    <Text style={textStyles.h4} color={textColor}>Description (Optional)</Text>
                  </FormControl.Label>
                  <Textarea
                    value={familyDescription}
                    onChangeText={setFamilyDescription}
                    placeholder="Tell us about your hourse"
                    borderRadius={12}
                    borderColor={colors.gray[300]}
                    _focus={{
                      borderColor: colors.primary[500],
                      bg: colors.white[500],
                    }}
                    autoCompleteType={undefined}
                  />
                </FormControl>

                <FormControl>
                  <FormControl.Label>
                    <Text style={textStyles.h4} color={textColor}>hourse Avatar</Text>
                  </FormControl.Label>
                  <Pressable onPress={onOpen}>
                    <Box
                      bg={colors.gray[100]}
                      p={4}
                      borderRadius={12}
                      borderWidth={2}
                      borderColor={colors.gray[300]}
                      alignItems="center"
                    >
                      <Text fontSize={40} mb={2}>
                        {selectedAvatar || familyAvatars[0]}
                      </Text>
                      <Text style={textStyles.caption} color={colors.gray[600]}>
                        Tap to choose avatar
                      </Text>
                    </Box>
                  </Pressable>
                </FormControl>

                <Button
                  onPress={handleCreateFamily}
                  isLoading={isLoading}
                  bg={colors.primary[500]}
                  _pressed={{ bg: colors.primary[600] }}
                  size="lg"
                  borderRadius={12}
                  shadow={2}
                >
                  <Text style={textStyles.h4} color={colors.white[500]} fontWeight="600">
                    Create hourse
                  </Text>
                </Button>
              </VStack>
            )}

            {/* Join hourse Form */}
            {setupMode === 'join' && (
              <VStack space={6} bg={cardBgColor} p={6} borderRadius={20} shadow={3}>
                <Text style={textStyles.h2} color={textColor} textAlign="center">
                  Join Existing hourse
                </Text>

                <VStack space={4} alignItems="center">
                  <Icon
                    as={IconMC}
                    name="account-multiple-plus"
                    size={16}
                    color={colors.primary[500]}
                  />
                  
                  <Text style={textStyles.body} color={colors.gray[600]} textAlign="center">
                    Ask your hourse admin for the invite code to join their hourse
                  </Text>
                </VStack>

                <FormControl>
                  <FormControl.Label>
                    <Text style={textStyles.h4} color={textColor}>Invite Code</Text>
                  </FormControl.Label>
                  <Input
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    placeholder="Enter invite code"
                    size="lg"
                    borderRadius={12}
                    borderColor={colors.gray[300]}
                    _focus={{
                      borderColor: colors.primary[500],
                      bg: colors.white[500],
                    }}
                    InputLeftElement={
                      <Icon
                        as={IconMC}
                        name="key"
                        size={5}
                        ml={3}
                        color={colors.gray[500]}
                      />
                    }
                  />
                </FormControl>

                <Button
                  onPress={handleJoinFamily}
                  isLoading={isLoading}
                  bg={colors.primary[500]}
                  _pressed={{ bg: colors.primary[600] }}
                  size="lg"
                  borderRadius={12}
                  shadow={2}
                >
                  <Text style={textStyles.h4} color={colors.white[500]} fontWeight="600">
                    Join hourse
                  </Text>
                </Button>
              </VStack>
            )}

            {/* Skip Option */}
            <VStack space={4} alignItems="center">
              <Divider bg={colors.gray[300]} />
              
              <Text style={textStyles.body} color={colors.gray[600]} textAlign="center">
                You can set up your hourse later
              </Text>
              
              <Pressable onPress={handleSkip}>
                <Text
                  style={textStyles.body}
                  color={colors.primary[500]}
                  fontWeight="600"
                >
                  Skip for now
                </Text>
              </Pressable>
            </VStack>
          </VStack>
        </ScrollView>
      </Box>

      {/* Avatar Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text style={textStyles.h3} color={textColor}>
              Choose hourse Avatar
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <Text style={textStyles.body} color={colors.gray[600]}>
                Select an avatar that represents your hourse
              </Text>
              
              <Box flexDirection="row" flexWrap="wrap" justifyContent="center">
                {familyAvatars.map((avatar, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setSelectedAvatar(avatar);
                      onClose();
                    }}
                    m={1}
                  >
                    <Box
                      bg={selectedAvatar === avatar ? colors.primary[100] : colors.gray[100]}
                      p={3}
                      borderRadius={12}
                      borderWidth={2}
                      borderColor={selectedAvatar === avatar ? colors.primary[500] : colors.gray[300]}
                    >
                      <Text fontSize={24}>{avatar}</Text>
                    </Box>
                  </Pressable>
                ))}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default FamilySetupScreen; 