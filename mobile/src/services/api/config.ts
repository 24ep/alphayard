import apiClient from './apiClient';

export interface Country {
    code: string;
    name: string;
    dial_code: string;
    flag: string;
}

export const configService = {
    getCountries: async (): Promise<Country[]> => {
        try {
            const response = await apiClient.get('/config/countries');
            return response.data;
        } catch (error) {
            console.error('Error fetching countries:', error);
            // Fallback to minimal list if offline or error
            return [
                { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
                { code: 'TH', name: 'Thailand', dial_code: '+66', flag: '🇹🇭' },
            ];
        }
    },
};
