// src/components/ColumnSearch.tsx
import React, { useState, useEffect, useRef } from 'react';
import { apiService, type DataSource, type Suggestion } from '../services/apiService';
import { useDebounce } from '../hooks/useDebounce';

interface ColumnSearchProps {
    source: DataSource;
    initialValue: string;
    onSubmit: (source: DataSource, query: string) => void;
    color: string; // Keep this for styling
}

const ColumnSearch: React.FC<ColumnSearchProps> = ({ source, initialValue, onSubmit }) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const debouncedQuery = useDebounce(query, 300);
    const containerRef = useRef<HTMLFormElement>(null);

    // Effect to fetch suggestions when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const results = await apiService.getSuggestions(source, debouncedQuery);
                setSuggestions(results);
            } catch (error) {
                console.error(error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery, source]);

    // Effect to handle clicking outside to close dropdown
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
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder={`Search ${source}`}
            // ... styling ...
            />
            <button type="submit">Go</button>

            {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {isLoading && <div className="p-2 text-sm text-gray-500">Loading...</div>}
                    {!isLoading && suggestions.length === 0 && debouncedQuery.length > 1 && (
                        <div className="p-2 text-sm text-gray-500">No results found.</div>
                    )}
                    {!isLoading && suggestions.map((s, i) => (
                        <div key={i} onClick={() => handleSuggestionClick(s)} className="p-2 text-sm hover:bg-gray-100 cursor-pointer">
                            {s.name}
                        </div>
                    ))}
                </div>
            )}
        </form>
    );
};

export default ColumnSearch;