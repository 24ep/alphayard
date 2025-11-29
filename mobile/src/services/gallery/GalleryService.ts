import { Photo, Album, GalleryFilters } from '../../types/gallery';
import { apiClient } from '../api/apiClient';

class GalleryService {
  private baseUrl = '/gallery';

  async getPhotos(familyId: string, filters?: Partial<GalleryFilters>): Promise<Photo[]> {
    try {
      const params = new URLSearchParams();
      params.append('familyId', familyId);
      
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      
      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      
      if (filters?.albumId) {
        params.append('albumId', filters.albumId);
      }

      const response = await apiClient.get(`${this.baseUrl}/photos?${params.toString()}`);
      return response.data.map(this.transformPhoto);
    } catch (error) {
      console.error('Error fetching photos:', error);
      // Return mock data for now
      return this.getMockPhotos(familyId);
    }
  }

  async getAlbums(familyId: string): Promise<Album[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/albums?familyId=${familyId}`);
      return response.data.map(this.transformAlbum);
    } catch (error) {
      console.error('Error fetching albums:', error);
      // Return mock data for now
      return this.getMockAlbums(familyId);
    }
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

  async deletePhoto(photoId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/photos/${photoId}`);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error('Failed to delete photo');
    }
  }

  async deleteAlbum(albumId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/albums/${albumId}`);
    } catch (error) {
      console.error('Error deleting album:', error);
      throw new Error('Failed to delete album');
    }
  }

  async toggleFavorite(photoId: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/photos/${photoId}/favorite`);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new Error('Failed to toggle favorite');
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

  async updateAlbum(albumId: string, updates: Partial<Album>): Promise<Album> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/albums/${albumId}`, updates);
      return this.transformAlbum(response.data);
    } catch (error) {
      console.error('Error updating album:', error);
      throw new Error('Failed to update album');
    }
  }

  private transformPhoto(data: any): Photo {
    return {
      id: data.id,
      uri: data.uri,
      thumbnail: data.thumbnail,
      filename: data.filename,
      title: data.title,
      size: data.size,
      width: data.width,
      height: data.height,
      createdAt: new Date(data.createdAt),
      location: data.location,
      metadata: data.metadata,
      uploadedBy: data.uploadedBy,
      familyId: data.familyId,
      albumId: data.albumId,
      isShared: data.isShared,
      isFavorite: data.isFavorite,
    };
  }

  private transformAlbum(data: any): Album {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      coverPhoto: data.coverPhoto,
      coverImage: data.coverPhoto, // For backward compatibility
      photoCount: data.photoCount,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      createdBy: data.createdBy,
      familyId: data.familyId,
      isShared: data.isShared,
      members: data.members,
    };
  }

  private getMockPhotos(familyId: string): Photo[] {
    return [
      {
        id: '1',
        uri: 'https://picsum.photos/400/400?random=1',
        thumbnail: 'https://picsum.photos/200/200?random=1',
        filename: 'family_photo_1.jpg',
        title: 'hourse Vacation',
        size: 2048576,
        width: 400,
        height: 400,
        createdAt: new Date('2024-01-15'),
        uploadedBy: 'user1',
        familyId,
        isShared: true,
        isFavorite: false,
      },
      {
        id: '2',
        uri: 'https://picsum.photos/400/400?random=2',
        thumbnail: 'https://picsum.photos/200/200?random=2',
        filename: 'vacation_photo.jpg',
        title: 'Beach Day',
        size: 3145728,
        width: 800,
        height: 600,
        createdAt: new Date('2024-01-10'),
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: 'Bangkok, Thailand',
        },
        uploadedBy: 'user1',
        familyId,
        albumId: 'vacation',
        isShared: true,
        isFavorite: true,
      },
      {
        id: '3',
        uri: 'https://picsum.photos/400/400?random=3',
        thumbnail: 'https://picsum.photos/200/200?random=3',
        filename: 'birthday_party.jpg',
        title: 'Birthday Celebration',
        size: 1572864,
        width: 600,
        height: 800,
        createdAt: new Date('2024-01-05'),
        uploadedBy: 'user1',
        familyId,
        isShared: false,
        isFavorite: false,
      },
    ];
  }

  private getMockAlbums(familyId: string): Album[] {
    return [
      {
        id: 'vacation',
        name: 'hourse Vacation',
        description: 'Our trip to the beach',
        coverPhoto: 'https://picsum.photos/200/200?random=2',
        coverImage: 'https://picsum.photos/200/200?random=2',
        photoCount: 15,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'user1',
        familyId,
        isShared: true,
        members: ['user1'],
      },
      {
        id: 'birthday',
        name: 'Birthday Celebrations',
        description: 'All our birthday memories',
        coverPhoto: 'https://picsum.photos/200/200?random=3',
        coverImage: 'https://picsum.photos/200/200?random=3',
        photoCount: 8,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-12'),
        createdBy: 'user1',
        familyId,
        isShared: true,
        members: ['user1'],
      },
    ];
  }
}

export const galleryService = new GalleryService(); 