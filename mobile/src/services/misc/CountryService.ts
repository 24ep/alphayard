
import { miscApi, Country } from '../api/misc';

class CountryService {
    private _countries: Country[] = [];

    async getCountries(): Promise<Country[]> {
        if (this._countries.length > 0) {
            return this._countries;
        }

        try {
            const response = await miscApi.getCountries();
            if (response.success && Array.isArray(response.data)) {
                this._countries = response.data;
                return this._countries;
            }
            return [];
        } catch (error) {
            console.error('Error fetching countries:', error);
            return [];
        }
    }

    // Helper to get flag by code
    getFlag(code: string): string {
        const country = this._countries.find(c => c.code === code);
        return country ? country.flag : '🏳️';
    }

    // Helper to get phone code
    getPhoneCode(code: string): string {
        const country = this._countries.find(c => c.code === code);
        return country ? country.phone_code : '';
    }
}

export const countryService = new CountryService();
export type { Country };
