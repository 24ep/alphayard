import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  IconButton,
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
  Switch,
  Spinner,
  Fab,
  FabIcon,
  FabLabel,
} from 'native-base';
import { useDisclosure } from '../../hooks/useDisclosure';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';
import { useGallery } from '../../contexts/GalleryContext';
import { useCircle } from '../../hooks/useCircle';
import PhotoGrid from '../gallery/PhotoGrid';
import AlbumList from '../gallery/AlbumList';
import GalleryHeader from '../gallery/GalleryHeader';
import { Photo, Album } from '../../types/gallery';

interface GalleryAppProps {
  circleId?: string;
  onPhotoPress?: (photo: Photo) => void;
  onAlbumPress?: (album: Album) => void;
}

const GalleryApp: React.FC<GalleryAppProps> = ({
  circleId: propCircleId,
  onPhotoPress,
  onAlbumPress,
}) => {
  const { user } = useAuth();
  const { currentCircle } = useCircle();
  const {
    photos,
    albums,
    selectedPhotos,
    selectedAlbum,
    isLoading,
    error,
    filters,
    viewMode,
    loadPhotos,
    loadAlbums,
    createAlbum,
    deletePhoto,
    deleteAlbum,
    toggleFavorite,
    togglePhotoSelection,
    updateFilters,
    setViewMode,
    clearSelection,
  } = useGallery();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlbumOpen, onOpen: onAlbumOpen, onClose: onAlbumClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const cardBgColor = useColorModeValue(colors.gray[50], colors.gray[700]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  const circleId = propCircleId || currentCircle?.id || '';

  // Form state
  const [albumForm, setAlbumForm] = React.useState({
    name: '',
    description: '',
    isShared: true,
  });

  useEffect(() => {
    if (circleId) {
      loadPhotos(circleId);
      loadAlbums(circleId);
    }
  }, [circleId, loadPhotos, loadAlbums]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handlePhotoPress = (photo: Photo) => {
    onPhotoPress?.(photo);
  };

  const handlePhotoLongPress = (photo: Photo) => {
    togglePhotoSelection(photo.id);
  };

  const handleAlbumPress = (album: Album) => {
    onAlbumPress?.(album);
  };

  const handleCreateAlbum = () => {
    setAlbumForm({
      name: '',
      description: '',
      isShared: true,
    });
    onUploadOpen();
  };

  const handleSaveAlbum = async () => {
    if (!albumForm.name.trim()) {
      Alert.alert('Error', 'Please enter an album name');
      return;
    }

    try {
      await createAlbum({
        name: albumForm.name.trim(),
        description: albumForm.description.trim(),
        isShared: albumForm.isShared,
        circleId,
        createdBy: user?.id || '',
        members: [user?.id || ''],
      });
      onUploadClose();
      Alert.alert('Success', 'Album created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create album');
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(photoId);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const getFilteredPhotos = () => {
    let filtered = photos;
    
    switch (filters.type) {
      case 'favorites':
        filtered = photos.filter(photo => photo.isFavorite);
        break;
      case 'shared':
        filtered = photos.filter(photo => photo.isShared);
        break;
      default:
        filtered = photos;
    }
    
    if (filters.searchQuery) {
      filtered = filtered.filter(photo =>
        photo.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        photo.filename.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        photo.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
      );
    }
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box flex={1}>
      {/* Header */}
      <GalleryHeader
        title="Circle Gallery"
        photoCount={photos.length}
        albumCount={albums.length}
        onAddPress={handleCreateAlbum}
        onMenuPress={() => {/* TODO: Open gallery options */}}
      />

      {/* Filter Tabs */}
      {viewMode === 'photos' && (
        <HStack space={2} mb={4} px={4}>
          {[
            { key: 'all', label: 'All', icon: 'image-multiple' },
            { key: 'favorites', label: 'Favorites', icon: 'star' },
            { key: 'shared', label: 'Shared', icon: 'share' },
          ].map((filter) => (
            <Pressable
              key={filter.key}
              onPress={() => updateFilters({ type: filter.key as any })}
            >
              <Box
                bg={filters.type === filter.key ? colors.primary[500] : cardBgColor}
                px={4}
                py={2}
                borderRadius={20}
                borderWidth={1}
                borderColor={filters.type === filter.key ? colors.primary[500] : colors.gray[200]}
              >
                <HStack space={2} alignItems="center">
                  <Icon
                    as={IconMC}
                    name={filter.icon as any}
                    size={4}
                    color={filters.type === filter.key ? colors.white[500] : colors.gray[600]}
                  />
                  <Text
                    style={textStyles.caption}
                    color={filters.type === filter.key ? colors.white[500] : colors.gray[600]}
                    fontWeight={filters.type === filter.key ? '600' : '400'}
                  >
                    {filter.label}
                  </Text>
                </HStack>
              </Box>
            </Pressable>
          ))}
        </HStack>
      )}

      {/* Content */}
      {isLoading ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" color={colors.primary[500]} />
          <Text style={textStyles.body} color={colors.gray[600]} mt={2}>
            Loading {viewMode}...
          </Text>
        </Box>
      ) : viewMode === 'photos' ? (
        <PhotoGrid
          photos={getFilteredPhotos()}
          selectedPhotos={selectedPhotos}
          onPhotoPress={handlePhotoPress}
          onPhotoLongPress={handlePhotoLongPress}
        />
      ) : (
        <AlbumList
          albums={albums}
          onAlbumPress={handleAlbumPress}
        />
      )}

      {/* Upload FAB */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="lg"
        icon={<FabIcon as={IconMC} name="camera" />}
        label={<FabLabel>Upload</FabLabel>}
        onPress={() => {
          Alert.alert('Upload', 'Photo upload feature coming soon!');
        }}
        bg={colors.primary[500]}
        _pressed={{ bg: colors.primary[600] }}
      />

      {/* Photo Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack space={3} alignItems="center">
              <Icon as={IconMC} name="image" size={5} color={colors.primary[500]} />
              <VStack flex={1}>
                <Text style={textStyles.h3} color={textColor}>
                  {selectedAlbum?.name}
                </Text>
                <Text style={textStyles.caption} color={colors.gray[600]}>
                  {selectedAlbum && formatDate(selectedAlbum.createdAt)}
                </Text>
              </VStack>
              <HStack space={2}>
                <IconButton
                  icon={<Icon as={IconMC} name={selectedAlbum?.isShared ? 'share' : 'share-outline'} size={5} />}
                  onPress={() => {/* TODO: Toggle share */}}
                  variant="ghost"
                  colorScheme="primary"
                />
                <IconButton
                  icon={<Icon as={IconMC} name="delete" size={5} />}
                  onPress={() => selectedAlbum && handleDeletePhoto(selectedAlbum.id)}
                  variant="ghost"
                  colorScheme="red"
                />
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {selectedAlbum && (
              <VStack space={4}>
                <Text style={textStyles.body} color={textColor}>
                  {selectedAlbum.description}
                </Text>
                
                <VStack space={2}>
                  <HStack space={4}>
                    <VStack>
                      <Text style={textStyles.caption} color={colors.gray[600]}>
                        Created
                      </Text>
                      <Text style={textStyles.body} color={textColor}>
                        {formatDate(selectedAlbum.createdAt)}
                      </Text>
                    </VStack>
                    <VStack>
                      <Text style={textStyles.caption} color={colors.gray[600]}>
                        Updated
                      </Text>
                      <Text style={textStyles.body} color={textColor}>
                        {formatDate(selectedAlbum.updatedAt)}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {selectedAlbum.isShared && (
                    <Text style={textStyles.caption} color={colors.primary[500]}>
                      Shared with Circle
                    </Text>
                  )}
                </VStack>
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
                  Alert.alert('View Album', 'Album view feature coming soon!');
                }}
              >
                View Photos
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Album Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text style={textStyles.h3} color={textColor}>
              Create Album
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Album Name</Text>
                </FormControl.Label>
                <Input
                  value={albumForm.name}
                  onChangeText={(text) => setAlbumForm(prev => ({ ...prev, name: text }))}
                  placeholder="Enter album name"
                  size="lg"
                  borderRadius={12}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Description (Optional)</Text>
                </FormControl.Label>
                <Input
                  value={albumForm.description}
                  onChangeText={(text) => setAlbumForm(prev => ({ ...prev, description: text }))}
                  placeholder="Enter description"
                  size="lg"
                  borderRadius={12}
                  multiline
                  numberOfLines={3}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Share with Circle</Text>
                </FormControl.Label>
                <Switch
                  isChecked={albumForm.isShared}
                  onToggle={(value) => setAlbumForm(prev => ({ ...prev, isShared: value }))}
                  colorScheme="primary"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space={3}>
              <Button variant="ghost" onPress={onUploadClose}>
                Cancel
              </Button>
              <Button
                onPress={handleSaveAlbum}
                isLoading={isLoading}
                bg={colors.primary[500]}
                _pressed={{ bg: colors.primary[600] }}
              >
                Create Album
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GalleryApp; 
