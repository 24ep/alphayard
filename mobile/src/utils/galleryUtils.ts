import { Photo, Album } from '../types/gallery';

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getPhotoDisplayName = (photo: Photo): string => {
  return photo.title || photo.filename || 'Untitled Photo';
};

export const getAlbumDisplayName = (album: Album): string => {
  return album.name || 'Untitled Album';
};

export const filterPhotosBySearch = (photos: Photo[], searchQuery: string): Photo[] => {
  if (!searchQuery.trim()) return photos;
  
  const query = searchQuery.toLowerCase();
  return photos.filter(photo =>
    photo.title?.toLowerCase().includes(query) ||
    photo.filename.toLowerCase().includes(query) ||
    photo.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
  );
};

export const filterAlbumsBySearch = (albums: Album[], searchQuery: string): Album[] => {
  if (!searchQuery.trim()) return albums;
  
  const query = searchQuery.toLowerCase();
  return albums.filter(album =>
    album.name.toLowerCase().includes(query) ||
    album.description?.toLowerCase().includes(query)
  );
};

export const sortPhotosByDate = (photos: Photo[], ascending: boolean = false): Photo[] => {
  return [...photos].sort((a, b) => {
    const comparison = a.createdAt.getTime() - b.createdAt.getTime();
    return ascending ? comparison : -comparison;
  });
};

export const sortAlbumsByDate = (albums: Album[], ascending: boolean = false): Album[] => {
  return [...albums].sort((a, b) => {
    const comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
    return ascending ? comparison : -comparison;
  });
};

export const getPhotoThumbnail = (photo: Photo): string => {
  return photo.thumbnail || photo.uri;
};

export const getAlbumCover = (album: Album): string => {
  return album.coverPhoto || album.coverImage || '';
};

export const calculateTotalSize = (photos: Photo[]): number => {
  return photos.reduce((total, photo) => total + photo.size, 0);
};

export const getPhotoCountByAlbum = (photos: Photo[], albumId: string): number => {
  return photos.filter(photo => photo.albumId === albumId).length;
};

export const getSharedPhotosCount = (photos: Photo[]): number => {
  return photos.filter(photo => photo.isShared).length;
};

export const getFavoritePhotosCount = (photos: Photo[]): number => {
  return photos.filter(photo => photo.isFavorite).length;
};

export const validatePhotoData = (photoData: Partial<Photo>): boolean => {
  return !!(
    photoData.uri &&
    photoData.filename &&
    photoData.size &&
    photoData.width &&
    photoData.height &&
    photoData.familyId &&
    photoData.uploadedBy
  );
};

export const validateAlbumData = (albumData: Partial<Album>): boolean => {
  return !!(
    albumData.name &&
    albumData.familyId &&
    albumData.createdBy
  );
};

export const generatePhotoId = (): string => {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateAlbumId = (): string => {
  return `album_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getPhotoMetadata = (photo: Photo): Record<string, any> => {
  return {
    id: photo.id,
    filename: photo.filename,
    size: formatFileSize(photo.size),
    dimensions: `${photo.width} × ${photo.height}`,
    createdAt: formatDateTime(photo.createdAt),
    location: photo.location?.address || 'Unknown',
    tags: photo.metadata?.tags || [],
    camera: photo.metadata?.camera || 'Unknown',
  };
};

export const getAlbumMetadata = (album: Album): Record<string, any> => {
  return {
    id: album.id,
    name: album.name,
    description: album.description || 'No description',
    photoCount: album.photoCount,
    createdAt: formatDateTime(album.createdAt),
    updatedAt: formatDateTime(album.updatedAt),
    isShared: album.isShared,
    members: album.members,
  };
}; 