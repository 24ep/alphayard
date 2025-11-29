export interface Photo {
  id: string;
  uri: string;
  thumbnail?: string;
  filename: string;
  title?: string;
  size: number;
  width: number;
  height: number;
  createdAt: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  metadata?: {
    camera?: string;
    settings?: any;
    tags?: string[];
  };
  uploadedBy: string;
  familyId: string;
  albumId?: string;
  isShared: boolean;
  isFavorite: boolean;
  isSelected?: boolean;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  coverImage?: string; // For backward compatibility
  photoCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  familyId: string;
  isShared: boolean;
  members: string[];
  date?: string; // For backward compatibility
}

export interface GalleryFilters {
  type: 'all' | 'favorites' | 'shared';
  searchQuery: string;
  albumId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface GalleryState {
  photos: Photo[];
  albums: Album[];
  selectedPhotos: string[];
  selectedAlbum: Album | null;
  isLoading: boolean;
  error: string | null;
  filters: GalleryFilters;
  viewMode: 'photos' | 'albums';
}

export interface GalleryActions {
  loadPhotos: (familyId: string) => Promise<void>;
  loadAlbums: (familyId: string) => Promise<void>;
  uploadPhoto: (photoData: Partial<Photo>) => Promise<void>;
  createAlbum: (albumData: Partial<Album>) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  deleteAlbum: (albumId: string) => Promise<void>;
  toggleFavorite: (photoId: string) => Promise<void>;
  togglePhotoSelection: (photoId: string) => void;
  updateFilters: (filters: Partial<GalleryFilters>) => void;
  setViewMode: (mode: 'photos' | 'albums') => void;
  clearSelection: () => void;
}

export interface GalleryContextType extends GalleryState, GalleryActions {} 