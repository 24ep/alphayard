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
  Button,
  Icon,
  Modal,
  FormControl,
  Input,
  Select,
  CheckIcon,
  useToast,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface AddItemData {
  type: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  location?: string;
  priority?: string;
}

const UniversalAddScreen: React.FC = () => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddItemData>({
    type: '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    priority: '',
  });

  const addOptions = [
    {
      id: 'event',
      title: 'hourse Event',
      description: 'Add a new hourse event or activity',
      icon: 'calendar-plus',
      color: '#4A90E2',
    },
    {
      id: 'task',
      title: 'hourse Task',
      description: 'Create a new task or chore',
      icon: 'checkbox-marked-circle-plus',
      color: '#7ED321',
    },
    {
      id: 'reminder',
      title: 'Reminder',
      description: 'Set a reminder for the hourse',
      icon: 'bell-plus',
      color: '#F5A623',
    },
    {
      id: 'note',
      title: 'hourse Note',
      description: 'Share a note with the hourse',
      icon: 'note-plus',
      color: '#9B59B6',
    },
    {
      id: 'expense',
      title: 'hourse Expense',
      description: 'Track a hourse expense',
      icon: 'cash-plus',
      color: '#E74C3C',
    },
    {
      id: 'photo',
      title: 'hourse Photo',
      description: 'Share a hourse photo',
      icon: 'camera-plus',
      color: '#1ABC9C',
    },
  ];

  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
  ];

  const handleAddItem = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
    setShowModal(true);
  };

  const handleInputChange = (field: keyof AddItemData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      // This would typically call an API to save the item
      console.log('Adding item:', formData);
      
      toast.show({
        description: `${formData.type} added successfully!`,
        status: 'success',
      });

      // Reset form and close modal
      setFormData({
        type: '',
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        priority: '',
      });
      setShowModal(false);
    } catch (error) {
      console.error('Add item error:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: '',
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      priority: '',
    });
    setShowModal(false);
  };

  const renderAddOption = (option: any) => (
    <Button
      key={option.id}
      variant="outline"
      size="lg"
      mb={4}
      onPress={() => handleAddItem(option.id)}
      leftIcon={
        <Icon
          as={MaterialCommunityIcons}
          name={option.icon as any}
          size="sm"
          color={option.color}
        />
      }
      _pressed={{ bg: 'gray.100' }}
    >
      <VStack alignItems="flex-start" flex={1}>
        <Text fontWeight="semibold" color="gray.800">
          {option.title}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {option.description}
        </Text>
      </VStack>
    </Button>
  );

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
          <VStack space={6}>
            {/* Header */}
            <VStack space={2}>
              <Heading size="xl" color="gray.800">
                Add New Item
              </Heading>
              <Text color="gray.600" fontSize="md">
                Choose what you'd like to add to your hourse
              </Text>
            </VStack>

            {/* Add Options */}
            <VStack space={4}>
              {addOptions.map(renderAddOption)}
            </VStack>
          </VStack>
        </Box>
      </ScrollView>

      {/* Add Item Modal */}
      <Modal isOpen={showModal} onClose={handleCancel} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>
            Add New {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
          </Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>Title</FormControl.Label>
                <Input
                  size="lg"
                  placeholder="Enter title"
                  value={formData.title}
                  onChangeText={(value) => handleInputChange('title', value)}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Description</FormControl.Label>
                <Input
                  size="lg"
                  placeholder="Enter description"
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </FormControl>

              <HStack space={3}>
                <FormControl flex={1}>
                  <FormControl.Label>Date</FormControl.Label>
                  <Input
                    size="lg"
                    placeholder="YYYY-MM-DD"
                    value={formData.date}
                    onChangeText={(value) => handleInputChange('date', value)}
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormControl.Label>Time</FormControl.Label>
                  <Input
                    size="lg"
                    placeholder="HH:MM"
                    value={formData.time}
                    onChangeText={(value) => handleInputChange('time', value)}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormControl.Label>Location</FormControl.Label>
                <Input
                  size="lg"
                  placeholder="Enter location"
                  value={formData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Priority</FormControl.Label>
                <Select
                  size="lg"
                  placeholder="Select priority"
                  selectedValue={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                  _selectedItem={{
                    bg: 'primary.100',
                    endIcon: <CheckIcon size="5" />,
                  }}
                >
                  {priorityOptions.map((option) => (
                    <Select.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={handleCancel}>
                Cancel
              </Button>
              <Button onPress={handleSubmit} isLoading={loading}>
                Add
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default UniversalAddScreen; 