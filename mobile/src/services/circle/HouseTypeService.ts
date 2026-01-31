import { houseTypeApi } from '../api/houseTypes';
import { HouseType } from '../../types/home';

class HouseTypeService {
  async getAllHouseTypes(): Promise<HouseType[]> {
    const response = await houseTypeApi.getAll();
    if (response.success) {
      return response.data;
    }
    return [];
  }

  async getHouseTypeById(id: string): Promise<HouseType | null> {
    const response = await houseTypeApi.getById(id);
    if (response.success) {
      return response.data;
    }
    return null;
  }
}

export const houseTypeService = new HouseTypeService();
