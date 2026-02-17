import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  GalleryContextType, 
  GalleryState, 
  Photo, 
  Album, 
  GalleryFilters,
  GalleryStats 
} from '../types/gallery';
import { galleryService } from '../services/gallery/GalleryService';

// Initial state
const initialState: GalleryState = {
  mode: 'personal',
  circleId: undefined,
  photos: [],
  albums: [],
  selectedPhotos: [],
  selectedAlbum: null,
  currentAlbumPath: [],
  isLoading: false,
  error: null,
  filters: {
    type: 'all',
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  viewMode: 'photos',
  stats: undefined
};

// Action types
type GalleryAction =
  | { type: 'SET_MODE'; payload: { mode: 'personal' | 'circle'; circleId?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PHOTOS'; payload: Photo[] }
  | { type: 'SET_ALBUMS'; payload: Album[] }
  | { type: 'SET_STATS'; payload: GalleryStats }
  | { type: 'ADD_PHOTO'; payload: Photo }
  | { type: 'UPDATE_PHOTO'; payload: Photo }
  | { type: 'DELETE_PHOTO'; payload: string }
  | { type: 'ADD_ALBUM'; payload: Album }
  | { type: 'UPDATE_ALBUM'; payload: Album }
  | { type: 'DELETE_ALBUM'; payload: string }
  | { type: 'TOGGLE_PHOTO_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_PHOTOS' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTED_ALBUM'; payload: Album | null }
  | { type: 'PUSH_ALBUM_PATH'; payload: Album }
  | { type: 'POP_ALBUM_PATH' }
  | { type: 'RESET_ALBUM_PATH' }
  | { type: 'UPDATE_FILTERS'; payload: Partial<GalleryFilters> }
  | { type: 'SET_VIEW_MODE'; payload: 'photos' | 'albums' | 'grid' | 'list' };

// Reducer
const galleryReducer = (state: GalleryState, action: GalleryAction): GalleryState => {
  switch (action.type) {
    case 'SET_MODE':
      return { 
        ...state, 
        mode: action.payload.mode, 
        circleId: action.payload.circleId,
        photos: [],
        albums: [],
        selectedPhotos: [],
        selectedAlbum: null,
        currentAlbumPath: []
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PHOTOS':
      return { ...state, photos: action.payload };
    case 'SET_ALBUMS':
      return { ...state, albums: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'ADD_PHOTO':
      return { ...state, photos: [action.payload, ...state.photos] };
    case 'UPDATE_PHOTO':
      return {
        ...state,
        photos: state.photos.map(photo =>
          photo.id === action.payload.id ? action.payload : photo
        ),
      };
    case 'DELETE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter(photo => photo.id !== action.payload),
        selectedPhotos: state.selectedPhotos.filter(id => id !== action.payload),
      };
    case 'ADD_ALBUM':
      return { ...state, albums: [action.payload, ...state.albums] };
    case 'UPDATE_ALBUM':
      return {
        ...state,
        albums: state.albums.map(album =>
          album.id === action.payload.id ? action.payload : album
        ),
        selectedAlbum: state.selectedAlbum?.id === action.payload.id 
          ? action.payload 
          : state.selectedAlbum
      };
    case 'DELETE_ALBUM':
      return {
        ...state,
        albums: state.albums.filter(album => album.id !== action.payload),
        selectedAlbum: state.selectedAlbum?.id === action.payload ? null : state.selectedAlbum
      };
    case 'TOGGLE_PHOTO_SELECTION':
      return {
        ...state,
        selectedPhotos: state.selectedPhotos.includes(action.payload)
          ? state.selectedPhotos.filter(id => id !== action.payload)
          : [...state.selectedPhotos, action.payload],
      };
    case 'SELECT_ALL_PHOTOS':
      return {
        ...state,
        selectedPhotos: state.photos.map(p => p.id)
      };
    case 'CLEAR_SELECTION':
      return { ...state, selectedPhotos: [] };
    case 'SET_SELECTED_ALBUM':
      return { ...state, selectedAlbum: action.payload };
    case 'PUSH_ALBUM_PATH':
      return { 
        ...state, 
        currentAlbumPath: [...state.currentAlbumPath, action.payload],
        selectedAlbum: action.payload
      };
    case 'POP_ALBUM_PATH':
      const newPath = state.currentAlbumPath.slice(0, -1);
      return { 
        ...state, 
        currentAlbumPath: newPath,
        selectedAlbum: newPath.length > 0 ? newPath[newPath.length - 1] : null
      };
    case 'RESET_ALBUM_PATH':
      return { ...state, currentAlbumPath: [], selectedAlbum: null };
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    default:
      return state;
  }
};

// Create context
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// Provider component
export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(galleryReducer, initialState);

  // Mode management
  const setMode = useCallback((mode: 'personal' | 'circle', circleId?: string) => {
    dispatch({ type: 'SET_MODE', payload: { mode, circleId } });
  }, []);

  // Load personal photos
  const loadPersonalPhotos = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const filters: Partial<GalleryFilters> = {
        ...state.filters,
        albumId: state.selectedAlbum?.id
      };
      
      const result = await galleryService.getPersonalPhotos(filters);
      dispatch({ type: 'SET_PHOTOS', payload: result.photos });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load personal photos' });
      console.error('[GalleryContext] Error loading personal photos:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters, state.selectedAlbum]);

  // Load personal albums
  const loadPersonalAlbums = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const albums = await galleryService.getPersonalAlbums(state.selectedAlbum?.id);
      dispatch({ type: 'SET_ALBUMS', payload: albums });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load personal albums' });
      console.error('[GalleryContext] Error loading personal albums:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.selectedAlbum]);

  // Load circle photos
  const loadCirclePhotos = useCallback(async (circleId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const filters: Partial<GalleryFilters> = {
        ...state.filters,
        albumId: state.selectedAlbum?.id
      };
      
      const result = await galleryService.getCirclePhotos(circleId, filters);
      dispatch({ type: 'SET_PHOTOS', payload: result.photos });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load circle photos' });
      console.error('[GalleryContext] Error loading circle photos:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters, state.selectedAlbum]);

  // Load circle albums
  const loadCircleAlbums = useCallback(async (circleId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const albums = await galleryService.getCircleAlbums(circleId, state.selectedAlbum?.id);
      dispatch({ type: 'SET_ALBUMS', payload: albums });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load circle albums' });
      console.error('[GalleryContext] Error loading circle albums:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.selectedAlbum]);

  // Legacy load methods (backwards compatible)
  const loadPhotos = useCallback(async (circleId?: string) => {
    if (circleId) {
      await loadCirclePhotos(circleId);
    } else if (state.mode === 'circle' && state.circleId) {
      await loadCirclePhotos(state.circleId);
    } else {
      await loadPersonalPhotos();
    }
  }, [state.mode, state.circleId, loadCirclePhotos, loadPersonalPhotos]);

  const loadAlbums = useCallback(async (circleId?: string) => {
    if (circleId) {
      await loadCircleAlbums(circleId);
    } else if (state.mode === 'circle' && state.circleId) {
      await loadCircleAlbums(state.circleId);
    } else {
      await loadPersonalAlbums();
    }
  }, [state.mode, state.circleId, loadCircleAlbums, loadPersonalAlbums]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const circleId = state.mode === 'circle' ? state.circleId : undefined;
      const stats = await galleryService.getGalleryStats(circleId);
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      console.error('[GalleryContext] Error loading stats:', error);
    }
  }, [state.mode, state.circleId]);

  // Upload photo
  const uploadPhoto = useCallback(async (photoData: Partial<Photo>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const photo = await galleryService.uploadPhoto(photoData);
      dispatch({ type: 'ADD_PHOTO', payload: photo });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to upload photo' });
      console.error('[GalleryContext] Error uploading photo:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Create album
  const createAlbum = useCallback(async (albumData: Partial<Album>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      let album: Album;
      if (state.mode === 'circle' && state.circleId) {
        album = await galleryService.createCircleAlbum(state.circleId, {
          name: albumData.name!,
          description: albumData.description,
          parentId: state.selectedAlbum?.id,
          color: albumData.color
        });
      } else {
        album = await galleryService.createPersonalAlbum({
          name: albumData.name!,
          description: albumData.description,
          parentId: state.selectedAlbum?.id,
          color: albumData.color
        });
      }
      
      dispatch({ type: 'ADD_ALBUM', payload: album });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create album' });
      console.error('[GalleryContext] Error creating album:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.mode, state.circleId, state.selectedAlbum]);

  // Delete photo
  const deletePhoto = useCallback(async (photoId: string) => {
    try {
      await galleryService.deletePhoto(photoId);
      dispatch({ type: 'DELETE_PHOTO', payload: photoId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete photo' });
      console.error('[GalleryContext] Error deleting photo:', error);
      throw error;
    }
  }, []);

  // Delete album
  const deleteAlbum = useCallback(async (albumId: string) => {
    try {
      await galleryService.deleteAlbum(albumId);
      dispatch({ type: 'DELETE_ALBUM', payload: albumId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete album' });
      console.error('[GalleryContext] Error deleting album:', error);
      throw error;
    }
  }, []);

  // Update album
  const updateAlbum = useCallback(async (albumId: string, updates: Partial<Album>) => {
    try {
      const album = await galleryService.updateAlbum(albumId, updates);
      dispatch({ type: 'UPDATE_ALBUM', payload: album });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update album' });
      console.error('[GalleryContext] Error updating album:', error);
      throw error;
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (photoId: string) => {
    try {
      const isFavorite = await galleryService.toggleFavorite(photoId);
      const updatedPhoto = state.photos.find(photo => photo.id === photoId);
      if (updatedPhoto) {
        dispatch({ type: 'UPDATE_PHOTO', payload: { ...updatedPhoto, isFavorite } });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle favorite' });
      console.error('[GalleryContext] Error toggling favorite:', error);
      throw error;
    }
  }, [state.photos]);

  // Move to album
  const moveToAlbum = useCallback(async (photoId: string, albumId: string | null) => {
    try {
      const photo = await galleryService.movePhotoToAlbum(photoId, albumId);
      dispatch({ type: 'UPDATE_PHOTO', payload: photo });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to move photo' });
      console.error('[GalleryContext] Error moving photo:', error);
      throw error;
    }
  }, []);

  // Set album cover
  const setAlbumCover = useCallback(async (albumId: string, photoId: string) => {
    try {
      await galleryService.setAlbumCover(albumId, photoId);
      // Refresh albums to get updated cover
      await loadAlbums();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to set album cover' });
      console.error('[GalleryContext] Error setting album cover:', error);
      throw error;
    }
  }, [loadAlbums]);

  // Selection
  const togglePhotoSelection = useCallback((photoId: string) => {
    dispatch({ type: 'TOGGLE_PHOTO_SELECTION', payload: photoId });
  }, []);

  const selectAll = useCallback(() => {
    dispatch({ type: 'SELECT_ALL_PHOTOS' });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  // Navigation
  const navigateToAlbum = useCallback((album: Album | null) => {
    if (album) {
      dispatch({ type: 'PUSH_ALBUM_PATH', payload: album });
    } else {
      dispatch({ type: 'RESET_ALBUM_PATH' });
    }
  }, []);

  const navigateUp = useCallback(() => {
    dispatch({ type: 'POP_ALBUM_PATH' });
  }, []);

  // UI
  const updateFilters = useCallback((filters: Partial<GalleryFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  }, []);

  const setViewMode = useCallback((mode: 'photos' | 'albums' | 'grid' | 'list') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await Promise.all([
      loadPhotos(),
      loadAlbums(),
      loadStats()
    ]);
  }, [loadPhotos, loadAlbums, loadStats]);

  const value: GalleryContextType = {
    ...state,
    setMode,
    loadPhotos,
    loadAlbums,
    loadPersonalPhotos,
    loadPersonalAlbums,
    loadCirclePhotos,
    loadCircleAlbums,
    loadStats,
    uploadPhoto,
    createAlbum,
    deletePhoto,
    deleteAlbum,
    updateAlbum,
    toggleFavorite,
    moveToAlbum,
    setAlbumCover,
    togglePhotoSelection,
    selectAll,
    clearSelection,
    navigateToAlbum,
    navigateUp,
    updateFilters,
    setViewMode,
    refresh
  };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};

// Hook to use gallery context
export const useGallery = (): GalleryContextType => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};
