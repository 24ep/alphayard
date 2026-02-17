import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { galleryService, GalleryStats } from '../../services/gallery/GalleryService';
import { Photo, Album, GalleryFilters } from '../../types/gallery';

const { width } = Dimensions.get('window');
const GAP = 4;
const NUM_COLUMNS = 3;
const H_PADDING = 16;
const TILE_SIZE = Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS);

interface CircleGalleryTabProps {
  circleId: string;
  onPhotoPress?: (photo: Photo) => void;
  onAlbumPress?: (album: Album) => void;
}

export const CircleGalleryTab: React.FC<CircleGalleryTabProps> = ({
  circleId,
  onPhotoPress,
  onAlbumPress,
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'photos' | 'albums'>('photos');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'shared'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const loadData = useCallback(async () => {
    if (!circleId) return;
    
    try {
      const filters: Partial<GalleryFilters> = {
        type: filterType,
      };
      
      const [photosResult, albumsData, statsData] = await Promise.all([
        galleryService.getCirclePhotos(circleId, filters),
        galleryService.getCircleAlbums(circleId),
        galleryService.getGalleryStats(circleId),
      ]);

      setPhotos(photosResult.photos);
      setAlbums(albumsData);
      setStats(statsData);
    } catch (error) {
      console.error('[CircleGalleryTab] Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [circleId, filterType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePhotoPress = (photo: Photo) => {
    if (multiSelectMode) {
      togglePhotoSelection(photo.id);
    } else {
      setSelectedPhoto(photo);
      setShowLightbox(true);
      onPhotoPress?.(photo);
    }
  };

  const handlePhotoLongPress = (photo: Photo) => {
    setMultiSelectMode(true);
    togglePhotoSelection(photo.id);
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        const newSelection = prev.filter(id => id !== photoId);
        if (newSelection.length === 0) setMultiSelectMode(false);
        return newSelection;
      }
      return [...prev, photoId];
    });
  };

  const handleToggleFavorite = async (photoId: string) => {
    try {
      await galleryService.toggleFavorite(photoId);
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p
      ));
    } catch (error) {
      console.error('[CircleGalleryTab] Error toggling favorite:', error);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo from the circle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await galleryService.deletePhoto(photoId);
              setPhotos(prev => prev.filter(p => p.id !== photoId));
              setShowLightbox(false);
            } catch (error) {
              console.error('[CircleGalleryTab] Error deleting photo:', error);
            }
          },
        },
      ]
    );
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      Alert.alert('Error', 'Please enter an album name');
      return;
    }
    
    try {
      const album = await galleryService.createCircleAlbum(circleId, {
        name: newAlbumName.trim(),
      });
      setAlbums(prev => [album, ...prev]);
      setNewAlbumName('');
      setShowCreateAlbum(false);
      Alert.alert('Success', 'Album created successfully');
    } catch (error) {
      console.error('[CircleGalleryTab] Error creating album:', error);
      Alert.alert('Error', 'Failed to create album');
    }
  };

  const renderStatsBar = () => (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats?.totalPhotos || 0}</Text>
        <Text style={styles.statLabel}>Photos</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats?.totalVideos || 0}</Text>
        <Text style={styles.statLabel}>Videos</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats?.albumCount || 0}</Text>
        <Text style={styles.statLabel}>Albums</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats?.favoriteCount || 0}</Text>
        <Text style={styles.statLabel}>Favorites</Text>
      </View>
    </View>
  );

  const renderViewModeToggle = () => (
    <View style={styles.viewModeContainer}>
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'photos' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('photos')}
        >
          <MaterialCommunityIcons
            name="image-multiple"
            size={18}
            color={viewMode === 'photos' ? '#FFF' : '#6B7280'}
          />
          <Text style={[styles.viewModeText, viewMode === 'photos' && styles.viewModeTextActive]}>
            Photos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'albums' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('albums')}
        >
          <MaterialCommunityIcons
            name="folder-image"
            size={18}
            color={viewMode === 'albums' ? '#FFF' : '#6B7280'}
          />
          <Text style={[styles.viewModeText, viewMode === 'albums' && styles.viewModeTextActive]}>
            Albums
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        {multiSelectMode ? (
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>{selectedPhotos.length} selected</Text>
            <TouchableOpacity onPress={() => { setSelectedPhotos([]); setMultiSelectMode(false); }}>
              <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        ) : viewMode === 'albums' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateAlbum(true)}
          >
            <MaterialCommunityIcons name="folder-plus" size={20} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {[
        { key: 'all', label: 'All', icon: 'image-multiple' },
        { key: 'favorites', label: 'Favorites', icon: 'star' },
        { key: 'shared', label: 'Shared', icon: 'share' },
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[styles.filterTab, filterType === filter.key && styles.filterTabActive]}
          onPress={() => setFilterType(filter.key as any)}
        >
          <MaterialCommunityIcons
            name={filter.icon as any}
            size={16}
            color={filterType === filter.key ? '#FFF' : '#6B7280'}
          />
          <Text style={[styles.filterTabText, filterType === filter.key && styles.filterTabTextActive]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPhotoItem = ({ item }: { item: Photo }) => {
    const isSelected = selectedPhotos.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.photoItem, isSelected && styles.photoItemSelected]}
        activeOpacity={0.8}
        onPress={() => handlePhotoPress(item)}
        onLongPress={() => handlePhotoLongPress(item)}
      >
        <Image
          source={{ uri: item.thumbnail || item.uri }}
          style={styles.photoImage}
          resizeMode="cover"
        />
        
        {/* Video indicator */}
        {item.mimeType?.startsWith('video') && (
          <View style={styles.videoIndicator}>
            <MaterialCommunityIcons name="play-circle" size={24} color="#FFF" />
          </View>
        )}
        
        {/* Favorite indicator */}
        {item.isFavorite && (
          <View style={styles.favoriteIndicator}>
            <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
          </View>
        )}
        
        {/* Uploader badge */}
        {item.uploaderName && (
          <View style={styles.uploaderBadge}>
            <Text style={styles.uploaderText} numberOfLines={1}>
              {item.uploaderName}
            </Text>
          </View>
        )}
        
        {/* Selection checkbox */}
        {multiSelectMode && (
          <View style={[styles.selectionCheckbox, isSelected && styles.selectionCheckboxSelected]}>
            {isSelected && <MaterialCommunityIcons name="check" size={14} color="#FFF" />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumItem}
      activeOpacity={0.8}
      onPress={() => onAlbumPress?.(item)}
    >
      <View style={[styles.albumCover, { backgroundColor: item.color || '#E5E7EB' }]}>
        {item.coverPhoto ? (
          <Image source={{ uri: item.coverPhoto }} style={styles.albumCoverImage} />
        ) : (
          <MaterialCommunityIcons name="folder-image" size={40} color="#FFF" />
        )}
        
        {/* Shared indicator */}
        <View style={styles.sharedBadge}>
          <MaterialCommunityIcons name="account-group" size={14} color="#FFF" />
        </View>
      </View>
      <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.albumCount}>{item.photoCount} items</Text>
    </TouchableOpacity>
  );

  const renderLightbox = () => (
    <Modal
      visible={showLightbox}
      animationType="fade"
      transparent
      onRequestClose={() => setShowLightbox(false)}
    >
      <View style={styles.lightboxContainer}>
        {/* Header */}
        <View style={styles.lightboxHeader}>
          <TouchableOpacity
            style={styles.lightboxButton}
            onPress={() => setShowLightbox(false)}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.lightboxActions}>
            <TouchableOpacity
              style={styles.lightboxButton}
              onPress={() => selectedPhoto && handleToggleFavorite(selectedPhoto.id)}
            >
              <MaterialCommunityIcons
                name={selectedPhoto?.isFavorite ? 'star' : 'star-outline'}
                size={24}
                color={selectedPhoto?.isFavorite ? '#F59E0B' : '#FFF'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.lightboxButton}>
              <MaterialCommunityIcons name="share-variant" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.lightboxButton}>
              <MaterialCommunityIcons name="download" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.lightboxButton}
              onPress={() => selectedPhoto && handleDeletePhoto(selectedPhoto.id)}
            >
              <MaterialCommunityIcons name="delete-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Image */}
        {selectedPhoto && (
          <Image
            source={{ uri: selectedPhoto.uri }}
            style={styles.lightboxImage}
            resizeMode="contain"
          />
        )}
        
        {/* Info */}
        {selectedPhoto && (
          <View style={styles.lightboxInfo}>
            <Text style={styles.lightboxTitle}>{selectedPhoto.title || selectedPhoto.filename}</Text>
            <Text style={styles.lightboxDate}>
              {new Date(selectedPhoto.createdAt).toLocaleDateString()}
            </Text>
            {selectedPhoto.uploaderName && (
              <Text style={styles.lightboxUploader}>
                Uploaded by {selectedPhoto.uploaderName}
              </Text>
            )}
          </View>
        )}
      </View>
    </Modal>
  );

  const renderCreateAlbumModal = () => (
    <Modal
      visible={showCreateAlbum}
      animationType="slide"
      transparent
      onRequestClose={() => setShowCreateAlbum(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Album</Text>
          
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="folder" size={20} color="#6B7280" />
            <Text style={styles.inputLabel}>Album Name</Text>
          </View>
          
          <View style={styles.textInputWrapper}>
            <Text 
              style={styles.textInput}
              onPress={() => {
                // In real implementation, this would be a TextInput
              }}
            >
              {newAlbumName || 'Enter album name'}
            </Text>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowCreateAlbum(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateAlbum}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name={viewMode === 'photos' ? 'image-off-outline' : 'folder-open-outline'}
        size={64}
        color="#D1D5DB"
      />
      <Text style={styles.emptyTitle}>
        {viewMode === 'photos' ? 'No Circle Photos Yet' : 'No Circle Albums Yet'}
      </Text>
      <Text style={styles.emptyDescription}>
        {viewMode === 'photos'
          ? 'Share photos with your circle members'
          : 'Create a shared album to collect circle memories'}
      </Text>
    </View>
  );

  if (!circleId) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="account-group-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Circle Selected</Text>
        <Text style={styles.emptyDescription}>Select a circle to view shared photos</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading circle gallery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStatsBar()}
      {renderViewModeToggle()}
      {viewMode === 'photos' && renderFilterTabs()}
      
      {viewMode === 'photos' ? (
        photos.length > 0 ? (
          <FlatList
            data={photos}
            keyExtractor={(item) => item.id}
            renderItem={renderPhotoItem}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.photoGrid}
            columnWrapperStyle={styles.photoRow}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )
      ) : (
        albums.length > 0 ? (
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={renderAlbumItem}
            numColumns={2}
            contentContainerStyle={styles.albumGrid}
            columnWrapperStyle={styles.albumRow}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )
      )}
      
      {renderLightbox()}
      {renderCreateAlbumModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  addButton: {
    padding: 8,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  photoGrid: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 100,
  },
  photoRow: {
    gap: GAP,
    marginBottom: GAP,
  },
  photoItem: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photoItemSelected: {
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  favoriteIndicator: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 2,
  },
  uploaderBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  uploaderText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectionCheckbox: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  albumGrid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  albumRow: {
    gap: 12,
    marginBottom: 12,
  },
  albumItem: {
    flex: 1,
    maxWidth: (width - 32 - 12) / 2,
  },
  albumCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCoverImage: {
    width: '100%',
    height: '100%',
  },
  sharedBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  albumCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  lightboxButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  lightboxActions: {
    flexDirection: 'row',
    gap: 8,
  },
  lightboxImage: {
    flex: 1,
    width: '100%',
  },
  lightboxInfo: {
    padding: 20,
    alignItems: 'center',
  },
  lightboxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lightboxDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  lightboxUploader: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: width - 48,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  textInputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  textInput: {
    fontSize: 16,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CircleGalleryTab;
