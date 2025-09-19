// src/components/ColumnSearch.tsx
import React, { useState, useEffect, useRef } from 'react';
import { apiService, type DataSource, type Suggestion } from '../services/apiService';
import { useDebounce } from '../hooks/useDebounce';
import { FaSpinner } from 'react-icons/fa';
import { HiOutlineOfficeBuilding, HiOutlineLocationMarker } from 'react-icons/hi';

// (The colorStyles object and ColorTheme type remain the same)
type ColorTheme = 'green' | 'purple' | 'blue' | 'orange' | 'red' | string;
const colorStyles: Record<ColorTheme, { bg: string, hover: string, focusRing: string }> = {
    green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', focusRing: 'focus:ring-green-500' },
    purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', focusRing: 'focus:ring-purple-500' },
    blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', focusRing: 'focus:ring-blue-500' },
    orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', focusRing: 'focus:ring-orange-500' },
    red: { bg: 'bg-red-600', hover: 'hover:bg-red-700', focusRing: 'focus:ring-red-500' },
    default: { bg: 'bg-gray-600', hover: 'hover:bg-gray-700', focusRing: 'focus:ring-gray-500' }
};

interface ColumnSearchProps {
    source: DataSource;
    initialValue: string;
    onSubmit: (source: DataSource, query: string) => void;
    color: ColorTheme;
}

const ColumnSearch: React.FC<ColumnSearchProps> = ({ source, initialValue, onSubmit, color }) => {
    // --- UPDATED: Reduced limit for a cleaner look ---
    const SUGGESTION_LIMIT = 5;

    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const debouncedQuery = useDebounce(query, 300);
    const containerRef = useRef<HTMLFormElement>(null);
    const theme = colorStyles[color] || colorStyles.default;

    // (Effects and handlers remain the same)
    useEffect(() => {
        if (debouncedQuery.length < 2) { setSuggestions([]); return; }
        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const results = await apiService.getSuggestions(source, debouncedQuery);
                setSuggestions(results);
            } catch (error) { console.error(error); setSuggestions([]); }
            finally { setIsLoading(false); }
        };
        fetchSuggestions();
    }, [debouncedQuery, source]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(source, query);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        setQuery(suggestion.name);
        onSubmit(source, suggestion.name);
        setShowSuggestions(false);
    };

    return (
        <form onSubmit={handleFormSubmit} ref={containerRef} className="relative flex items-center space-x-1 p-1">
            {/* Input and Button are unchanged */}
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder={`Search ${source}...`}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${theme.focusRing}`}
            />
            <button
                type="submit"
                className={`px-2 py-1 text-sm text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${theme.bg} ${theme.hover} ${theme.focusRing}`}
            >
                Go
            </button>

            {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {/* Loader and No Results message are unchanged */}
                    {isLoading && (
                        <div className="flex justify-center items-center p-4">
                            <FaSpinner className="animate-spin text-gray-400 text-xl" />
                        </div>
                    )}
                    {!isLoading && suggestions.length === 0 && debouncedQuery.length > 1 && (
                        <div className="p-3 text-sm text-gray-500">No results found.</div>
                    )}

                    {/* --- NEW: Redesigned Suggestion List --- */}
                    {!isLoading && suggestions.slice(0, SUGGESTION_LIMIT).map((s) => (
                        <div
                            key={s.id}
                            onClick={() => handleSuggestionClick(s)}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                            {/* Line 1: Company Name */}
                            <div className="font-semibold text-sm text-gray-800 truncate">
                                {s.name}
                            </div>

                            {/* Line 2: Metadata */}
                            <div className="flex items-center space-x-5 text-xs text-gray-500 mt-1.5">
                                <span className="flex items-center">
                                    <HiOutlineOfficeBuilding className="mr-1.5 text-gray-400" />
                                    <span className="mr-1">Type:</span>
                                    <span className="font-medium text-gray-600">{s.type}</span>
                                </span>
                                <span className="flex items-center">
                                    <HiOutlineLocationMarker className="mr-1.5 text-gray-400" />
                                    {s.city}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </form>
    );
};

export default ColumnSearch;