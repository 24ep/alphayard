import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
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
  Button,
  Input,
  FormControl,
  FormControlLabel,
  Select,
  CheckIcon,
  Divider,
  Spinner,
  FlatList,
  TextArea,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from 'native-base';
import { useDisclosure } from '../../hooks/useDisclosure';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  type: 'personal' | 'hourse' | 'work' | 'school' | 'medical' | 'social';
  priority: 'low' | 'medium' | 'high';
  attendees: Array<{
    id: string;
    name: string;
    avatar?: string;
    isConfirmed: boolean;
    response?: 'accepted' | 'declined' | 'pending';
  }>;
  reminderTime?: Date;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: Date;
  color: string;
  createdBy: string;
  familyId: string;
  isShared: boolean;
  notes?: string;
}

interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
}

interface CalendarAppProps {
  familyId: string;
  onEventPress?: (event: CalendarEvent) => void;
  onDatePress?: (date: Date) => void;
}

const CalendarApp: React.FC<CalendarAppProps> = ({
  familyId,
  onEventPress,
  onDatePress,
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'hourse' | 'work' | 'school'>('all');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const cardBgColor = useColorModeValue(colors.gray[50], colors.gray[700]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    startTime: new Date(),
    endDate: new Date(),
    endTime: new Date(),
    allDay: false,
    location: '',
    type: 'personal' as const,
    priority: 'medium' as const,
    isRecurring: false,
    recurringPattern: 'weekly' as const,
    reminderTime: 15, // minutes before
    isShared: false,
    notes: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'hourse Dinner',
          description: 'Weekly hourse dinner at home',
          startTime: new Date('2024-01-20T18:00:00'),
          endTime: new Date('2024-01-20T20:00:00'),
          allDay: false,
          location: 'Home',
          type: 'hourse',
          priority: 'medium',
          attendees: [
            { id: '1', name: 'John Doe', isConfirmed: true, response: 'accepted' },
            { id: '2', name: 'Jane Doe', isConfirmed: true, response: 'accepted' },
          ],
          color: colors.primary[500],
          createdBy: user?.id || '',
          familyId,
          isShared: true,
          isRecurring: true,
          recurringPattern: 'weekly',
        },
        {
          id: '2',
          title: 'Doctor Appointment',
          description: 'Annual checkup',
          startTime: new Date('2024-01-22T10:00:00'),
          endTime: new Date('2024-01-22T11:00:00'),
          allDay: false,
          location: 'Medical Center',
          type: 'medical',
          priority: 'high',
          attendees: [
            { id: '1', name: 'John Doe', isConfirmed: true, response: 'accepted' },
          ],
          color: colors.red[500],
          createdBy: user?.id || '',
          familyId,
          isShared: false,
          reminderTime: new Date('2024-01-22T09:45:00'),
        },
        {
          id: '3',
          title: 'School Meeting',
          description: 'Parent-teacher conference',
          startTime: new Date('2024-01-25T14:00:00'),
          endTime: new Date('2024-01-25T15:00:00'),
          allDay: false,
          location: 'School',
          type: 'school',
          priority: 'medium',
          attendees: [
            { id: '1', name: 'John Doe', isConfirmed: false, response: 'pending' },
            { id: '3', name: 'Teacher Smith', isConfirmed: true, response: 'accepted' },
          ],
          color: colors.blue[500],
          createdBy: user?.id || '',
          familyId,
          isShared: true,
        },
        {
          id: '4',
          title: 'Birthday Party',
          description: 'Sarah\'s 10th birthday celebration',
          startTime: new Date('2024-01-28T16:00:00'),
          endTime: new Date('2024-01-28T20:00:00'),
          allDay: false,
          location: 'Home',
          type: 'hourse',
          priority: 'high',
          attendees: [
            { id: '1', name: 'John Doe', isConfirmed: true, response: 'accepted' },
            { id: '2', name: 'Jane Doe', isConfirmed: true, response: 'accepted' },
            { id: '4', name: 'Sarah Doe', isConfirmed: true, response: 'accepted' },
          ],
          color: colors.purple[500],
          createdBy: user?.id || '',
          familyId,
          isShared: true,
        },
      ];
      setEvents(mockEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onOpen();
    onEventPress?.(event);
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    onDatePress?.(date);
  };

  const handleCreateEvent = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: selectedDate,
      startTime: new Date(selectedDate.getTime() + 60 * 60 * 1000), // 1 hour from now
      endDate: selectedDate,
      endTime: new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      allDay: false,
      location: '',
      type: 'personal',
      priority: 'medium',
      isRecurring: false,
      recurringPattern: 'weekly',
      reminderTime: 15,
      isShared: false,
      notes: '',
    });
    onCreateOpen();
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    try {
      setIsLoading(true);
      const newEvent: CalendarEvent = {
        id: `event_${Date.now()}`,
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        allDay: eventForm.allDay,
        location: eventForm.location.trim(),
        type: eventForm.type,
        priority: eventForm.priority,
        attendees: [{ id: user?.id || '', name: user?.name || '', isConfirmed: true, response: 'accepted' }],
        color: getEventColor(eventForm.type),
        createdBy: user?.id || '',
        familyId,
        isShared: eventForm.isShared,
        notes: eventForm.notes.trim(),
        isRecurring: eventForm.isRecurring,
        recurringPattern: eventForm.recurringPattern,
        reminderTime: new Date(eventForm.startTime.getTime() - eventForm.reminderTime * 60 * 1000),
      };

      setEvents(prev => [newEvent, ...prev]);
      onCreateClose();
      Alert.alert('Success', 'Event created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents(prev => prev.filter(event => event.id !== eventId));
            onClose();
          },
        },
      ]
    );
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'personal': return colors.gray[500];
      case 'hourse': return colors.primary[500];
      case 'work': return colors.orange[500];
      case 'school': return colors.blue[500];
      case 'medical': return colors.red[500];
      case 'social': return colors.purple[500];
      default: return colors.gray[500];
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'personal': return 'account';
      case 'hourse': return 'account-group';
      case 'work': return 'briefcase';
      case 'school': return 'school';
      case 'medical': return 'medical-bag';
      case 'social': return 'party-popper';
      default: return 'calendar';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.red[500];
      case 'medium': return colors.yellow[500];
      case 'low': return colors.green[500];
      default: return colors.gray[500];
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      return eventStart <= endOfDay && eventEnd >= startOfDay;
    });
  };

  const getFilteredEvents = () => {
    let filtered = events;
    
    switch (filterType) {
      case 'personal':
        filtered = events.filter(event => event.type === 'personal');
        break;
      case 'hourse':
        filtered = events.filter(event => event.type === 'hourse');
        break;
      case 'work':
        filtered = events.filter(event => event.type === 'work');
        break;
      case 'school':
        filtered = events.filter(event => event.type === 'school');
        break;
      default:
        filtered = events;
    }
    
    return filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const renderEventItem = ({ item: event }: { item: CalendarEvent }) => (
    <Pressable onPress={() => handleEventPress(event)}>
      <Box
        bg={cardBgColor}
        p={4}
        borderRadius={12}
        mb={3}
        borderLeftWidth={4}
        borderLeftColor={event.color}
        borderWidth={1}
        borderColor={colors.gray[200]}
      >
        <HStack space={3} alignItems="center">
          <Box
            w={12}
            h={12}
            borderRadius={8}
            bg={event.color}
            justifyContent="center"
            alignItems="center"
          >
            <Icon
              as={IconMC}
              name={getEventIcon(event.type)}
              size={6}
              color={colors.white[500]}
            />
          </Box>
          
          <VStack flex={1}>
            <HStack space={2} alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600" numberOfLines={1}>
                {event.title}
              </Text>
              <Badge
                colorScheme={getPriorityColor(event.priority) === colors.red[500] ? 'red' : 
                           getPriorityColor(event.priority) === colors.yellow[500] ? 'yellow' : 'green'}
                variant="subtle"
                size="xs"
              >
                {event.priority.toUpperCase()}
              </Badge>
            </HStack>
            
            <Text style={textStyles.caption} color={colors.gray[600]} numberOfLines={2}>
              {event.description}
            </Text>
            
            <HStack space={2} mt={1}>
              <Icon as={IconMC} name="clock-outline" size={3} color={colors.gray[500]} />
              <Text style={textStyles.caption} color={colors.gray[600]}>
                {event.allDay ? 'All day' : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
              </Text>
            </HStack>
            
            {event.location && (
              <HStack space={2} mt={1}>
                <Icon as={IconMC} name="map-marker-outline" size={3} color={colors.gray[500]} />
                <Text style={textStyles.caption} color={colors.gray[600]}>
                  {event.location}
                </Text>
              </HStack>
            )}
            
            <HStack space={2} mt={1}>
              {event.isRecurring && (
                <Badge colorScheme="purple" variant="subtle" size="xs">
                  Recurring
                </Badge>
              )}
              {event.isShared && (
                <Badge colorScheme="primary" variant="subtle" size="xs">
                  Shared
                </Badge>
              )}
              <Text style={textStyles.caption} color={colors.gray[500]}>
                {event.attendees.length} attendees
              </Text>
            </HStack>
          </VStack>
          
          <VStack space={1}>
            <IconButton
              icon={<Icon as={IconMC} name="pencil" size={4} />}
              variant="ghost"
              size="sm"
              colorScheme="primary"
            />
            <IconButton
              icon={<Icon as={IconMC} name="delete" size={4} />}
              onPress={() => handleDeleteEvent(event.id)}
              variant="ghost"
              size="sm"
              colorScheme="red"
            />
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <Box flex={1}>
      {/* Header */}
      <HStack space={3} alignItems="center" mb={4}>
        <Icon
          as={IconMC}
          name="calendar-month"
          size={6}
          color={colors.primary[500]}
        />
        <VStack flex={1}>
          <Text style={textStyles.h3} color={textColor} fontWeight="600">
            hourse Calendar
          </Text>
          <Text style={textStyles.caption} color={colors.gray[600]}>
            {events.length} events • {formatDate(selectedDate)}
          </Text>
        </VStack>
        <HStack space={2}>
          <IconButton
            icon={<Icon as={IconMC} name={viewMode === 'month' ? 'view-week' : 'view-module'} size={5} />}
            onPress={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
            variant="ghost"
            size="sm"
            colorScheme="primary"
          />
          <IconButton
            icon={<Icon as={IconMC} name="plus" size={5} />}
            onPress={handleCreateEvent}
            variant="ghost"
            size="sm"
            colorScheme="primary"
          />
        </HStack>
      </HStack>

      {/* Filter Tabs */}
      <HStack space={2} mb={4} flexWrap="wrap">
        {[
          { key: 'all', label: 'All', icon: 'calendar' },
          { key: 'personal', label: 'Personal', icon: 'account' },
          { key: 'hourse', label: 'hourse', icon: 'account-group' },
          { key: 'work', label: 'Work', icon: 'briefcase' },
          { key: 'school', label: 'School', icon: 'school' },
        ].map((filter) => (
          <Pressable
            key={filter.key}
            onPress={() => setFilterType(filter.key as any)}
          >
            <Box
              bg={filterType === filter.key ? colors.primary[500] : cardBgColor}
              px={3}
              py={2}
              borderRadius={16}
              borderWidth={1}
              borderColor={filterType === filter.key ? colors.primary[500] : colors.gray[200]}
            >
              <HStack space={1} alignItems="center">
                <Icon
                  as={IconMC}
                  name={filter.icon as any}
                  size={3}
                  color={filterType === filter.key ? colors.white[500] : colors.gray[600]}
                />
                <Text
                  style={textStyles.caption}
                  color={filterType === filter.key ? colors.white[500] : colors.gray[600]}
                  fontWeight={filterType === filter.key ? '600' : '400'}
                >
                  {filter.label}
                </Text>
              </HStack>
            </Box>
          </Pressable>
        ))}
      </HStack>

      {/* Today's Events */}
      <Box bg={cardBgColor} p={4} borderRadius={12} mb={4}>
        <HStack space={3} alignItems="center" mb={3}>
          <Icon as={IconMC} name="calendar-today" size={5} color={colors.primary[500]} />
          <Text style={textStyles.h4} color={textColor} fontWeight="600">
            Today's Events
          </Text>
          <Badge colorScheme="primary" variant="subtle">
            {getEventsForDate(new Date()).length}
          </Badge>
        </HStack>
        
        {getEventsForDate(new Date()).length > 0 ? (
          <VStack space={2}>
            {getEventsForDate(new Date()).slice(0, 3).map(event => (
              <HStack key={event.id} space={3} alignItems="center">
                <Box
                  w={3}
                  h={3}
                  borderRadius="full"
                  bg={event.color}
                />
                <VStack flex={1}>
                  <Text style={textStyles.body} color={textColor} fontWeight="500">
                    {event.title}
                  </Text>
                  <Text style={textStyles.caption} color={colors.gray[600]}>
                    {event.allDay ? 'All day' : formatTime(event.startTime)}
                  </Text>
                </VStack>
                <IconButton
                  icon={<Icon as={IconMC} name="chevron-right" size={4} />}
                  variant="ghost"
                  size="sm"
                  colorScheme="gray"
                  onPress={() => handleEventPress(event)}
                />
              </HStack>
            ))}
            {getEventsForDate(new Date()).length > 3 && (
              <Pressable onPress={() => setViewMode('day')}>
                <Text style={textStyles.caption} color={colors.primary[500]} textAlign="center">
                  View all {getEventsForDate(new Date()).length} events
                </Text>
              </Pressable>
            )}
          </VStack>
        ) : (
          <Text style={textStyles.body} color={colors.gray[600]} textAlign="center">
            No events scheduled for today
          </Text>
        )}
      </Box>

      {/* Upcoming Events */}
      <VStack space={3}>
        <HStack space={3} alignItems="center">
          <Icon as={IconMC} name="calendar-clock" size={5} color={colors.primary[500]} />
          <Text style={textStyles.h4} color={textColor} fontWeight="600">
            Upcoming Events
          </Text>
        </HStack>
        
        {isLoading ? (
          <Box alignItems="center" py={8}>
            <Spinner size="lg" color={colors.primary[500]} />
            <Text style={textStyles.body} color={colors.gray[600]} mt={2}>
              Loading events...
            </Text>
          </Box>
        ) : (
          <FlatList
            data={getFilteredEvents().slice(0, 10)}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Box alignItems="center" py={8}>
                <Icon
                  as={IconMC}
                  name="calendar-blank"
                  size={12}
                  color={colors.gray[400]}
                  mb={3}
                />
                <Text style={textStyles.h4} color={colors.gray[600]} textAlign="center">
                  No upcoming events
                </Text>
                <Text style={textStyles.caption} color={colors.gray[500]} textAlign="center">
                  Create an event to get started
                </Text>
              </Box>
            }
          />
        )}
      </VStack>

      {/* Event Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack space={3} alignItems="center">
              <Icon
                as={IconMC}
                name={selectedEvent ? getEventIcon(selectedEvent.type) : 'calendar'}
                size={5}
                color={selectedEvent ? selectedEvent.color : colors.primary[500]}
              />
              <VStack flex={1}>
                <Text style={textStyles.h3} color={textColor}>
                  {selectedEvent?.title}
                </Text>
                <Badge
                  colorScheme={selectedEvent ? getPriorityColor(selectedEvent.priority) === colors.red[500] ? 'red' : 
                             getPriorityColor(selectedEvent.priority) === colors.yellow[500] ? 'yellow' : 'green' : 'gray'}
                  variant="subtle"
                  size="sm"
                >
                  {selectedEvent?.priority.toUpperCase()} PRIORITY
                </Badge>
              </VStack>
              <HStack space={2}>
                <IconButton
                  icon={<Icon as={IconMC} name="pencil" size={5} />}
                  variant="ghost"
                  colorScheme="primary"
                />
                <IconButton
                  icon={<Icon as={IconMC} name="delete" size={5} />}
                  onPress={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
                  variant="ghost"
                  colorScheme="red"
                />
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {selectedEvent && (
              <VStack space={4}>
                <HStack space={3} alignItems="center">
                  <Icon as={IconMC} name="clock-outline" size={5} color={colors.gray[500]} />
                  <Text style={textStyles.body} color={textColor}>
                    {selectedEvent.allDay ? 'All day' : `${formatDateTime(selectedEvent.startTime)} - ${formatTime(selectedEvent.endTime)}`}
                  </Text>
                </HStack>
                
                {selectedEvent.location && (
                  <HStack space={3} alignItems="center">
                    <Icon as={IconMC} name="map-marker-outline" size={5} color={colors.gray[500]} />
                    <Text style={textStyles.body} color={textColor}>
                      {selectedEvent.location}
                    </Text>
                  </HStack>
                )}
                
                {selectedEvent.description && (
                  <Box>
                    <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                      Description
                    </Text>
                    <Text style={textStyles.body} color={colors.gray[600]}>
                      {selectedEvent.description}
                    </Text>
                  </Box>
                )}
                
                {selectedEvent.attendees.length > 0 && (
                  <Box>
                    <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                      Attendees ({selectedEvent.attendees.length})
                    </Text>
                    <VStack space={2}>
                      {selectedEvent.attendees.map(attendee => (
                        <HStack key={attendee.id} space={2} alignItems="center">
                          <Badge
                            colorScheme={attendee.response === 'accepted' ? 'success' : 
                                       attendee.response === 'declined' ? 'error' : 'warning'}
                            variant="subtle"
                            size="sm"
                          >
                            {attendee.response === 'accepted' ? '✓' : 
                             attendee.response === 'declined' ? '✗' : '?'}
                          </Badge>
                          <Text style={textStyles.body} color={textColor}>
                            {attendee.name}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
                
                <HStack space={2}>
                  {selectedEvent.isRecurring && (
                    <Badge colorScheme="purple" variant="subtle">
                      Recurring
                    </Badge>
                  )}
                  {selectedEvent.isShared && (
                    <Badge colorScheme="primary" variant="subtle">
                      Shared
                    </Badge>
                  )}
                </HStack>
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
                  // TODO: Share event
                  Alert.alert('Share', 'Share event feature coming soon!');
                }}
              >
                Share
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Event Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text style={textStyles.h3} color={textColor}>
              Create Event
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Event Title</Text>
                </FormControl.Label>
                <Input
                  value={eventForm.title}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, title: text }))}
                  placeholder="Enter event title"
                  size="lg"
                  borderRadius={12}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Description (Optional)</Text>
                </FormControl.Label>
                <TextArea
                  value={eventForm.description}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, description: text }))}
                  placeholder="Enter event description"
                  size="lg"
                  borderRadius={12}
                  numberOfLines={3}
                />
              </FormControl>

              <HStack space={4}>
                <FormControl flex={1}>
                  <FormControl.Label>
                    <Text style={textStyles.h4} color={textColor}>Event Type</Text>
                  </FormControl.Label>
                  <Select
                    selectedValue={eventForm.type}
                    onValueChange={(value) => setEventForm(prev => ({ ...prev, type: value as any }))}
                    size="lg"
                    borderRadius={12}
                  >
                    <Select.Item label="Personal" value="personal" />
                    <Select.Item label="hourse" value="hourse" />
                    <Select.Item label="Work" value="work" />
                    <Select.Item label="School" value="school" />
                    <Select.Item label="Medical" value="medical" />
                    <Select.Item label="Social" value="social" />
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormControl.Label>
                    <Text style={textStyles.h4} color={textColor}>Priority</Text>
                  </FormControl.Label>
                  <Select
                    selectedValue={eventForm.priority}
                    onValueChange={(value) => setEventForm(prev => ({ ...prev, priority: value as any }))}
                    size="lg"
                    borderRadius={12}
                  >
                    <Select.Item label="Low" value="low" />
                    <Select.Item label="Medium" value="medium" />
                    <Select.Item label="High" value="high" />
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Location (Optional)</Text>
                </FormControl.Label>
                <Input
                  value={eventForm.location}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, location: text }))}
                  placeholder="Enter location"
                  size="lg"
                  borderRadius={12}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>All Day Event</Text>
                </FormControl.Label>
                <Switch
                  isChecked={eventForm.allDay}
                  onToggle={(value) => setEventForm(prev => ({ ...prev, allDay: value }))}
                  colorScheme="success"
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Share with hourse</Text>
                </FormControl.Label>
                <Switch
                  isChecked={eventForm.isShared}
                  onToggle={(value) => setEventForm(prev => ({ ...prev, isShared: value }))}
                  colorScheme="success"
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Recurring Event</Text>
                </FormControl.Label>
                <Switch
                  isChecked={eventForm.isRecurring}
                  onToggle={(value) => setEventForm(prev => ({ ...prev, isRecurring: value }))}
                  colorScheme="success"
                />
              </FormControl>

              {eventForm.isRecurring && (
                <FormControl>
                  <FormControl.Label>
                    <Text style={textStyles.h4} color={textColor}>Recurring Pattern</Text>
                  </FormControl.Label>
                  <Select
                    selectedValue={eventForm.recurringPattern}
                    onValueChange={(value) => setEventForm(prev => ({ ...prev, recurringPattern: value as any }))}
                    size="lg"
                    borderRadius={12}
                  >
                    <Select.Item label="Daily" value="daily" />
                    <Select.Item label="Weekly" value="weekly" />
                    <Select.Item label="Monthly" value="monthly" />
                    <Select.Item label="Yearly" value="yearly" />
                  </Select>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space={3}>
              <Button variant="ghost" onPress={onCreateClose}>
                Cancel
              </Button>
              <Button
                onPress={handleSaveEvent}
                isLoading={isLoading}
                bg={colors.primary[500]}
                _pressed={{ bg: colors.primary[600] }}
              >
                Create Event
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CalendarApp; 