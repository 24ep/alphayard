
import { query } from '../config/database';

export interface Country {
    id: number;
    code: string;
    name: string;
    flag: string;
    phone_code: string;
    is_supported: boolean;
}

export class CountryService {
    async getAllCountries(): Promise<Country[]> {
        try {
            const { rows } = await query(
                'SELECT * FROM countries WHERE is_supported = TRUE ORDER BY name ASC'
            );
            return rows;
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw error;
        }
    }

    async searchCountries(term: string): Promise<Country[]> {
        try {
            const { rows } = await query(
                `SELECT * FROM countries 
         WHERE is_supported = TRUE 
         AND (name ILIKE $1 OR code ILIKE $1)
         ORDER BY name ASC`,
                [`%${term}%`]
            );
            return rows;
        } catch (error) {
            console.error('Error searching countries:', error);
            throw error;
        }
    }
}

export const countryService = new CountryService();
