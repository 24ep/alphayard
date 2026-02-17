import React, { useEffect, useState } from 'react';
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
  ScrollView,
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
import { Photo, Album, GalleryStats } from '../../types/gallery';
import { galleryService } from '../../services/gallery/GalleryService';

interface GalleryAppProps {
  mode?: 'personal' | 'circle';
  circleId?: string;
  onPhotoPress?: (photo: Photo) => void;
  onAlbumPress?: (album: Album) => void;
  showHeader?: boolean;
  embedded?: boolean;
}

const GalleryApp: React.FC<GalleryAppProps> = ({
  mode = 'circle',
  circleId: propCircleId,
  onPhotoPress,
  onAlbumPress,
  showHeader = true,
  embedded = false,
}) => {
  const { user } = useAuth();
  const { currentCircle } = useCircle();
  const {
    photos,
    albums,
    selectedPhotos,
    selectedAlbum,
    currentAlbumPath,
    isLoading,
    error,
    filters,
    viewMode,
    stats,
    setMode,
    loadPhotos,
    loadAlbums,
    loadPersonalPhotos,
    loadPersonalAlbums,
    loadCirclePhotos,
    loadCircleAlbums,
    loadStats,
    createAlbum,
    deletePhoto,
    deleteAlbum,
    updateAlbum,
    toggleFavorite,
    moveToAlbum,
    setAlbumCover,
    togglePhotoSelection,
    selectAll,
    updateFilters,
    setViewMode,
    clearSelection,
    navigateToAlbum,
    navigateUp,
    refresh,
  } = useGallery();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlbumOpen, onOpen: onAlbumOpen, onClose: onAlbumClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const cardBgColor = useColorModeValue(colors.gray[50], colors.gray[700]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  const circleId = propCircleId || currentCircle?.id || '';
  const isPersonalMode = mode === 'personal';

  // Form state
  const [albumForm, setAlbumForm] = React.useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isShared: !isPersonalMode,
  });
  
  // Gallery stats
  const [galleryStats, setGalleryStats] = useState<GalleryStats | null>(null);

  // Initialize gallery mode
  useEffect(() => {
    setMode(mode, mode === 'circle' ? circleId : undefined);
  }, [mode, circleId, setMode]);

  // Load data based on mode
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isPersonalMode) {
          await Promise.all([
            loadPersonalPhotos(),
            loadPersonalAlbums(),
          ]);
          const stats = await galleryService.getGalleryStats();
          setGalleryStats(stats);
        } else if (circleId) {
          await Promise.all([
            loadCirclePhotos(circleId),
            loadCircleAlbums(circleId),
          ]);
          const stats = await galleryService.getGalleryStats(circleId);
          setGalleryStats(stats);
        }
      } catch (err) {
        console.error('[GalleryApp] Error loading data:', err);
      }
    };
    
    loadData();
  }, [isPersonalMode, circleId, loadPersonalPhotos, loadPersonalAlbums, loadCirclePhotos, loadCircleAlbums]);

  // Reload data when filters change
  useEffect(() => {
    if (isPersonalMode) {
      loadPersonalPhotos();
    } else if (circleId) {
      loadCirclePhotos(circleId);
    }
  }, [filters, isPersonalMode, circleId]);

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
    navigateToAlbum(album);
    onAlbumPress?.(album);
  };

  const handleCreateAlbum = () => {
    setAlbumForm({
      name: '',
      description: '',
      color: '#3B82F6',
      isShared: !isPersonalMode,
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
        color: albumForm.color,
        isShared: albumForm.isShared,
        circleId: isPersonalMode ? undefined : circleId,
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

  const handleToggleFavorite = async (photoId: string) => {
    try {
      await toggleFavorite(photoId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleMoveToAlbum = async (photoId: string, albumId: string | null) => {
    try {
      await moveToAlbum(photoId, albumId);
      Alert.alert('Success', 'Photo moved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to move photo');
    }
  };

  const handleSetAlbumCover = async (albumId: string, photoId: string) => {
    try {
      await setAlbumCover(albumId, photoId);
      Alert.alert('Success', 'Album cover updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to set album cover');
    }
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
      case 'photos':
        // Assuming we need to filter by mimeType or similar for just images
        filtered = photos;
        break;
      case 'videos':
        // Filter for videos
        filtered = photos; // Add actual filter logic
        break;
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = photos.filter(photo => new Date(photo.createdAt) >= weekAgo);
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
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderBreadcrumb = () => {
    if (currentAlbumPath.length === 0) return null;
    
    return (
      <HStack space={2} alignItems="center" px={4} py={2} bg={cardBgColor}>
        <Pressable onPress={() => navigateToAlbum(null)}>
          <Icon as={IconMC} name="home" size={5} color={colors.primary[500]} />
        </Pressable>
        {currentAlbumPath.map((album, index) => (
          <React.Fragment key={album.id}>
            <Icon as={IconMC} name="chevron-right" size={4} color={colors.gray[400]} />
            <Pressable 
              onPress={() => {
                // Navigate to this level
                for (let i = currentAlbumPath.length - 1; i > index; i--) {
                  navigateUp();
                }
              }}
            >
              <Text 
                style={textStyles.body} 
                color={index === currentAlbumPath.length - 1 ? colors.primary[500] : textColor}
                fontWeight={index === currentAlbumPath.length - 1 ? '600' : '400'}
              >
                {album.name}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}
      </HStack>
    );
  };

  const renderStats = () => {
    if (!galleryStats) return null;
    
    return (
      <HStack space={4} px={4} py={3} justifyContent="space-around">
        <VStack alignItems="center">
          <Text style={textStyles.h3} color={textColor}>{galleryStats.totalPhotos}</Text>
          <Text style={textStyles.caption} color={colors.gray[500]}>Photos</Text>
        </VStack>
        <VStack alignItems="center">
          <Text style={textStyles.h3} color={textColor}>{galleryStats.totalVideos}</Text>
          <Text style={textStyles.caption} color={colors.gray[500]}>Videos</Text>
        </VStack>
        <VStack alignItems="center">
          <Text style={textStyles.h3} color={textColor}>{galleryStats.albumCount}</Text>
          <Text style={textStyles.caption} color={colors.gray[500]}>Albums</Text>
        </VStack>
        <VStack alignItems="center">
          <Text style={textStyles.h3} color={textColor}>{galleryStats.favoriteCount}</Text>
          <Text style={textStyles.caption} color={colors.gray[500]}>Favorites</Text>
        </VStack>
      </HStack>
    );
  };

  const filterOptions = isPersonalMode
    ? [
        { key: 'all', label: 'All', icon: 'image-multiple' },
        { key: 'favorites', label: 'Favorites', icon: 'star' },
        { key: 'recent', label: 'Recent', icon: 'clock-outline' },
      ]
    : [
        { key: 'all', label: 'All', icon: 'image-multiple' },
        { key: 'favorites', label: 'Favorites', icon: 'star' },
        { key: 'shared', label: 'Shared', icon: 'share' },
      ];

  return (
    <Box flex={1}>
      {/* Header */}
      {showHeader && (
        <GalleryHeader
          title={isPersonalMode ? 'My Gallery' : 'Circle Gallery'}
          photoCount={photos.length}
          albumCount={albums.length}
          onAddPress={handleCreateAlbum}
          onMenuPress={() => {/* TODO: Open gallery options */}}
        />
      )}

      {/* Stats Section */}
      {renderStats()}

      {/* Breadcrumb Navigation */}
      {renderBreadcrumb()}

      {/* View Mode Toggle */}
      <HStack justifyContent="space-between" alignItems="center" px={4} py={2}>
        <HStack space={2}>
          <Pressable onPress={() => setViewMode('photos')}>
            <Box
              bg={viewMode === 'photos' ? colors.primary[500] : cardBgColor}
              px={3}
              py={1}
              borderRadius={8}
            >
              <Text
                style={textStyles.caption}
                color={viewMode === 'photos' ? colors.white[500] : textColor}
                fontWeight="600"
              >
                Photos
              </Text>
            </Box>
          </Pressable>
          <Pressable onPress={() => setViewMode('albums')}>
            <Box
              bg={viewMode === 'albums' ? colors.primary[500] : cardBgColor}
              px={3}
              py={1}
              borderRadius={8}
            >
              <Text
                style={textStyles.caption}
                color={viewMode === 'albums' ? colors.white[500] : textColor}
                fontWeight="600"
              >
                Albums
              </Text>
            </Box>
          </Pressable>
        </HStack>
        
        {selectedPhotos.length > 0 && (
          <HStack space={2} alignItems="center">
            <Text style={textStyles.caption} color={colors.primary[500]}>
              {selectedPhotos.length} selected
            </Text>
            <IconButton
              icon={<Icon as={IconMC} name="close" size={5} />}
              onPress={clearSelection}
              variant="ghost"
              size="sm"
            />
          </HStack>
        )}
      </HStack>

      {/* Filter Tabs */}
      {viewMode === 'photos' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={2} mb={4} px={4}>
            {filterOptions.map((filter) => (
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
        </ScrollView>
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

              {!isPersonalMode && (
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
              )}

              {/* Color Selection */}
              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Album Color</Text>
                </FormControl.Label>
                <HStack space={2} flexWrap="wrap">
                  {['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setAlbumForm(prev => ({ ...prev, color }))}
                    >
                      <Box
                        w={10}
                        h={10}
                        bg={color}
                        borderRadius="full"
                        borderWidth={albumForm.color === color ? 3 : 0}
                        borderColor={colors.gray[800]}
                      />
                    </Pressable>
                  ))}
                </HStack>
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
