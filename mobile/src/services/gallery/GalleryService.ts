import { Photo, Album, GalleryFilters } from '../../types/gallery';
import { apiClient } from '../api/apiClient';

export interface GalleryStats {
  totalPhotos: number;
  totalVideos: number;
  totalSize: number;
  albumCount: number;
  favoriteCount: number;
  recentCount: number;
}

class GalleryService {
  private baseUrl = '/gallery';

  // =====================================
  // PERSONAL GALLERY (User's Files)
  // =====================================

  async getPersonalPhotos(filters?: Partial<GalleryFilters>): Promise<{ photos: Photo[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type === 'favorites' ? 'all' : filters.type);
        if (filters.type === 'favorites') {
          params.append('isFavorite', 'true');
        }
      }
      
      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      
      if (filters?.albumId) {
        params.append('albumId', filters.albumId);
      }

      const response = await apiClient.get(`${this.baseUrl}/personal/photos?${params.toString()}`);
      
      if (response.data.success) {
        return {
          photos: response.data.photos.map(this.transformPhoto),
          total: response.data.total || response.data.photos.length
        };
      }
      throw new Error(response.data.error || 'Failed to fetch personal photos');
    } catch (error) {
      console.error('Error fetching personal photos:', error);
      return { photos: [], total: 0 };
    }
  }

  async getPersonalAlbums(parentId?: string): Promise<Album[]> {
    try {
      const params = parentId ? `?parentId=${parentId}` : '';
      const response = await apiClient.get(`${this.baseUrl}/personal/albums${params}`);
      
      if (response.data.success) {
        return response.data.albums.map(this.transformAlbum);
      }
      throw new Error(response.data.error || 'Failed to fetch personal albums');
    } catch (error) {
      console.error('Error fetching personal albums:', error);
      return [];
    }
  }

  async createPersonalAlbum(albumData: { 
    name: string; 
    description?: string; 
    parentId?: string;
    color?: string;
    coverPhotoId?: string;
  }): Promise<Album> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/personal/albums`, albumData);
      
      if (response.data.success) {
        return this.transformAlbum(response.data.album);
      }
      throw new Error(response.data.error || 'Failed to create album');
    } catch (error) {
      console.error('Error creating personal album:', error);
      throw error;
    }
  }

  // =====================================
  // CIRCLE GALLERY (Circle's Files)
  // =====================================

  async getCirclePhotos(circleId: string, filters?: Partial<GalleryFilters>): Promise<{ photos: Photo[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type === 'favorites' ? 'all' : filters.type);
        if (filters.type === 'favorites') {
          params.append('isFavorite', 'true');
        }
      }
      
      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      
      if (filters?.albumId) {
        params.append('albumId', filters.albumId);
      }

      const response = await apiClient.get(`${this.baseUrl}/circles/${circleId}/photos?${params.toString()}`);
      
      if (response.data.success) {
        return {
          photos: response.data.photos.map(this.transformPhoto),
          total: response.data.total || response.data.photos.length
        };
      }
      throw new Error(response.data.error || 'Failed to fetch circle photos');
    } catch (error) {
      console.error('Error fetching circle photos:', error);
      return { photos: [], total: 0 };
    }
  }

  async getCircleAlbums(circleId: string, parentId?: string): Promise<Album[]> {
    try {
      const params = parentId ? `?parentId=${parentId}` : '';
      const response = await apiClient.get(`${this.baseUrl}/circles/${circleId}/albums${params}`);
      
      if (response.data.success) {
        return response.data.albums.map(this.transformAlbum);
      }
      throw new Error(response.data.error || 'Failed to fetch circle albums');
    } catch (error) {
      console.error('Error fetching circle albums:', error);
      return [];
    }
  }

  async createCircleAlbum(circleId: string, albumData: { 
    name: string; 
    description?: string; 
    parentId?: string;
    color?: string;
    coverPhotoId?: string;
  }): Promise<Album> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/circles/${circleId}/albums`, albumData);
      
      if (response.data.success) {
        return this.transformAlbum(response.data.album);
      }
      throw new Error(response.data.error || 'Failed to create circle album');
    } catch (error) {
      console.error('Error creating circle album:', error);
      throw error;
    }
  }

  // =====================================
  // LEGACY METHODS (Backward Compatible)
  // =====================================

  async getPhotos(circleId: string, filters?: Partial<GalleryFilters>): Promise<Photo[]> {
    // Use circle photos for backward compatibility
    const result = await this.getCirclePhotos(circleId, filters);
    return result.photos;
  }

  async getAlbums(circleId: string): Promise<Album[]> {
    return this.getCircleAlbums(circleId);
  }

  async uploadPhoto(photoData: Partial<Photo>): Promise<Photo> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/photos`, photoData);
      return this.transformPhoto(response.data);
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  }

  async createAlbum(albumData: Partial<Album>): Promise<Album> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/albums`, albumData);
      return this.transformAlbum(response.data);
    } catch (error) {
      console.error('Error creating album:', error);
      throw new Error('Failed to create album');
    }
  }

  // =====================================
  // SHARED OPERATIONS
  // =====================================

  async toggleFavorite(photoId: string): Promise<boolean> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/photos/${photoId}/favorite`);
      
      if (response.data.success) {
        return response.data.isFavorite;
      }
      throw new Error(response.data.error || 'Failed to toggle favorite');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  async movePhotoToAlbum(photoId: string, albumId: string | null): Promise<Photo> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/photos/${photoId}/move`, { albumId });
      
      if (response.data.success) {
        return this.transformPhoto(response.data.photo);
      }
      throw new Error(response.data.error || 'Failed to move photo');
    } catch (error) {
      console.error('Error moving photo:', error);
      throw error;
    }
  }

  async deletePhoto(photoId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/photos/${photoId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  async updateAlbum(albumId: string, updates: Partial<Album>): Promise<Album> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/albums/${albumId}`, updates);
      
      if (response.data.success) {
        return this.transformAlbum(response.data.album);
      }
      throw new Error(response.data.error || 'Failed to update album');
    } catch (error) {
      console.error('Error updating album:', error);
      throw error;
    }
  }

  async deleteAlbum(albumId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/albums/${albumId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete album');
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      throw error;
    }
  }

  async setAlbumCover(albumId: string, photoId: string): Promise<void> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/albums/${albumId}/cover`, { photoId });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to set album cover');
      }
    } catch (error) {
      console.error('Error setting album cover:', error);
      throw error;
    }
  }

  async getGalleryStats(circleId?: string): Promise<GalleryStats> {
    try {
      const params = circleId ? `?circleId=${circleId}` : '';
      const response = await apiClient.get(`${this.baseUrl}/stats${params}`);
      
      if (response.data.success) {
        return response.data.stats;
      }
      throw new Error(response.data.error || 'Failed to get gallery stats');
    } catch (error) {
      console.error('Error getting gallery stats:', error);
      return {
        totalPhotos: 0,
        totalVideos: 0,
        totalSize: 0,
        albumCount: 0,
        favoriteCount: 0,
        recentCount: 0
      };
    }
  }

  async updatePhoto(photoId: string, updates: Partial<Photo>): Promise<Photo> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/photos/${photoId}`, updates);
      return this.transformPhoto(response.data);
    } catch (error) {
      console.error('Error updating photo:', error);
      throw new Error('Failed to update photo');
    }
  }

  // =====================================
  // TRANSFORMERS
  // =====================================

  private transformPhoto(data: any): Photo {
    return {
      id: data.id,
      uri: data.uri || data.url,
      thumbnail: data.thumbnail || data.thumbnailUrl || data.uri || data.url,
      filename: data.filename || data.originalName,
      title: data.title || data.description,
      size: data.size || 0,
      width: data.width || data.metadata?.width || 0,
      height: data.height || data.metadata?.height || 0,
      createdAt: new Date(data.createdAt),
      location: data.location || data.metadata?.location,
      metadata: data.metadata || {},
      uploadedBy: data.uploadedBy || data.uploaderName,
      circleId: data.circleId || '',
      albumId: data.albumId || data.folderId,
      isShared: data.isShared || !!data.circleId,
      isFavorite: data.isFavorite || false,
    };
  }

  private transformAlbum(data: any): Album {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      coverPhoto: data.coverPhoto || data.coverPhotoUrl,
      coverImage: data.coverPhoto || data.coverPhotoUrl, // For backward compatibility
      photoCount: data.photoCount || data.mediaCount || data.itemCount || 0,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      createdBy: data.createdBy || data.ownerId,
      circleId: data.circleId || '',
      isShared: data.isShared || !!data.circleId,
      members: data.members || [],
      date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : undefined,
    };
  }
}

export const galleryApi = new GalleryService();
