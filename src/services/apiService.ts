// src/services/apiService.ts
import { type CompanyData, type Contact } from '../types/crm';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://567534ed9849.ngrok-free.app';

const API_HEADERS = {
  'ngrok-skip-browser-warning': 'true',
  'Content-Type': 'application/json',
};

export type DataSource = 'crm' | 'preqin' | 'dakota' | 'pitchbook' | 'zoominfo';

export interface Suggestion {
  id: string;
  name: string;
  type: number;
  city: string;
  country: string;
  aum: string | null;
  source: string;
}

export interface EnhancedSearchResult {
  company: CompanyData;
  contacts: Contact[];
}

/** Type for account update payload (adjust as needed) */
export interface UpdateAccountPayload {
  company_name: string;
  source: string;
  [key: string]: any; // for dynamic fields
}

/** Type for update account response */
export interface UpdateAccountResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

const suggestionEndpoints: Record<DataSource, string> = {
  crm: '/api/d365/search/suggestions',
  preqin: '/api/search/suggestions',
  dakota: '/api/dakota/search/suggestions',
  pitchbook: '/api/pitchbook/search/suggestions',
  zoominfo: '/api/zoominfo/search/suggestions',
};

const enhancedEndpoints: Record<DataSource, string> = {
  crm: '/api/d365/search/enhanced',
  preqin: '/api/search/enhanced',
  dakota: '/api/dakota/search/enhanced',
  pitchbook: '/api/pitchbook/search/enhanced',
  zoominfo: '/api/zoominfo/search/enhanced',
};

export const apiService = {
  /** Fetch search suggestions (supports abort via `signal`). */
  async getSuggestions(
    source: DataSource,
    query: string,
    signal?: AbortSignal
  ): Promise<Suggestion[]> {
    const response = await fetch(`${API_BASE_URL}${suggestionEndpoints[source]}`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({ query, limit: 8 }),
      signal, // <-- important for React Query cancelation
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(`Failed to fetch suggestions for ${source}`);
    }
    return result.suggestions || [];
  },

  /** Enhanced search (also supports abort). */
  async searchEnhanced(
    source: DataSource,
    query: string,
    signal?: AbortSignal
  ): Promise<EnhancedSearchResult> {
    const response = await fetch(`${API_BASE_URL}${enhancedEndpoints[source]}`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({ query }),
      signal, // optional, enables cancelation
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(`Enhanced search failed for ${source}`);
    }
    return result.data;
  },

  /** Update CRM account with enhanced endpoint */
  async updateAccountEnhanced(
    payload: UpdateAccountPayload,
    signal?: AbortSignal
  ): Promise<UpdateAccountResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/dynamics/update-account/enhanced`,
      {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(payload),
        signal,
      }
    );
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to update account');
    }
    return result;
  },
};
