import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, HStack, VStack, Avatar, Icon, Badge, Input, IconButton } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { safetyService } from '../../services/safety/SafetyService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
  lastContacted?: number;
  avatar?: string;
  priority: 'high' | 'medium' | 'low';
  notificationPreference: 'call' | 'sms' | 'email' | 'all';
}

interface EmergencyContactsScreenProps {
  route?: {
    params?: {
      selectMode?: boolean;
      onSelect?: (contact: EmergencyContact) => void;
    };
  };
}

const EmergencyContactsScreen: React.FC<EmergencyContactsScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectMode, onSelect } = route?.params || {};

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      setLoading(true);
      const emergencyContacts = await safetyService.getEmergencyContacts();
      setContacts(emergencyContacts);
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
      Alert.alert('Error', 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEmergencyContacts();
    setRefreshing(false);
  };

  const handleContactPress = (contact: EmergencyContact) => {
    if (selectMode && onSelect) {
      onSelect(contact);
      navigation.goBack();
      return;
    }

    analyticsService.trackEvent('emergency_contact_pressed', {
      contactId: contact.id,
      contactName: contact.name,
    });
    
    navigation.navigate('ContactDetails', { contactId: contact.id });
  };

  const handleAddContact = () => {
    navigation.navigate('AddEmergencyContact');
  };

  const handleEditContact = (contact: EmergencyContact) => {
    navigation.navigate('EditEmergencyContact', { contactId: contact.id });
  };

  const handleDeleteContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await safetyService.deleteEmergencyContact(contact.id);
              await loadEmergencyContacts();
              
              analyticsService.trackEvent('emergency_contact_deleted', {
                contactId: contact.id,
                contactName: contact.name,
              });
            } catch (error) {
              console.error('Failed to delete contact:', error);
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  const handleTestContact = async (contact: EmergencyContact) => {
    try {
      await safetyService.testEmergencyContact(contact.id);
      Alert.alert('Test Message Sent', `Test message sent to ${contact.name}`);
      
      analyticsService.trackEvent('emergency_contact_tested', {
        contactId: contact.id,
        contactName: contact.name,
      });
    } catch (error) {
      console.error('Failed to test contact:', error);
      Alert.alert('Error', 'Failed to send test message');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getNotificationIcon = (preference: string) => {
    switch (preference) {
      case 'call':
        return 'phone';
      case 'sms':
        return 'message-text';
      case 'email':
        return 'email';
      case 'all':
        return 'bell';
      default:
        return 'bell';
    }
  };

  const formatPhone = (phone: string) => {
    // Simple phone formatting
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
    >
      <HStack space={3} alignItems="center" flex={1}>
        <Avatar
          size="md"
          source={{ uri: item.avatar }}
          bg="primary.500"
        >
          {item.name.charAt(0)}
        </Avatar>

        <VStack flex={1}>
          <HStack space={2} alignItems="center" marginBottom={2}>
            <Text style={styles.contactName}>{item.name}</Text>
            {item.isPrimary && (
              <Badge colorScheme="red" rounded="full" variant="solid">
                Primary
              </Badge>
            )}
            <Badge
              colorScheme={
                item.priority === 'high' ? 'red' :
                item.priority === 'medium' ? 'orange' : 'green'
              }
              rounded="full"
              variant="subtle"
            >
              {item.priority}
            </Badge>
          </HStack>

          <Text style={styles.contactPhone}>{formatPhone(item.phone)}</Text>
          <Text style={styles.contactRelationship}>{item.relationship}</Text>

          <HStack space={2} alignItems="center" marginTop={4}>
            <Icon
              as={MaterialCommunityIcons}
              name={getNotificationIcon(item.notificationPreference)}
              size="sm"
              color="gray.500"
            />
            <Text style={styles.notificationText}>
              {item.notificationPreference.toUpperCase()}
            </Text>
            {!item.isActive && (
              <Badge colorScheme="gray" rounded="full" variant="solid">
                Inactive
              </Badge>
            )}
          </HStack>
        </VStack>

        <VStack space={2}>
          <IconButton
            icon={<Icon as={MaterialCommunityIcons} name="phone" />}
            onPress={() => handleTestContact(item)}
            variant="ghost"
            colorScheme="primary"
            size="sm"
          />
          <IconButton
            icon={<Icon as={MaterialCommunityIcons} name="pencil" />}
            onPress={() => handleEditContact(item)}
            variant="ghost"
            colorScheme="primary"
            size="sm"
          />
          <IconButton
            icon={<Icon as={MaterialCommunityIcons} name="delete" />}
            onPress={() => handleDeleteContact(item)}
            variant="ghost"
            colorScheme="red"
            size="sm"
          />
        </VStack>
      </HStack>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Box style={styles.header}>
        <HStack space={3} alignItems="center" flex={1}>
          <Icon
            as={MaterialCommunityIcons}
            name="arrow-left"
            size="lg"
            color="primary.500"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>
            {selectMode ? 'Select Contact' : 'Emergency Contacts'}
          </Text>
        </HStack>
        {!selectMode && (
          <IconButton
            icon={<Icon as={MaterialCommunityIcons} name="plus" />}
            onPress={handleAddContact}
            variant="ghost"
            colorScheme="primary"
          />
        )}
      </Box>

      <Box style={styles.searchContainer}>
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={handleSearch}
          InputLeftElement={
            <Icon
              as={MaterialCommunityIcons}
              name="magnify"
              size="sm"
              color="gray.400"
              ml={2}
            />
          }
          InputRightElement={
            searchQuery ? (
              <IconButton
                icon={<Icon as={MaterialCommunityIcons} name="close" />}
                onPress={() => setSearchQuery('')}
                variant="ghost"
                size="sm"
              />
            ) : undefined
          }
          style={styles.searchInput}
        />
      </Box>

      {filteredContacts.length === 0 ? (
        <EmptyState
          icon="account-group-outline"
          title="No emergency contacts"
          subtitle="Add emergency contacts to ensure your hourse's safety"
          actionText="Add Contact"
          onAction={handleAddContact}
        />
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          style={styles.contactList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4A90E2']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {!selectMode && contacts.length > 0 && (
        <Box style={styles.footer}>
          <Text style={styles.footerText}>
            {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.footerSubtext}>
            {contacts.filter(c => c.isActive).length} active
          </Text>
        </Box>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  contactList: {
    flex: 1,
  },
  contactItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666666',
  },
  contactRelationship: {
    fontSize: 14,
    color: '#666666',
  },
  notificationText: {
    fontSize: 12,
    color: '#666666',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999999',
  },
});

export default EmergencyContactsScreen; 