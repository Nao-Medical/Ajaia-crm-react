import React from 'react';

interface AuthStatusIndicatorProps {
    isAuthLoading: boolean;
    authError: string | null;
    isD365Authenticated: boolean;
}

const Spinner = () => (
    <svg className="animate-spin h-6 w-6 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
);

const AuthStatusIndicator: React.FC<AuthStatusIndicatorProps> = ({ isAuthLoading, authError, isD365Authenticated }) => {
    if (isAuthLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <Spinner />
                <div className="text-base text-gray-600 font-medium">Authenticating with data sources...</div>
            </div>
        );
    }
    if (authError) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <div className="text-base text-red-600 font-semibold">{authError}</div>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-center py-4">
            <div className="text-base text-green-700 font-semibold flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Data sources authenticated successfully.
            </div>
            {!isD365Authenticated && (
                <div className="text-sm text-yellow-700 font-medium mt-2 flex items-center gap-2">
                    <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Warning: D365 connection not available. CRM data may be limited.
                </div>
            )}
        </div>
    );
};

export default AuthStatusIndicator;