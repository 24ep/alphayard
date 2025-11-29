export interface LocationSearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface LocationDetails {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  importance: number;
}

class LocationSearchService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly SEARCH_DELAY = 500; // 500ms delay to avoid rate limiting
  private searchTimeout: NodeJS.Timeout | null = null;

  // Search for locations using OpenStreetMap Nominatim (free API)
  async searchLocations(query: string, limit: number = 10): Promise<LocationDetails[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Add delay to respect rate limits
      await new Promise(resolve => {
        this.searchTimeout = setTimeout(resolve, this.SEARCH_DELAY);
      });

      const encodedQuery = encodeURIComponent(query);
      const url = `${this.NOMINATIM_BASE_URL}/search?format=json&q=${encodedQuery}&limit=${limit}&addressdetails=1&extratags=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BondarysApp/1.0', // Required by Nominatim
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results: LocationSearchResult[] = await response.json();
      
      return results.map((result, index) => ({
        id: result.place_id || `location_${index}`,
        name: this.formatLocationName(result),
        address: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        type: result.type,
        importance: result.importance,
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }

  // Format location name for display
  private formatLocationName(result: LocationSearchResult): string {
    const address = result.address;
    if (address) {
      const parts = [];
      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`);
      } else if (address.road) {
        parts.push(address.road);
      }
      if (address.city) {
        parts.push(address.city);
      } else if (address.state) {
        parts.push(address.state);
      }
      if (address.country) {
        parts.push(address.country);
      }
      return parts.join(', ');
    }
    return result.display_name;
  }

  // Get location details by coordinates (reverse geocoding)
  async getLocationByCoordinates(latitude: number, longitude: number): Promise<LocationDetails | null> {
    try {
      const url = `${this.NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BondarysApp/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: LocationSearchResult = await response.json();
      
      return {
        id: result.place_id || 'current_location',
        name: this.formatLocationName(result),
        address: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        type: result.type,
        importance: result.importance,
      };
    } catch (error) {
      console.error('Error getting location by coordinates:', error);
      return null;
    }
  }

  // Get popular locations for quick selection
  getPopularLocations(): LocationDetails[] {
    return [
      {
        id: 'supermarket',
        name: 'Supermarket',
        address: 'Local supermarket',
        latitude: 37.7749,
        longitude: -122.4194,
        type: 'shop',
        importance: 0.9,
      },
      {
        id: 'pharmacy',
        name: 'Pharmacy',
        address: 'Local pharmacy',
        latitude: 37.7849,
        longitude: -122.4094,
        type: 'amenity',
        importance: 0.8,
      },
      {
        id: 'mall',
        name: 'Shopping Mall',
        address: 'Local shopping mall',
        latitude: 37.7649,
        longitude: -122.4294,
        type: 'shop',
        importance: 0.7,
      },
      {
        id: 'bookstore',
        name: 'Bookstore',
        address: 'Local bookstore',
        latitude: 37.7549,
        longitude: -122.4394,
        type: 'shop',
        importance: 0.6,
      },
      {
        id: 'electronics',
        name: 'Electronics Store',
        address: 'Electronics and gadgets',
        latitude: 37.7449,
        longitude: -122.4494,
        type: 'shop',
        importance: 0.5,
      },
    ];
  }
}

export const locationSearchService = new LocationSearchService();
