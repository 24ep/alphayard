import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Alert } from 'react-native';
import { GalleryContextType, GalleryState, GalleryActions, Photo, Album, GalleryFilters } from '../types/gallery';
import { galleryService } from '../services/gallery/GalleryService';

// Initial state
const initialState: GalleryState = {
  photos: [],
  albums: [],
  selectedPhotos: [],
  selectedAlbum: null,
  isLoading: false,
  error: null,
  filters: {
    type: 'all',
    searchQuery: '',
  },
  viewMode: 'photos',
};

// Action types
type GalleryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PHOTOS'; payload: Photo[] }
  | { type: 'SET_ALBUMS'; payload: Album[] }
  | { type: 'ADD_PHOTO'; payload: Photo }
  | { type: 'UPDATE_PHOTO'; payload: Photo }
  | { type: 'DELETE_PHOTO'; payload: string }
  | { type: 'ADD_ALBUM'; payload: Album }
  | { type: 'UPDATE_ALBUM'; payload: Album }
  | { type: 'DELETE_ALBUM'; payload: string }
  | { type: 'TOGGLE_PHOTO_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTED_ALBUM'; payload: Album | null }
  | { type: 'UPDATE_FILTERS'; payload: Partial<GalleryFilters> }
  | { type: 'SET_VIEW_MODE'; payload: 'photos' | 'albums' };

// Reducer
const galleryReducer = (state: GalleryState, action: GalleryAction): GalleryState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PHOTOS':
      return { ...state, photos: action.payload };
    case 'SET_ALBUMS':
      return { ...state, albums: action.payload };
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
      };
    case 'DELETE_ALBUM':
      return {
        ...state,
        albums: state.albums.filter(album => album.id !== action.payload),
      };
    case 'TOGGLE_PHOTO_SELECTION':
      return {
        ...state,
        selectedPhotos: state.selectedPhotos.includes(action.payload)
          ? state.selectedPhotos.filter(id => id !== action.payload)
          : [...state.selectedPhotos, action.payload],
      };
    case 'CLEAR_SELECTION':
      return { ...state, selectedPhotos: [] };
    case 'SET_SELECTED_ALBUM':
      return { ...state, selectedAlbum: action.payload };
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
  
  // For now, don't depend on AuthContext to avoid provider hierarchy issues
  const user = null;

    const loadPhotos = useCallback(async (familyId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const photos = await galleryService.getPhotos(familyId, state.filters);
        dispatch({ type: 'SET_PHOTOS', payload: photos });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load photos' });
        console.error('Error loading photos:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [state.filters]);

  const loadAlbums = useCallback(async (familyId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const albums = await galleryService.getAlbums(familyId);
      dispatch({ type: 'SET_ALBUMS', payload: albums });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load albums' });
      console.error('Error loading albums:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const uploadPhoto = useCallback(async (photoData: Partial<Photo>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const photo = await galleryService.uploadPhoto(photoData);
      dispatch({ type: 'ADD_PHOTO', payload: photo });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to upload photo' });
      console.error('Error uploading photo:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createAlbum = useCallback(async (albumData: Partial<Album>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const album = await galleryService.createAlbum(albumData);
      dispatch({ type: 'ADD_ALBUM', payload: album });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create album' });
      console.error('Error creating album:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deletePhoto = useCallback(async (photoId: string) => {
    try {
      await galleryService.deletePhoto(photoId);
      dispatch({ type: 'DELETE_PHOTO', payload: photoId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete photo' });
      console.error('Error deleting photo:', error);
      throw error;
    }
  }, []);

  const deleteAlbum = useCallback(async (albumId: string) => {
    try {
      await galleryService.deleteAlbum(albumId);
      dispatch({ type: 'DELETE_ALBUM', payload: albumId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete album' });
      console.error('Error deleting album:', error);
      throw error;
    }
  }, []);

  const toggleFavorite = useCallback(async (photoId: string) => {
    try {
      await galleryService.toggleFavorite(photoId);
      const updatedPhoto = state.photos.find(photo => photo.id === photoId);
      if (updatedPhoto) {
        const toggledPhoto = { ...updatedPhoto, isFavorite: !updatedPhoto.isFavorite };
        dispatch({ type: 'UPDATE_PHOTO', payload: toggledPhoto });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle favorite' });
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }, [state.photos]);

  const togglePhotoSelection = useCallback((photoId: string) => {
    dispatch({ type: 'TOGGLE_PHOTO_SELECTION', payload: photoId });
  }, []);

  const updateFilters = useCallback((filters: Partial<GalleryFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  }, []);

  const setViewMode = useCallback((mode: 'photos' | 'albums') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const value: GalleryContextType = {
    ...state,
    loadPhotos,
    loadAlbums,
    uploadPhoto,
    createAlbum,
    deletePhoto,
    deleteAlbum,
    toggleFavorite,
    togglePhotoSelection,
    updateFilters,
    setViewMode,
    clearSelection,
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