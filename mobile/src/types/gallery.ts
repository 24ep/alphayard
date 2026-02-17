export interface Photo {
  id: string;
  uri: string;
  url?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  filename: string;
  originalName?: string;
  title?: string;
  description?: string;
  size: number;
  width: number;
  height: number;
  mimeType?: string;
  fileType?: string;
  createdAt: Date;
  updatedAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  metadata?: {
    camera?: string;
    settings?: any;
    tags?: string[];
    width?: number;
    height?: number;
    location?: any;
  };
  uploadedBy: string;
  uploaderName?: string;
  circleId?: string;
  albumId?: string;
  folderId?: string;
  isShared: boolean;
  isFavorite: boolean;
  isPinned?: boolean;
  isSelected?: boolean;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  coverImage?: string; // For backward compatibility
  coverPhotoUrl?: string;
  color?: string;
  icon?: string;
  photoCount: number;
  mediaCount?: number;
  totalSize?: number;
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;
  createdBy: string;
  circleId?: string;
  parentId?: string;
  isShared: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  members?: string[];
  date?: string; // For backward compatibility
}

export interface GalleryFilters {
  type: 'all' | 'photos' | 'videos' | 'favorites' | 'shared' | 'recent';
  searchQuery: string;
  albumId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'created_at' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface GalleryState {
  // Gallery mode: personal or circle
  mode: 'personal' | 'circle';
  circleId?: string;
  
  // Data
  photos: Photo[];
  albums: Album[];
  selectedPhotos: string[];
  selectedAlbum: Album | null;
  currentAlbumPath: Album[]; // Breadcrumb path
  
  // UI State
  isLoading: boolean;
  error: string | null;
  filters: GalleryFilters;
  viewMode: 'photos' | 'albums' | 'grid' | 'list';
  
  // Stats
  stats?: GalleryStats;
}

export interface GalleryStats {
  totalPhotos: number;
  totalVideos: number;
  totalSize: number;
  albumCount: number;
  favoriteCount: number;
  recentCount: number;
}

export interface GalleryActions {
  // Mode management
  setMode: (mode: 'personal' | 'circle', circleId?: string) => void;
  
  // Loading
  loadPhotos: (circleId?: string) => Promise<void>;
  loadAlbums: (circleId?: string) => Promise<void>;
  loadPersonalPhotos: () => Promise<void>;
  loadPersonalAlbums: () => Promise<void>;
  loadCirclePhotos: (circleId: string) => Promise<void>;
  loadCircleAlbums: (circleId: string) => Promise<void>;
  loadStats: () => Promise<void>;
  
  // CRUD Operations
  uploadPhoto: (photoData: Partial<Photo>) => Promise<void>;
  createAlbum: (albumData: Partial<Album>) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  deleteAlbum: (albumId: string) => Promise<void>;
  updateAlbum: (albumId: string, updates: Partial<Album>) => Promise<void>;
  
  // Photo actions
  toggleFavorite: (photoId: string) => Promise<void>;
  moveToAlbum: (photoId: string, albumId: string | null) => Promise<void>;
  setAlbumCover: (albumId: string, photoId: string) => Promise<void>;
  
  // Selection
  togglePhotoSelection: (photoId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Navigation
  navigateToAlbum: (album: Album | null) => void;
  navigateUp: () => void;
  
  // UI
  updateFilters: (filters: Partial<GalleryFilters>) => void;
  setViewMode: (mode: 'photos' | 'albums' | 'grid' | 'list') => void;
  refresh: () => Promise<void>;
}

export interface GalleryContextType extends GalleryState, GalleryActions {}

// API Response types
export interface GalleryPhotosResponse {
  success: boolean;
  photos: Photo[];
  total: number;
  error?: string;
}

export interface GalleryAlbumsResponse {
  success: boolean;
  albums: Album[];
  error?: string;
}

export interface GalleryStatsResponse {
  success: boolean;
  stats: GalleryStats;
  error?: string;
}
