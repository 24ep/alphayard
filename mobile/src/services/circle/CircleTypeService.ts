import { circleTypeApi } from '../api/circleTypes';
import { CircleType } from '../api/circle';

class CircleTypeService {
  async getAllCircleTypes(): Promise<CircleType[]> {
    const response = await circleTypeApi.getAll();
    if (response.success) {
      return response.data;
    }
    return [];
  }

  async getCircleTypeById(id: string): Promise<CircleType | null> {
    const response = await circleTypeApi.getById(id);
    if (response.success) {
      return response.data;
    }
    return null;
  }
}

export const circleTypeService = new CircleTypeService();
