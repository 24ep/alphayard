import { api } from './index';

export interface File {
  id: string;
  userId: string;
  circleId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  filePath: string;
  url: string; // Added to match backend
  thumbnailPath?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    [key: string]: any;
  };
  isPublic: boolean;
  tags?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  filesByType: {
    image: number;
    video: number;
    audio: number;
    document: number;
    other: number;
  };
  sizeByType: {
    image: number;
    video: number;
    audio: number;
    document: number;
    other: number;
  };
  recentFiles: File[];
}

export interface UploadFileRequest {
  file: any; // File object from form data
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateFileRequest {
  fileName?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export const storageApi = {
  // Upload file
  uploadFile: async (data: UploadFileRequest): Promise<{ success: boolean; file: File }> => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.description) formData.append('description', data.description);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());

    const response = await api.post('/storage/upload', formData, {
      transformRequest: (data, headers) => {
        // React Native requires manual Content-Type, Web requires automatic (to include boundary)
        // Axios usually handles this, but let's be explicit or just let it be.
        // Returning data lets axios handle the serialization (which is identity for FormData)
        return data;
      },
      // Do NOT set Content-Type manually for FormData on web, or it loses the boundary
    });
    // api.post already unwraps response.data, so response IS the backend data
    return response as unknown as { success: boolean; file: File };
  },

  // Get user's files
  getFiles: async (params?: { type?: string; limit?: number; offset?: number; search?: string }): Promise<{ success: boolean; files: File[]; pagination: any }> => {
    const response = await api.get('/storage/files', { params });
    return response.data;
  },

  // Get Circle files
  getCircleFiles: async (params?: { type?: string; limit?: number; offset?: number; search?: string }): Promise<{ success: boolean; files: File[]; pagination: any }> => {
    const response = await api.get('/storage/files/Circle', { params });
    return response.data;
  },

  // Get file by ID
  getFile: async (fileId: string): Promise<{ success: boolean; file: File }> => {
    const response = await api.get(`/storage/files/${fileId}`);
    return response.data;
  },

  // Update file
  updateFile: async (fileId: string, data: UpdateFileRequest): Promise<{ success: boolean; file: File }> => {
    const response = await api.put(`/storage/files/${fileId}`, data);
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/storage/files/${fileId}`);
    return response.data;
  },

  // Download file
  downloadFile: async (fileId: string): Promise<Blob> => {
    const response = await api.get(`/storage/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get file URL
  getFileUrl: async (fileId: string): Promise<{ success: boolean; url: string }> => {
    const response = await api.get(`/storage/files/${fileId}/url`);
    return response.data;
  },

  // Get storage statistics
  getStorageStats: async (): Promise<{ success: boolean; stats: StorageStats }> => {
    const response = await api.get('/storage/stats');
    return response.data;
  },

  // Get files by type
  getFilesByType: async (type: 'image' | 'video' | 'audio' | 'document' | 'other', params?: { limit?: number; offset?: number }): Promise<{ success: boolean; files: File[]; pagination: any }> => {
    const response = await api.get(`/storage/files/type/${type}`, { params });
    return response.data;
  },

  // Search files
  searchFiles: async (query: string, params?: { type?: string; limit?: number; offset?: number }): Promise<{ success: boolean; files: File[]; pagination: any }> => {
    const response = await api.get('/storage/files/search', {
      params: { ...params, q: query }
    });
    return response.data;
  },
};

