// src/services/apiService.ts
import { type CompanyData, type Contact } from '../types/crm'; // You will need to expand these types

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://567534ed9849.ngrok-free.app';
const API_HEADERS = {
    "ngrok-skip-browser-warning": "true",
    'Content-Type': 'application/json'
};

export type DataSource = 'crm' | 'preqin' | 'dakota' | 'pitchbook' | 'zoominfo';

// Type for suggestions
export interface Suggestion {
    name: string;
    // Add other properties like id, type, city, aum
}

// Type for the enhanced search result
export interface EnhancedSearchResult {
    company: CompanyData;
    contacts: Contact[];
}

export const apiService = {
    /**
     * Fetches search suggestions for a given data source.
     */
    async getSuggestions(source: DataSource, query: string): Promise<Suggestion[]> {
        const endpoints = {
            crm: '/api/d365/search/suggestions',
            preqin: '/api/search/suggestions',
            dakota: '/api/dakota/search/suggestions',
            pitchbook: '/api/pitchbook/search/suggestions',
            zoominfo: '/api/zoominfo/search/suggestions',
        };

        const response = await fetch(`${API_BASE_URL}${endpoints[source]}`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ query, limit: 8 })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(`Failed to fetch suggestions for ${source}`);
        }
        return result.suggestions || [];
    },

    /**
     * Performs an enhanced search for a company and its contacts.
     */
    async searchEnhanced(source: DataSource, query: string): Promise<EnhancedSearchResult> {
        const endpoints = {
            crm: '/api/d365/search/enhanced',
            preqin: '/api/search/enhanced',
            dakota: '/api/dakota/search/enhanced',
            pitchbook: '/api/pitchbook/search/enhanced',
            zoominfo: '/api/zoominfo/search/enhanced',
        };

        const response = await fetch(`${API_BASE_URL}${endpoints[source]}`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ query })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(`Enhanced search failed for ${source}`);
        }
        return result.data;
    },

    // Add other API functions here as needed (e.g., exportToCRM)
};