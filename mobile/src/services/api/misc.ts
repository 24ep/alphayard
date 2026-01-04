
import { api } from './index';

export interface Country {
    id: number;
    code: string;
    name: string;
    flag: string;
    phone_code: string;
}

export const miscApi = {
    getCountries: async (): Promise<{ success: boolean; data: Country[] }> => {
        const response = await api.get('/misc/countries');
        return response.data;
    }
};
