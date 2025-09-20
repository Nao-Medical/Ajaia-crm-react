// src/pages/DataComparisonPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useApiAuth } from '../hooks/useApiAuth';
import AccountViewTable from '../components/AccountViewTable';
import './DataComparisonPage.css';
import LogoutIcon from '../components/LogoutIcon';
import AuthStatusIndicator from '../components/AuthStatusIndicator';
import HeaderIcon from '../components/HeaderIcon';
import { type CompanyData, type CrmData, type Contact } from '../types/crm';
import ContactView from '../components/ContactView';

const DataComparisonPage: React.FC = () => {
    const navigate = useNavigate();
    const { isD365Authenticated, isLoading: isAuthLoading, error: authError } = useApiAuth();

    const [crmData, setCrmData] = useState<CrmData | null>(null);
    const [preqinData, setPreqinData] = useState<CompanyData | null>(null);
    const [dakotaData, setDakotaData] = useState<CompanyData | null>(null);
    const [pitchbookData, setPitchbookData] = useState<CompanyData | null>(null);
    const [zoomInfoData, setZoomInfoData] = useState<CompanyData | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('user-token');
            navigate('/login');
        } catch (err) {
            console.error("Failed to log out:", err);
        }
    };
    
    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            <div className="min-h-screen p-4">
                <div className="max-w-[80%] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm">
                                <div className="font-medium text-gray-700">CRM User</div>
                                <div className="text-gray-500">user@example.com</div>
                            </div>
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
                    <div className="my-4">
                        <AuthStatusIndicator isAuthLoading={isAuthLoading} authError={authError} isD365Authenticated={isD365Authenticated} />
                    </div>
                    {isD365Authenticated && (
                        <>
                            <AccountViewTable
                                crmData={crmData}
                                preqinData={preqinData}
                                dakotaData={dakotaData}
                                pitchbookData={pitchbookData}
                                zoomInfoData={zoomInfoData}
                                setCrmData={setCrmData}
                                setPreqinData={setPreqinData}
                                setDakotaData={setDakotaData}
                                setPitchbookData={setPitchbookData}
                                setZoomInfoData={setZoomInfoData}
                                setContacts={setContacts}
                            />
                            <ContactView contacts={contacts} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataComparisonPage;