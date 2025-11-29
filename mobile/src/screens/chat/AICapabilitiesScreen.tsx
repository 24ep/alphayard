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
import { Box, HStack, VStack, Icon, Badge, Accordion, Divider } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { aiAgentService, AIAgentCapability } from '../../services/ai/AIAgentService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface AICapabilitiesScreenProps {
  route?: {
    params?: {
      capabilities?: AIAgentCapability[];
    };
  };
}

const AICapabilitiesScreen: React.FC<AICapabilitiesScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [capabilities, setCapabilities] = useState<AIAgentCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);

  useEffect(() => {
    loadCapabilities();
  }, []);

  const loadCapabilities = async () => {
    try {
      setLoading(true);
      const caps = route?.params?.capabilities || await aiAgentService.getCapabilities();
      setCapabilities(caps);
    } catch (error) {
      console.error('Failed to load capabilities:', error);
      Alert.alert('Error', 'Failed to load AI capabilities');
    } finally {
      setLoading(false);
    }
  };

  const handleCapabilityPress = (capability: AIAgentCapability) => {
    setSelectedCapability(selectedCapability === capability.service ? null : capability.service);
    
    analyticsService.trackEvent('ai_capability_viewed', {
      capability: capability.service,
      methodsCount: capability.methods.length
    });
  };

  const handleExamplePress = (example: string) => {
    navigation.navigate('AIAgent', { initialMessage: example });
  };

  const handleTestCapability = (capability: AIAgentCapability) => {
    Alert.alert(
      'Test Capability',
      `Would you like to test the ${capability.service} capabilities?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: () => {
            navigation.navigate('AIAgent', { 
              initialMessage: capability.examples[0] 
            });
          }
        }
      ]
    );
  };

  const getCapabilityIcon = (service: string) => {
    const iconMap: { [key: string]: string } = {
      hourse: 'account-group',
      user: 'account',
      chat: 'chat',
      location: 'map-marker',
      safety: 'shield-check',
      notification: 'bell',
      storage: 'folder',
      health: 'heart-pulse',
      expenses: 'cash',
      shopping: 'cart',
      notes: 'note-text',
      games: 'gamepad-variant',
      weather: 'weather-partly-cloudy',
      news: 'newspaper',
      entertainment: 'movie'
    };
    return iconMap[service] || 'help-circle';
  };

  const getCapabilityColor = (service: string) => {
    const colorMap: { [key: string]: string } = {
      hourse: '#4CAF50',
      user: '#2196F3',
      chat: '#9C27B0',
      location: '#FF9800',
      safety: '#F44336',
      notification: '#E91E63',
      storage: '#607D8B',
      health: '#00BCD4',
      expenses: '#8BC34A',
      shopping: '#FF5722',
      notes: '#795548',
      games: '#9E9E9E',
      weather: '#03A9F4',
      news: '#673AB7',
      entertainment: '#FFC107'
    };
    return colorMap[service] || '#9E9E9E';
  };

  const renderCapability = ({ item }: { item: AIAgentCapability }) => (
    <Box style={styles.capabilityItem}>
      <TouchableOpacity
        style={styles.capabilityHeader}
        onPress={() => handleCapabilityPress(item)}
      >
        <HStack space={3} alignItems="center" flex={1}>
          <Box
            style={[
              styles.capabilityIcon,
              { backgroundColor: getCapabilityColor(item.service) }
            ]}
          >
            <Icon
              as={MaterialCommunityIcons}
              name={getCapabilityIcon(item.service)}
              size="md"
              color="white"
            />
          </Box>

          <VStack flex={1}>
            <Text style={styles.capabilityTitle}>
              {item.service.charAt(0).toUpperCase() + item.service.slice(1)}
            </Text>
            <Text style={styles.capabilityDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <HStack space={2} marginTop={4}>
              <Badge colorScheme="blue" rounded="full" variant="subtle">
                {item.methods.length} methods
              </Badge>
              <Badge colorScheme="green" rounded="full" variant="subtle">
                {item.examples.length} examples
              </Badge>
            </HStack>
          </VStack>

          <Icon
            as={MaterialCommunityIcons}
            name={selectedCapability === item.service ? 'chevron-up' : 'chevron-down'}
            size="md"
            color="gray.500"
          />
        </HStack>
      </TouchableOpacity>

      {selectedCapability === item.service && (
        <Box style={styles.capabilityDetails}>
          <Divider marginY={2} />
          
          {/* Methods */}
          <VStack space={2} marginBottom={4}>
            <Text style={styles.sectionTitle}>Available Methods</Text>
            <HStack space={2} flexWrap="wrap">
              {item.methods.map((method, index) => (
                <Badge
                  key={index}
                  colorScheme="blue"
                  rounded="full"
                  variant="outline"
                  style={styles.methodBadge}
                >
                  {method}
                </Badge>
              ))}
            </HStack>
          </VStack>

          {/* Examples */}
          <VStack space={2} marginBottom={4}>
            <Text style={styles.sectionTitle}>Example Commands</Text>
            <VStack space={2}>
              {item.examples.map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => handleExamplePress(example)}
                >
                  <HStack space={2} alignItems="center">
                    <Icon
                      as={MaterialCommunityIcons}
                      name="message-text"
                      size="sm"
                      color="primary.500"
                    />
                    <Text style={styles.exampleText}>{example}</Text>
                    <Icon
                      as={MaterialCommunityIcons}
                      name="arrow-right"
                      size="sm"
                      color="gray.400"
                    />
                  </HStack>
                </TouchableOpacity>
              ))}
            </VStack>
          </VStack>

          {/* Test Button */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestCapability(item)}
          >
            <HStack space={2} alignItems="center" justifyContent="center">
              <Icon
                as={MaterialCommunityIcons}
                name="play-circle"
                size="md"
                color="white"
              />
              <Text style={styles.testButtonText}>
                Test {item.service.charAt(0).toUpperCase() + item.service.slice(1)} Capabilities
              </Text>
            </HStack>
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );

  const renderQuickStart = () => (
    <Box style={styles.quickStartSection}>
      <Text style={styles.sectionTitle}>Quick Start</Text>
      <VStack space={3}>
        <TouchableOpacity
          style={styles.quickStartItem}
          onPress={() => navigation.navigate('AIAgent', { 
            initialMessage: 'Help me manage my hourse' 
          })}
        >
          <HStack space={3} alignItems="center">
            <Icon
              as={MaterialCommunityIcons}
              name="account-group"
              size="lg"
              color="primary.500"
            />
            <VStack flex={1}>
              <Text style={styles.quickStartTitle}>hourse Management</Text>
              <Text style={styles.quickStartDescription}>
                Add members, manage roles, and organize your hourse
              </Text>
            </VStack>
            <Icon
              as={MaterialCommunityIcons}
              name="arrow-right"
              size="md"
              color="gray.400"
            />
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickStartItem}
          onPress={() => navigation.navigate('AIAgent', { 
            initialMessage: 'Send a message to my hourse' 
          })}
        >
          <HStack space={3} alignItems="center">
            <Icon
              as={MaterialCommunityIcons}
              name="chat"
              size="lg"
              color="primary.500"
            />
            <VStack flex={1}>
              <Text style={styles.quickStartTitle}>hourse Communication</Text>
              <Text style={styles.quickStartDescription}>
                Send messages, create chats, and stay connected
              </Text>
            </VStack>
            <Icon
              as={MaterialCommunityIcons}
              name="arrow-right"
              size="md"
              color="gray.400"
            />
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickStartItem}
          onPress={() => navigation.navigate('AIAgent', { 
            initialMessage: 'Help me track expenses' 
          })}
        >
          <HStack space={3} alignItems="center">
            <Icon
              as={MaterialCommunityIcons}
              name="cash"
              size="lg"
              color="primary.500"
            />
            <VStack flex={1}>
              <Text style={styles.quickStartTitle}>Expense Tracking</Text>
              <Text style={styles.quickStartDescription}>
                Track expenses, set budgets, and manage finances
              </Text>
            </VStack>
            <Icon
              as={MaterialCommunityIcons}
              name="arrow-right"
              size="md"
              color="gray.400"
            />
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickStartItem}
          onPress={() => navigation.navigate('AIAgent', { 
            initialMessage: 'Help me with safety features' 
          })}
        >
          <HStack space={3} alignItems="center">
            <Icon
              as={MaterialCommunityIcons}
              name="shield-check"
              size="lg"
              color="primary.500"
            />
            <VStack flex={1}>
              <Text style={styles.quickStartTitle}>Safety & Security</Text>
              <Text style={styles.quickStartDescription}>
                Emergency alerts, location sharing, and safety checks
              </Text>
            </VStack>
            <Icon
              as={MaterialCommunityIcons}
              name="arrow-right"
              size="md"
              color="gray.400"
            />
          </HStack>
        </TouchableOpacity>
      </VStack>
    </Box>
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
          <VStack flex={1}>
            <Text style={styles.title}>AI Capabilities</Text>
            <Text style={styles.subtitle}>What I can help you with</Text>
          </VStack>
        </HStack>
      </Box>

      <FlatList
        data={capabilities}
        renderItem={renderCapability}
        keyExtractor={(item) => item.service}
        style={styles.capabilitiesList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderQuickStart}
        ListEmptyComponent={
          <EmptyState
            icon="robot"
            title="No capabilities available"
            subtitle="AI capabilities are not available at the moment"
          />
        }
      />
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
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  capabilitiesList: {
    flex: 1,
  },
  quickStartSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  quickStartItem: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  quickStartDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  capabilityItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  capabilityHeader: {
    padding: 16,
  },
  capabilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capabilityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  capabilityDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  capabilityDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  methodBadge: {
    marginBottom: 4,
  },
  exampleItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  exampleText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  testButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AICapabilitiesScreen; 