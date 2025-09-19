// src/pages/DataComparisonPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'; // Import User type
import { auth } from '../firebase';
import { useApiAuth } from '../hooks/useApiAuth';
import { type CrmData, type CompanyData } from '../types/crm';
import { apiService, type DataSource } from '../services/apiService';
import AccountViewTable from '../components/AccountViewTable';
import './DataComparisonPage.css'; // Your existing CSS file
// import { mergeAndMatchContacts } from '../utils/helpers';

// Helper components for SVGs to keep the main component clean
const HeaderIcon = () => (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
);

const LogoutIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
    </svg>
);
// We define a type for our page's status for better type safety
type PageStatus = 'loading' | 'success' | 'error';
// ... you can add the other SVGs here as well

const DataComparisonPage: React.FC = () => {


    const [status, setStatus] = useState<PageStatus>('loading');
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    // API authentication state from our custom hook
    const { isD365Authenticated, isLoading: isAuthLoading, error: authError } = useApiAuth();



    // State for all your data sources
    const [preqinData, setPreqinData] = useState<CompanyData | null>(null);
    const [dakotaData, setDakotaData] = useState<CompanyData | null>(null);
    const [pitchbookData, setPitchbookData] = useState<CompanyData | null>(null);
    const [zoomInfoData, setZoomInfoData] = useState<CompanyData | null>(null);
    const [crmData, setCrmData] = useState<CrmData | null>(null);
    // We will add state and logic here in the next step


    // const [preqinContacts, setPreqinContacts] = useState<Contact[]>([]);
    // const [dakotaContacts, setDakotaContacts] = useState<Contact[]>([]);
    // const [pitchbookContacts, setPitchbookContacts] = useState<Contact[]>([]);
    // const [zoomInfoContacts, setZoomInfoContacts] = useState<Contact[]>([]);
    // const [crmContacts, setCrmContacts] = useState<Contact[]>([]);
    const [searchParams] = useSearchParams();


    useEffect(() => {
        // onAuthStateChanged returns an unsubscribe function. We use it for cleanup.
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // User is signed in.
                setUser(currentUser);
            } else {
                // User is signed out, redirect to login.
                navigate('/login');
            }
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [navigate]);
    useEffect(() => {
        // Your auth listener can stay if you need it for displaying user info
        // onAuthStateChanged(...)

        setStatus('loading');

        try {
            const dataParam = searchParams.get('data');

            if (!dataParam) {
                // No data in URL, we'll show the empty table.
                // Set all data to null to ensure a clean state.
                setPreqinData(null);
                setDakotaData(null);
                setPitchbookData(null);
                setZoomInfoData(null);
                setCrmData(null);
                setStatus('success'); // It's a success, just with no data
                return; // Stop execution here
            }

            // Decode and parse data from URL
            const decodedData = atob(decodeURIComponent(dataParam));
            const data = JSON.parse(decodedData);

            // Set all the data into our React state
            setPreqinData(data.company || null);
            setDakotaData(data.dakota || null);
            setPitchbookData(data.pitchbook || null);
            setZoomInfoData(data.zoominfo || null);
            setCrmData(data.crm || null);

            // Set contacts data
            // setPreqinContacts(decodedData.contacts || []);
            // setDakotaContacts(decodedData.dakotaContacts || []);
            // setPitchbookContacts(decodedData.pitchbookContacts || []);
            // setZoomInfoContacts(decodedData.zoomInfoContacts || []);
            // // CRM contacts might come from a separate source in URL data
            // setCrmContacts(decodedData.crmContacts || []);
            // You can also process contacts here and set them to state
            // const filteredContacts = (data.contacts || []).filter(...);
            // setContacts(filteredContacts);


        } catch (error) {
            console.error('Error loading comparison data:', error);
            setStatus('error');
            // Set error state for UI to display a message
        }

    }, [searchParams]); // Re-run this logic if the URL search params change

    // const mergedContacts = useMemo<MergedContact[]>(() => {
    //     if (isAuthLoading) return []; // Don't compute until auth checks are done
    //     return mergeAndMatchContacts(
    //         preqinContacts,
    //         dakotaContacts,
    //         pitchbookContacts,
    //         zoomInfoContacts,
    //         crmContacts
    //     );
    // }, [preqinContacts, dakotaContacts, pitchbookContacts, zoomInfoContacts, crmContacts, isAuthLoading]);


    const handleSearch = async (source: DataSource, query: string) => {
        try {
            const result = await apiService.searchEnhanced(source, query);

            // Update the state for the specific source that was searched
            switch (source) {
                case 'crm':
                    setCrmData(result.company as CrmData); // May need type casting
                    // setCrmContacts(result.contacts);
                    break;
                case 'preqin':
                    setPreqinData(result.company);
                    // setPreqinContacts(result.contacts);
                    break;
                case 'dakota':
                    setDakotaData(result.company);
                    // setDakotaContacts(result.contacts);
                    break;
                case 'pitchbook':
                    setPitchbookData(result.company);
                    // setPitchbookContacts(result.contacts);
                    break;
                case 'zoominfo':
                    setZoomInfoData(result.company);
                    // setZoomInfoContacts(result.contacts);
                    break;
            }
            // You can add a success toast/notification here
        } catch (error) {
            console.error(`Search failed for ${source}:`, error);
            // You can add an error toast/notification here
        }
    };
    // ... (your render logic with the switch case for status) ...
    // ... we will modify the 'success' case
    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('user-token'); // Clear any session info
            navigate('/login');
        } catch (err) {
            console.error("Failed to log out:", err);
            setError("Could not log out. Please try again.");
        }
    };
    // The main render logic

    const AuthStatusIndicator = () => {
        if (isAuthLoading) {
            return <div className="text-sm text-gray-500">Authenticating with data sources...</div>;
        }
        if (authError) {
            return <div className="text-sm text-red-600 font-semibold">{authError}</div>;
        }
        return (
            <div className="flex flex-col space-y-1">
                <div className="text-sm text-green-600">
                    Data sources authenticated successfully.
                </div>
                {/* Show a specific warning if D365 is not connected */}
                {!isD365Authenticated && (
                    <div className="text-sm text-yellow-600 font-medium">
                        Warning: D365 connection not available. CRM data may be limited.
                    </div>
                )}
            </div>
        );
    };


    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="text-center py-16 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <div className="loading-spinner"></div>
                        </div>
                        <p className="text-lg text-gray-600 font-medium">Loading comparison data...</p>
                        <p className="text-sm text-gray-500 mt-2">Verifying user and fetching data</p>
                    </div>
                );
            case 'success':
                return (
                    <AccountViewTable
                        preqinData={preqinData}
                        dakotaData={dakotaData}
                        pitchbookData={pitchbookData}
                        zoomInfoData={zoomInfoData}
                        crmData={crmData}
                        onSearch={handleSearch}
                    />
                );
            case 'error':
                return (
                    <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
                        <div className="flex items-center">
                            {/* ... error icon svg ... */}
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                );
        }
    };
    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            <div className="min-h-screen p-4">
                <div className="max-w-[80%] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        {/* User Info */}
                        <div className="flex items-center space-x-4">
                            {user && ( // Only show user info if user object exists
                                <div className="text-sm">
                                    <div className="font-medium text-gray-700">{user.displayName || 'CRM User'}</div>
                                    <div className="text-gray-500">{user.email}</div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                            <button onClick={handleLogout} className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover-lift" title="Sign out of your account">
                                <LogoutIcon />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
                            <HeaderIcon />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-2">
                            AJAIA CRM Intelligence - Data Comparison
                        </h1>
                    </div>


                    <div className="my-4">
                        <AuthStatusIndicator />
                    </div>

                    {renderContent()} {/* This function renders the main content based on the page status */}
                </div>
            </div>
        </div>
    );
};

export default DataComparisonPage;