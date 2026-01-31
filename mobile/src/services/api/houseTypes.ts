import { api } from './index';
import { HouseType } from '../../types/home';

export const houseTypeApi = {
  // Get all house types
  getAll: async (): Promise<{ success: boolean; data: HouseType[] }> => {
    try {
      const response = await api.get('/house-types');
      return response;
    } catch (error) {
      console.error('Error fetching house types:', error);
      return { success: false, data: [] };
    }
  },

  // Get house type by ID
  getById: async (id: string): Promise<{ success: boolean; data: HouseType | null }> => {
    try {
      const response = await api.get(`/house-types/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching house type ${id}:`, error);
      return { success: false, data: null };
    }
  }
};
