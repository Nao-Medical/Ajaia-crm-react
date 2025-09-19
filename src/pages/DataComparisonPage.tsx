// src/pages/DataComparisonPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { useApiAuth } from '../hooks/useApiAuth';
import { type CrmData, type CompanyData, type Contact as OriginalContact } from '../types/crm';
import { apiService, type DataSource } from '../services/apiService';
import AccountViewTable from '../components/AccountViewTable';
import './DataComparisonPage.css';

// Type definition remains the same
type Contact = OriginalContact & {
    source: DataSource;
    category?: string;
    sourceTag?: string;
};


// Helper components for SVGs (No changes)
const HeaderIcon = () => (<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>);
const LogoutIcon = () => (<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>);
type PageStatus = 'loading' | 'success' | 'error';


// ContactView Component
interface ContactViewProps {
    contacts: Contact[];
}

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
);

const ContactView: React.FC<ContactViewProps> = ({ contacts }) => {
    const [openContactId, setOpenContactId] = useState<string | null>(contacts.length > 0 ? contacts[0].id : null);

    const handleToggle = (contactId: string) => {
        setOpenContactId(prevId => (prevId === contactId ? null : contactId));
    };

    if (!contacts || contacts.length === 0) {
        return null;
    }

    const contactFields = (contact: Contact) => [
        { label: 'LinkedIn', value: contact.linkedInUrl }, { label: 'Dear', value: contact.dear },
        { label: 'First Name', value: contact.firstName }, { label: 'Last Name', value: contact.lastName },
        { label: 'Job Title', value: contact.title }, { label: 'Phone', value: contact.phone },
        { label: 'Email', value: contact.email }, { label: 'City', value: contact.city },
        { label: 'State', value: contact.state }, { label: 'Zip Code', value: contact.zipCode },
        { label: 'Country', value: contact.country },
    ];

    const sourceHeaders: { name: string, key: DataSource, color: string }[] = [
        { name: 'CRM', key: 'crm', color: 'bg-green-500' }, { name: 'Preqin', key: 'preqin', color: 'bg-purple-500' },
        { name: 'Dakota', key: 'dakota', color: 'bg-orange-500' }, { name: 'PitchBook', key: 'pitchbook', color: 'bg-blue-500' },
        { name: 'ZoomInfo', key: 'zoominfo', color: 'bg-red-500' },
    ];

    const getHeaderStyles = (contact: Contact) => {
        const tag = contact.sourceTag || contact.source;
        switch (tag) {
            case 'CRM': case 'crm': return { bg: 'bg-gray-50', tagBg: 'bg-green-100', tagText: 'text-green-800' };
            case 'Dakota': case 'dakota': return { bg: 'bg-orange-50', tagBg: 'bg-white border border-orange-300', tagText: 'text-orange-800' };
            // Added a style case for Preqin for consistency
            case 'Preqin': case 'preqin': return { bg: 'bg-purple-50', tagBg: 'bg-white border border-purple-300', tagText: 'text-purple-800' };
            case 'CRM + Dakota': return { bg: 'bg-gray-50', tagBg: 'bg-yellow-200', tagText: 'text-yellow-800' };
            default: return { bg: 'bg-white', tagBg: 'bg-gray-200', tagText: 'text-gray-800' };
        }
    };

    return (
        <div className="mt-8 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white rounded-t-lg shadow-lg">
                <h2 className="text-xl font-bold">Contact View</h2>
            </div>
            <div className="space-y-px bg-slate-200 rounded-b-lg shadow-inner overflow-hidden">
                {contacts.map(contact => {
                    const isOpen = openContactId === contact.id;
                    const headerStyles = getHeaderStyles(contact);

                    return (
                        <div key={contact.id} className={`${headerStyles.bg}`}>
                            <button onClick={() => handleToggle(contact.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 focus:outline-none transition-colors">
                                <div className="flex items-center space-x-4">
                                    <span className="font-bold text-gray-900">{`${contact.firstName} ${contact.lastName}`}</span>
                                    <span className="text-sm text-gray-500">{contact.title || 'N/A'}</span>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${headerStyles.tagBg} ${headerStyles.tagText}`}>
                                        {contact.sourceTag || contact.source.toUpperCase()}
                                    </span>
                                    {contact.category && (
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                            {contact.category}
                                        </span>
                                    )}
                                </div>
                                <ChevronIcon isOpen={isOpen} />
                            </button>

                            {isOpen && (
                                <div className="border-t border-gray-200 p-4 bg-white animate-fade-in-fast">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300 text-sm">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="p-2 border border-gray-300 text-left font-semibold text-gray-700 w-[150px]">Field</th>
                                                    {sourceHeaders.map(header => (
                                                        <th key={header.key} className="p-2 border border-gray-300 text-left font-semibold text-gray-700">
                                                            <span className="flex items-center"><span className={`w-2 h-2 rounded-full ${header.color} mr-2`}></span>{header.name}</span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contactFields(contact).map(field => (
                                                    <tr key={field.label} className="even:bg-white odd:bg-slate-50">
                                                        <td className="p-2 border border-gray-300 font-medium text-gray-800">{field.label}</td>
                                                        {sourceHeaders.map(header => {
                                                            const hasData = contact.source === header.key && field.value;
                                                            return (
                                                                <td key={header.key} className={`p-2 border border-gray-300 text-gray-700 ${hasData ? 'bg-yellow-100 font-semibold' : ''}`}>
                                                                    {hasData ? (field.value) : <span className="text-gray-400">N/A</span>}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const DataComparisonPage: React.FC = () => {
    const [status, setStatus] = useState<PageStatus>('loading');
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isD365Authenticated, isLoading: isAuthLoading, error: authError } = useApiAuth();
    const [preqinData, setPreqinData] = useState<CompanyData | null>(null);
    const [dakotaData, setDakotaData] = useState<CompanyData | null>(null);
    const [pitchbookData, setPitchbookData] = useState<CompanyData | null>(null);
    const [zoomInfoData, setZoomInfoData] = useState<CompanyData | null>(null);
    const [crmData, setCrmData] = useState<CrmData | null>(null);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) { setUser(currentUser); } else { navigate('/login'); }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        setStatus('loading');
        try {
            const dataParam = searchParams.get('data');
            if (!dataParam) {
                setPreqinData(null); setDakotaData(null); setPitchbookData(null); setZoomInfoData(null); setCrmData(null);
                setAllContacts([]);
                setStatus('success');
                return;
            }

            const decodedData = atob(decodeURIComponent(dataParam));
            const data = JSON.parse(decodedData);

            setPreqinData(data.company || null); setDakotaData(data.dakota || null); setPitchbookData(data.pitchbook || null); setZoomInfoData(data.zoominfo || null);

            if (data.crm) {
                setCrmData(data.crm.company || null);
                // **FIX 1**: Removed the incorrect 'category' assignment for initial CRM contacts.
                const initialContacts = (data.crm.contacts || []).map((contact: OriginalContact) => ({
                    ...contact,
                    source: 'crm' as DataSource,
                    sourceTag: 'CRM',
                }));
                setAllContacts(initialContacts);
            } else {
                setCrmData(null); setAllContacts([]);
            }
            setStatus('success');
        } catch (error) {
            console.error('Error loading comparison data:', error);
            setStatus('error');
        }
    }, [searchParams]);

    const handleSearch = async (source: DataSource, query: string) => {
        try {
            const result = await apiService.searchEnhanced(source, query);

            if (result.contacts && result.contacts.length > 0) {
                const newContactsWithSource: Contact[] = result.contacts.map(c => ({
                    ...c,
                    source: source,
                    sourceTag: source.charAt(0).toUpperCase() + source.slice(1),
                    // **FIX 2**: The 'category' is now conditionally assigned ONLY if the source is 'preqin'.
                    // For all other sources, this property will be undefined, and the tag won't render.
                    category: source === 'preqin'
                        ? (c.title?.includes('Senior') ? 'INF' : 'PE')
                        : undefined
                }));

                setAllContacts(prevContacts => {
                    const existingIds = new Set(prevContacts.map(c => c.id));
                    const uniqueNewContacts = newContactsWithSource.filter(c => !existingIds.has(c.id));
                    return [...prevContacts, ...uniqueNewContacts];
                });
            }

            switch (source) {
                case 'crm': setCrmData(result.company as CrmData); break;
                case 'preqin': setPreqinData(result.company); break;
                case 'dakota': setDakotaData(result.company); break;
                case 'pitchbook': setPitchbookData(result.company); break;
                case 'zoominfo': setZoomInfoData(result.company); break;
            }
        } catch (error) {
            console.error(`Search failed for ${source}:`, error);
        }
    };


    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('user-token');
            navigate('/login');
        } catch (err) {
            console.error("Failed to log out:", err);
            setError("Could not log out. Please try again.");
        }
    };

    const AuthStatusIndicator = () => {
        if (isAuthLoading) { return <div className="text-sm text-gray-500">Authenticating with data sources...</div>; }
        if (authError) { return <div className="text-sm text-red-600 font-semibold">{authError}</div>; }
        return (
            <div className="flex flex-col space-y-1">
                <div className="text-sm text-green-600">Data sources authenticated successfully.</div>
                {!isD365Authenticated && (<div className="text-sm text-yellow-600 font-medium">Warning: D365 connection not available. CRM data may be limited.</div>)}
            </div>
        );
    };

    const renderContent = () => {
        switch (status) {
            case 'loading': return (<div className="text-center py-16 animate-fade-in"><div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4"><div className="loading-spinner"></div></div><p className="text-lg text-gray-600 font-medium">Loading comparison data...</p></div>);
            case 'success': return (
                <>
                    <AccountViewTable preqinData={preqinData} dakotaData={dakotaData} pitchbookData={pitchbookData} zoomInfoData={zoomInfoData} crmData={crmData} onSearch={handleSearch} />
                    <ContactView contacts={allContacts} />
                </>
            );
            case 'error': return (<div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-700 font-medium">{error || "An error occurred while loading data."}</p></div>);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            <div className="min-h-screen p-4">
                <div className="max-w-[80%] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            {user && (<div className="text-sm"><div className="font-medium text-gray-700">{user.displayName || 'CRM User'}</div><div className="text-gray-500">{user.email}</div></div>)}
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={handleLogout} className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover-lift" title="Sign out of your account">
                                <LogoutIcon />
                                Logout
                            </button>
                        </div>
                    </div>
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg"><HeaderIcon /></div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-2">AJAIA CRM Intelligence - Data Comparison</h1>
                    </div>
                    <div className="my-4"><AuthStatusIndicator /></div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DataComparisonPage;