
export interface Language {
    code: string; // e.g., 'en-US'
    name: string; // e.g., 'English (US)'
    nativeName: string; // e.g., 'English'
    isDefault: boolean;
    isEnabled: boolean;
    flag: string; // Emoji
}

export interface TranslationKey {
    id: string;
    key: string;
    description?: string;
    defaultValue: string; // English
    translations: Record<string, string>; // keyed by lang code
}

export interface Region {
    id: string;
    code: string; // e.g., 'US', 'EU'
    name: string; // e.g., 'United States'
    currency: string; // e.g., 'USD'
    isEnabled: boolean;
}

const API_BASE = '/api/v1/admin/cms/localization';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json();
}

export const localizationService = {
    getLanguages: async (): Promise<Language[]> => {
        try {
            const data = await fetchJson<{ languages: any[] }>(`${API_BASE}/languages`);
            return (data.languages || []).map((l: any) => ({
                code: l.code,
                name: l.name,
                nativeName: l.native_name || l.nativeName || l.name,
                isDefault: l.is_default ?? l.isDefault ?? false,
                isEnabled: l.is_active ?? l.isEnabled ?? true,
                flag: l.flag_emoji || l.flag || '',
            }));
        } catch (error) {
            console.error('Error fetching languages:', error);
            return [];
        }
    },

    toggleLanguage: async (code: string, isEnabled: boolean): Promise<Language> => {
        const languages = await localizationService.getLanguages();
        const lang = languages.find(l => l.code === code);
        if (!lang) throw new Error(`Language ${code} not found`);

        // Find by code, then update by posting
        const data = await fetchJson<{ language: any }>(`${API_BASE}/languages`, {
            method: 'POST',
            body: JSON.stringify({
                code,
                name: lang.name,
                native_name: lang.nativeName,
                is_active: isEnabled,
                is_default: lang.isDefault,
                flag_emoji: lang.flag,
            }),
        });

        const updated = data.language;
        return {
            code: updated.code,
            name: updated.name,
            nativeName: updated.native_name || updated.name,
            isDefault: updated.is_default ?? false,
            isEnabled: updated.is_active ?? true,
            flag: updated.flag_emoji || '',
        };
    },

    setAsDefault: async (code: string): Promise<Language> => {
        const languages = await localizationService.getLanguages();
        const lang = languages.find(l => l.code === code);
        if (!lang) throw new Error(`Language ${code} not found`);

        const data = await fetchJson<{ language: any }>(`${API_BASE}/languages`, {
            method: 'POST',
            body: JSON.stringify({
                code,
                name: lang.name,
                native_name: lang.nativeName,
                is_active: lang.isEnabled,
                is_default: true,
                flag_emoji: lang.flag,
            }),
        });

        const updated = data.language;
        return {
            code: updated.code,
            name: updated.name,
            nativeName: updated.native_name || updated.name,
            isDefault: updated.is_default ?? true,
            isEnabled: updated.is_active ?? true,
            flag: updated.flag_emoji || '',
        };
    },

    getTranslations: async (): Promise<TranslationKey[]> => {
        try {
            const data = await fetchJson<{ keys: any[] }>(`${API_BASE}/keys`);
            return (data.keys || []).map((k: any) => ({
                id: k.id,
                key: k.key,
                description: k.description || '',
                defaultValue: k.key, // Use key as fallback for default value
                translations: {},
            }));
        } catch (error) {
            console.error('Error fetching translations:', error);
            return [];
        }
    },

    updateTranslation: async (keyId: string, langCode: string, value: string): Promise<TranslationKey> => {
        const data = await fetchJson<{ translation: any }>(`${API_BASE}/translations`, {
            method: 'POST',
            body: JSON.stringify({
                key: keyId,
                language: langCode,
                value,
            }),
        });
        return {
            id: data.translation.id || keyId,
            key: keyId,
            defaultValue: value,
            translations: { [langCode]: value },
        };
    },

    getRegions: async (): Promise<Region[]> => {
        // Regions are typically reference data; fetch from countries endpoint  
        try {
            const res = await fetch('/api/v1/admin/reference/countries');
            if (res.ok) {
                const data = await res.json();
                return (data.countries || data || []).map((c: any) => ({
                    id: c.id || c.code,
                    code: c.code,
                    name: c.name,
                    currency: c.currency_code || c.currencyCode || 'USD',
                    isEnabled: c.is_active ?? c.isActive ?? true,
                }));
            }
        } catch (error) {
            console.error('Error fetching regions:', error);
        }
        // Fallback to common regions if API unavailable
        return [
            { id: '1', code: 'US', name: 'United States', currency: 'USD', isEnabled: true },
            { id: '2', code: 'EU', name: 'Europe', currency: 'EUR', isEnabled: true },
            { id: '3', code: 'GB', name: 'United Kingdom', currency: 'GBP', isEnabled: true },
            { id: '4', code: 'JP', name: 'Japan', currency: 'JPY', isEnabled: false },
        ];
    },

    toggleRegion: async (id: string, isEnabled: boolean): Promise<Region> => {
        const regions = await localizationService.getRegions();
        const region = regions.find(r => r.id === id);
        if (!region) throw new Error(`Region ${id} not found`);
        region.isEnabled = isEnabled;
        return region;
    }
};
