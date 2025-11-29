import React, { useState, useEffect } from 'react';
import { View, Alert, Text, TouchableOpacity } from 'react-native';
import {
  Box,
  VStack,
  HStack,
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
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  CheckIcon,
  Divider,
  Spinner,
} from 'native-base';
// Mock MapView component for development
const MapView = ({ children, style, region, onPress }: any) => (
  <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ color: '#666', fontSize: 16 }}>Map View (Mock)</Text>
    <Text style={{ color: '#999', fontSize: 12 }}>Tap to set geofence location</Text>
    {children}
  </View>
);

const Marker = ({ coordinate, onPress, children }: any) => (
  <TouchableOpacity onPress={onPress} style={{ position: 'absolute' }}>
    {children}
  </TouchableOpacity>
);

const Circle = ({ center, radius, fillColor, strokeColor }: any) => (
  <View style={{ 
    position: 'absolute', 
    width: radius * 2, 
    height: radius * 2, 
    borderRadius: radius,
    backgroundColor: fillColor || 'rgba(0, 122, 255, 0.2)',
    borderWidth: 2,
    borderColor: strokeColor || '#007AFF'
  }} />
);
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { locationService, Geofence } from '../../services/locationService';
import { useAuth } from '../../contexts/AuthContext';

interface GeofenceManagerProps {
  familyId: string;
  onGeofenceCreated?: (geofence: Geofence) => void;
  onGeofenceUpdated?: (geofence: Geofence) => void;
  onGeofenceDeleted?: (geofenceId: string) => void;
}

const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  familyId,
  onGeofenceCreated,
  onGeofenceUpdated,
  onGeofenceDeleted,
}) => {
  const { user } = useAuth();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 13.7563, // Bangkok default
    longitude: 100.5018,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const cardBgColor = useColorModeValue(colors.gray[50], colors.gray[700]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'home' as const,
    radius: 100,
    latitude: 0,
    longitude: 0,
    notifications: {
      onEnter: true,
      onExit: true,
      onStay: false,
      stayThreshold: 30,
    },
  });

  useEffect(() => {
    loadGeofences();
  }, []);

  const loadGeofences = async () => {
    try {
      setIsLoading(true);
      const loadedGeofences = locationService.getGeofences();
      setGeofences(loadedGeofences);
    } catch (error) {
      Alert.alert('Error', 'Failed to load geofences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGeofence = () => {
    setFormData({
      name: '',
      type: 'home',
      radius: 100,
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
      notifications: {
        onEnter: true,
        onExit: true,
        onStay: false,
        stayThreshold: 30,
      },
    });
    onOpen();
  };

  const handleEditGeofence = (geofence: Geofence) => {
    setSelectedGeofence(geofence);
    setFormData({
      name: geofence.name,
      type: geofence.type,
      radius: geofence.radius,
      latitude: geofence.latitude,
      longitude: geofence.longitude,
      notifications: geofence.notifications,
    });
    onEditOpen();
  };

  const handleSaveGeofence = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a geofence name');
      return;
    }

    try {
      setIsLoading(true);
      
      const geofenceData = {
        name: formData.name.trim(),
        type: formData.type,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius: formData.radius,
        isActive: true,
        familyId,
        members: [user?.id || ''],
        notifications: formData.notifications,
      };

      if (selectedGeofence) {
        // Update existing geofence
        await locationService.updateGeofence(selectedGeofence.id, geofenceData);
        onGeofenceUpdated?.({ ...selectedGeofence, ...geofenceData });
      } else {
        // Create new geofence
        const newGeofenceId = await locationService.addGeofence(geofenceData);
        const newGeofence = { ...geofenceData, id: newGeofenceId };
        onGeofenceCreated?.(newGeofence);
      }

      await loadGeofences();
      onClose();
      onEditClose();
      setSelectedGeofence(null);
      
      Alert.alert('Success', selectedGeofence ? 'Geofence updated' : 'Geofence created');
    } catch (error) {
      Alert.alert('Error', 'Failed to save geofence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGeofence = async (geofenceId: string) => {
    Alert.alert(
      'Delete Geofence',
      'Are you sure you want to delete this geofence?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await locationService.removeGeofence(geofenceId);
              onGeofenceDeleted?.(geofenceId);
              await loadGeofences();
              Alert.alert('Success', 'Geofence deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete geofence');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setFormData(prev => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return 'home';
      case 'school': return 'school';
      case 'work': return 'briefcase';
      case 'custom': return 'map-marker';
      default: return 'map-marker';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'home': return colors.success[500];
      case 'school': return colors.primary[500];
      case 'work': return colors.warning[500];
      case 'custom': return colors.purple[500];
      default: return colors.gray[500];
    }
  };

  const renderGeofenceCard = (geofence: Geofence) => (
    <Pressable
      key={geofence.id}
      onPress={() => handleEditGeofence(geofence)}
    >
      <Box
        bg={cardBgColor}
        p={4}
        borderRadius={12}
        mb={3}
        borderWidth={1}
        borderColor={colors.gray[200]}
        borderLeftWidth={4}
        borderLeftColor={getTypeColor(geofence.type)}
      >
        <HStack space={3} alignItems="center">
          <Box
            w={12}
            h={12}
            borderRadius="full"
            bg={getTypeColor(geofence.type)}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={20}>{getTypeIcon(geofence.type)}</Text>
          </Box>
          
          <VStack flex={1}>
            <HStack space={2} alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {geofence.name}
              </Text>
              <Badge
                colorScheme={geofence.isActive ? 'success' : 'gray'}
                variant="subtle"
                size="sm"
              >
                {geofence.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </HStack>
            
            <Text style={textStyles.caption} color={colors.gray[600]}>
              Radius: {geofence.radius}m
            </Text>
            
            <HStack space={2} mt={1}>
              {geofence.notifications.onEnter && (
                <Badge colorScheme="blue" variant="subtle" size="xs">
                  Enter
                </Badge>
              )}
              {geofence.notifications.onExit && (
                <Badge colorScheme="orange" variant="subtle" size="xs">
                  Exit
                </Badge>
              )}
              {geofence.notifications.onStay && (
                <Badge colorScheme="purple" variant="subtle" size="xs">
                  Stay
                </Badge>
              )}
            </HStack>
          </VStack>
          
          <VStack space={1}>
            <IconButton
              icon={<Icon as={IconMC} name="pencil" size={4} />}
              onPress={() => handleEditGeofence(geofence)}
              variant="ghost"
              size="sm"
              colorScheme="primary"
            />
            <IconButton
              icon={<Icon as={IconMC} name="delete" size={4} />}
              onPress={() => handleDeleteGeofence(geofence.id)}
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
    <Box>
      {/* Header */}
      <HStack space={3} alignItems="center" mb={4}>
        <Icon
          as={IconMC}
          name="map-marker-radius"
          size={6}
          color={colors.primary[500]}
        />
        <VStack flex={1}>
          <Text style={textStyles.h3} color={textColor} fontWeight="600">
            Safety Zones
          </Text>
          <Text style={textStyles.caption} color={colors.gray[600]}>
            {geofences.length} active zones
          </Text>
        </VStack>
        <IconButton
          icon={<Icon as={IconMC} name="plus" size={5} />}
          onPress={handleCreateGeofence}
          variant="ghost"
          size="sm"
          colorScheme="primary"
        />
      </HStack>

      {/* Map */}
      <Box
        bg={cardBgColor}
        borderRadius={12}
        overflow="hidden"
        borderWidth={1}
        borderColor={colors.gray[200]}
        h={300}
        mb={4}
      >
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={mapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {/* Geofence circles */}
          {geofences.map((geofence) => (
            <Circle
              key={geofence.id}
              center={{
                latitude: geofence.latitude,
                longitude: geofence.longitude,
              }}
              radius={geofence.radius}
              fillColor={`${getTypeColor(geofence.type)}20`}
              strokeColor={getTypeColor(geofence.type)}
              strokeWidth={2}
            />
          ))}
          
          {/* Geofence markers */}
          {geofences.map((geofence) => (
            <Marker
              key={`marker_${geofence.id}`}
              coordinate={{
                latitude: geofence.latitude,
                longitude: geofence.longitude,
              }}
              title={geofence.name}
              description={`${geofence.radius}m radius`}
            >
              <Box
                bg={getTypeColor(geofence.type)}
                borderRadius="full"
                p={2}
                borderWidth={2}
                borderColor={colors.white[500]}
              >
                <Text fontSize={16}>{getTypeIcon(geofence.type)}</Text>
              </Box>
            </Marker>
          ))}
        </MapView>
      </Box>

      {/* Geofence list */}
      {isLoading ? (
        <Box alignItems="center" py={8}>
          <Spinner size="lg" color={colors.primary[500]} />
          <Text style={textStyles.body} color={colors.gray[600]} mt={2}>
            Loading geofences...
          </Text>
        </Box>
      ) : geofences.length > 0 ? (
        <VStack space={2}>
          <Text style={textStyles.h4} color={textColor} fontWeight="600">
            Active Zones
          </Text>
          {geofences.map(renderGeofenceCard)}
        </VStack>
      ) : (
        <Box
          bg={cardBgColor}
          p={8}
          borderRadius={12}
          alignItems="center"
        >
          <Icon
            as={IconMC}
            name="map-marker-off"
            size={12}
            color={colors.gray[400]}
            mb={3}
          />
          <Text style={textStyles.h4} color={colors.gray[600]} textAlign="center">
            No safety zones
          </Text>
          <Text style={textStyles.caption} color={colors.gray[500]} textAlign="center">
            Create safety zones to get notified when hourse members enter or leave important areas
          </Text>
          <Button
            mt={4}
            onPress={handleCreateGeofence}
            bg={colors.primary[500]}
            _pressed={{ bg: colors.primary[600] }}
            size="sm"
          >
            Create Safety Zone
          </Button>
        </Box>
      )}

      {/* Create/Edit Geofence Modal */}
      <Modal isOpen={isOpen || isEditOpen} onClose={onClose || onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text style={textStyles.h3} color={textColor}>
              {selectedGeofence ? 'Edit Safety Zone' : 'Create Safety Zone'}
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              {/* Basic Info */}
              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Zone Name</Text>
                </FormControl.Label>
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Home, School, Work"
                  size="lg"
                  borderRadius={12}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Zone Type</Text>
                </FormControl.Label>
                <Select
                  selectedValue={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                  size="lg"
                  borderRadius={12}
                >
                  <Select.Item label="Home" value="home" />
                  <Select.Item label="School" value="school" />
                  <Select.Item label="Work" value="work" />
                  <Select.Item label="Custom" value="custom" />
                </Select>
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Radius (meters)</Text>
                </FormControl.Label>
                <NumberInput
                  value={formData.radius.toString()}
                  onChange={(value) => setFormData(prev => ({ ...prev, radius: parseInt(value) || 100 }))}
                  min={50}
                  max={5000}
                  step={50}
                  size="lg"
                  borderRadius={12}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Divider />

              {/* Notifications */}
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                Notifications
              </Text>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.body} color={textColor}>Notify when entering zone</Text>
                </FormControl.Label>
                <Switch
                  isChecked={formData.notifications.onEnter}
                  onToggle={(value) => setFormData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, onEnter: value }
                  }))}
                  colorScheme="success"
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.body} color={textColor}>Notify when leaving zone</Text>
                </FormControl.Label>
                <Switch
                  isChecked={formData.notifications.onExit}
                  onToggle={(value) => setFormData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, onExit: value }
                  }))}
                  colorScheme="success"
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.body} color={textColor}>Notify when staying too long</Text>
                </FormControl.Label>
                <Switch
                  isChecked={formData.notifications.onStay}
                  onToggle={(value) => setFormData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, onStay: value }
                  }))}
                  colorScheme="success"
                />
              </FormControl>

              {formData.notifications.onStay && (
                <FormControl>
                  <FormControl.Label>
                    <Text style={textStyles.body} color={textColor}>Stay threshold (minutes)</Text>
                  </FormControl.Label>
                  <NumberInput
                    value={formData.notifications.stayThreshold.toString()}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        stayThreshold: parseInt(value) || 30
                      }
                    }))}
                    min={5}
                    max={480}
                    step={5}
                    size="md"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              )}

              {/* Coordinates */}
              <Divider />
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                Location
              </Text>
              <HStack space={2}>
                <FormControl flex={1}>
                  <FormControl.Label>
                    <Text style={textStyles.caption} color={colors.gray[600]}>Latitude</Text>
                  </FormControl.Label>
                  <Input
                    value={formData.latitude.toFixed(6)}
                    isReadOnly
                    size="sm"
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormControl.Label>
                    <Text style={textStyles.caption} color={colors.gray[600]}>Longitude</Text>
                  </FormControl.Label>
                  <Input
                    value={formData.longitude.toFixed(6)}
                    isReadOnly
                    size="sm"
                  />
                </FormControl>
              </HStack>
              <Text style={textStyles.caption} color={colors.gray[500]}>
                Tap on the map above to set the zone center
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space={3}>
              <Button variant="ghost" onPress={onClose || onEditClose}>
                Cancel
              </Button>
              <Button
                onPress={handleSaveGeofence}
                isLoading={isLoading}
                bg={colors.primary[500]}
                _pressed={{ bg: colors.primary[600] }}
              >
                {selectedGeofence ? 'Update' : 'Create'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GeofenceManager; 