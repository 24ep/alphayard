import { api } from './index';
import { CircleType } from './circle';

export const circleTypeApi = {
  // Get all circle types
  getAll: async (): Promise<{ success: boolean; data: CircleType[] }> => {
    try {
      const response = await api.get('/circle-types');
      return response;
    } catch (error) {
      console.error('Error fetching circle types:', error);
      return { success: false, data: [] };
    }
  },

  // Get circle type by ID
  getById: async (id: string): Promise<{ success: boolean; data: CircleType | null }> => {
    try {
      const response = await api.get(`/circle-types/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching circle type ${id}:`, error);
      return { success: false, data: null };
    }
  }
};
