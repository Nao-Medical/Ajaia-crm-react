// src/hooks/useApiAuth.ts
import { useState, useEffect } from 'react';

// Define the shape of the state that our hook will return
export interface ApiAuthState {
    isPreqinAuthenticated: boolean;
    isDakotaAuthenticated: boolean;
    isPitchbookAuthenticated: boolean;
    isZoomInfoAuthenticated: boolean;
    isD365Authenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://567534ed9849.ngrok-free.app';

export const useApiAuth = () => {
    const [authState, setAuthState] = useState<ApiAuthState>({
        isPreqinAuthenticated: false,
        isDakotaAuthenticated: false,
        isPitchbookAuthenticated: false,
        isZoomInfoAuthenticated: false,
        isD365Authenticated: false,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const checkAllAuthentications = async () => {
            try {
                const results = await Promise.allSettled([
                    // 0: Preqin Auth Check
                    fetch(`${API_BASE_URL}/api/authenticate`, {
                        method: 'POST',
                        headers: { "ngrok-skip-browser-warning": "true", 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: import.meta.env.VITE_PREQIN_USERNAME,
                            apikey: import.meta.env.VITE_PREQIN_APIKEY
                        })
                    }).then(res => res.json()),

                    // 1: Dakota Auth Check
                    fetch(`${API_BASE_URL}/api/dakota/authenticate`, {
                        method: 'POST',
                        headers: { "ngrok-skip-browser-warning": "true", 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: import.meta.env.VITE_DAKOTA_USERNAME,
                            password: import.meta.env.VITE_DAKOTA_PASSWORD
                        })
                    }).then(res => res.json()),

                    // 2: PitchBook Auth Check (returns the full Response object)
                    fetch(`${API_BASE_URL}/api/pitchbook/search/suggestions`, {
                        method: 'POST',
                        headers: { "ngrok-skip-browser-warning": "true", 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: 'test', limit: 1 })
                    }),

                    // 3: ZoomInfo Auth Check
                    fetch(`${API_BASE_URL}/api/zoominfo/authenticate`, {
                        method: 'POST',
                        headers: { "ngrok-skip-browser-warning": "true", 'Content-Type': 'application/json' }
                    }).then(res => res.json()),

                    // 4: D365 Auth Check
                    fetch(`${API_BASE_URL}/api/d365/status`, {
                        method: "GET",
                        headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" }
                    }).then(res => res.json())
                ]);

                const [
                    preqinResult,
                    dakotaResult,
                    pitchbookResult,
                    zoomInfoResult,
                    d365Result
                ] = results;

                // Create a new state object to avoid multiple re-renders
                const newAuthState = { ...authState };

                // --- Process Preqin Result ---
                if (preqinResult.status === 'fulfilled') {
                    if (preqinResult.value.success) {
                        newAuthState.isPreqinAuthenticated = true;
                        console.log('Successfully authenticated with Preqin API');
                    } else {
                        // API responded, but with a failure message
                        console.error('Failed to authenticate with Preqin:', preqinResult.value.error || 'Unknown API error');
                    }
                } else {
                    // Handle network errors or other promise rejections
                    console.error('Failed to authenticate with Preqin (network error):', preqinResult.reason);
                }

                // --- Process Dakota Result ---
                if (dakotaResult.status === 'fulfilled') {
                    if (dakotaResult.value.success) {
                        newAuthState.isDakotaAuthenticated = true;
                        console.log('Successfully authenticated with Dakota API');
                    } else {
                        console.error('Failed to authenticate with Dakota:', dakotaResult.value.error || 'Unknown API error');
                    }
                } else {
                    console.error('Failed to authenticate with Dakota (network error):', dakotaResult.reason);
                }

                // --- Process PitchBook Result ---
                if (pitchbookResult.status === 'fulfilled') {
                    // Here, `value` is the Response object itself
                    if (pitchbookResult.value.status !== 401) {
                        newAuthState.isPitchbookAuthenticated = true;
                        console.log('PitchBook API is available');
                    } else {
                        console.error('PitchBook API authentication failed (status 401)');
                    }
                } else {
                    console.error('PitchBook API request failed (network error):', pitchbookResult.reason);
                }

                // --- Process ZoomInfo Result ---
                if (zoomInfoResult.status === 'fulfilled') {
                    if (zoomInfoResult.value.success) {
                        newAuthState.isZoomInfoAuthenticated = true;
                        console.log('Successfully authenticated with ZoomInfo API');
                    } else {
                        console.error('Failed to authenticate with ZoomInfo:', zoomInfoResult.value.error || 'Unknown API error');
                    }
                } else {
                    console.error('Failed to authenticate with ZoomInfo (network error):', zoomInfoResult.reason);
                }

                // --- Process D365 Result ---
                if (d365Result.status === 'fulfilled') {
                    if (d365Result.value.success && d365Result.value.authenticated) {
                        newAuthState.isD365Authenticated = true;
                        console.log('D365 connection is available and authenticated.');
                    } else {
                        console.error('D365 connection is not authenticated:', d365Result.value.message || 'Unknown API error');
                    }
                } else {
                    console.error('Failed to check D365 status (network error):', d365Result.reason);
                }


                // Check if all failed and set a general error message
                const allFailed = !newAuthState.isPreqinAuthenticated &&
                    !newAuthState.isDakotaAuthenticated &&
                    !newAuthState.isPitchbookAuthenticated &&
                    !newAuthState.isZoomInfoAuthenticated &&
                    !newAuthState.isD365Authenticated;

                if (allFailed) {
                    newAuthState.error = 'Failed to authenticate with any data sources. Please check credentials.';
                }

                // Final state update in one go
                setAuthState({
                    ...newAuthState,
                    isLoading: false,
                });

            } catch (error) {
                console.error('A critical authentication error occurred:', error);
                setAuthState({
                    isPreqinAuthenticated: false,
                    isDakotaAuthenticated: false,
                    isPitchbookAuthenticated: false,
                    isZoomInfoAuthenticated: false,
                    isD365Authenticated: false,
                    isLoading: false,
                    error: 'Failed to connect to the API server.'
                });
            }
        };

        checkAllAuthentications();

    }, []); // Empty dependency array ensures this runs only once

    return authState;
};