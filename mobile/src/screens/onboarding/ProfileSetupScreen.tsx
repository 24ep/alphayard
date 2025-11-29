import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  FormControl,
  Input,
  Button,
  Avatar,
  Icon,
  useToast,
  Select,
  CheckIcon,
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { validation } from '../../utils/validation';

interface ProfileSetupData {
  firstName: string;
  lastName: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  avatar?: string;
}

const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { updateUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<ProfileSetupData>({
    firstName: '',
    lastName: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
  });

  const [errors, setErrors] = useState<Partial<ProfileSetupData>>({});
  const [loading, setLoading] = useState(false);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileSetupData> = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAvatarUpload = () => {
    Alert.alert(
      'Avatar Upload',
      'Avatar upload functionality will be available soon!'
    );
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Update user profile
      // This would typically call an API to update the user profile
      toast.show({
        description: 'Profile updated successfully!',
        status: 'success',
      });

      // Navigate to main app
      navigation.navigate('MainApp' as never);
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('MainApp' as never);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Box flex={1} bg="white" px={6} py={8}>
          <VStack space={6} flex={1}>
            {/* Header */}
            <VStack space={2}>
              <Heading size="xl" color="gray.800">
                Complete Your Profile
              </Heading>
              <Text color="gray.600" fontSize="md">
                Help us personalize your experience
              </Text>
            </VStack>

            {/* Avatar Section */}
            <VStack space={4} alignItems="center">
              <Avatar
                size="2xl"
                bg="primary.500"
                source={formData.avatar ? { uri: formData.avatar } : undefined}
              >
                {!formData.avatar && (
                  <Icon
                    as={MaterialCommunityIcons}
                    name="account"
                    size="xl"
                    color="white"
                  />
                )}
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onPress={handleAvatarUpload}
                leftIcon={
                  <Icon
                    as={MaterialCommunityIcons}
                    name="camera"
                    size="sm"
                  />
                }
              >
                Upload Photo
              </Button>
            </VStack>

            {/* Profile Form */}
            <VStack space={4} flex={1}>
              {/* Name Fields */}
              <HStack space={3}>
                <FormControl flex={1} isInvalid={!!errors.firstName}>
                  <FormControl.Label>First Name</FormControl.Label>
                  <Input
                    size="lg"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  <FormControl.ErrorMessage>
                    {errors.firstName}
                  </FormControl.ErrorMessage>
                </FormControl>

                <FormControl flex={1} isInvalid={!!errors.lastName}>
                  <FormControl.Label>Last Name</FormControl.Label>
                  <Input
                    size="lg"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  <FormControl.ErrorMessage>
                    {errors.lastName}
                  </FormControl.ErrorMessage>
                </FormControl>
              </HStack>

              {/* Bio Field */}
              <FormControl>
                <FormControl.Label>Bio (Optional)</FormControl.Label>
                <Input
                  size="lg"
                  placeholder="Tell us about yourself"
                  value={formData.bio}
                  onChangeText={(value) => handleInputChange('bio', value)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </FormControl>

              {/* Date of Birth Field */}
              <FormControl isInvalid={!!errors.dateOfBirth}>
                <FormControl.Label>Date of Birth</FormControl.Label>
                <Input
                  size="lg"
                  placeholder="YYYY-MM-DD"
                  value={formData.dateOfBirth}
                  onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                  keyboardType="numeric"
                />
                <FormControl.ErrorMessage>
                  {errors.dateOfBirth}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Gender Field */}
              <FormControl isInvalid={!!errors.gender}>
                <FormControl.Label>Gender</FormControl.Label>
                <Select
                  size="lg"
                  placeholder="Select gender"
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  _selectedItem={{
                    bg: 'primary.100',
                    endIcon: <CheckIcon size="5" />,
                  }}
                >
                  {genderOptions.map((option) => (
                    <Select.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Select>
                <FormControl.ErrorMessage>
                  {errors.gender}
                </FormControl.ErrorMessage>
              </FormControl>
            </VStack>

            {/* Action Buttons */}
            <VStack space={4}>
              <Button
                size="lg"
                onPress={handleSaveProfile}
                isLoading={loading}
              >
                Complete Setup
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onPress={handleSkip}
              >
                Skip for Now
              </Button>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileSetupScreen; 