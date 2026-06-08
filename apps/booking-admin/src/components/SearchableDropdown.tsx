import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export interface DropdownOption {
    id: string;
    label: string;
}

interface SearchableDropdownProps {
    placeholder?: string;
    fetchOptions: (query: string) => Promise<DropdownOption[]>;
    onSelect: (option: DropdownOption | null) => void;
    value?: string; // Currently selected display value
    onClear?: () => void;
    hasSelection?: boolean;
}

export default function SearchableDropdown({ placeholder = 'Search...', fetchOptions, onSelect, value = '', onClear, hasSelection = false }: SearchableDropdownProps) {
    const [searchText, setSearchText] = useState(value);
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const debouncedSearch = useDebounce(searchText, 300);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync external value
    useEffect(() => {
        setSearchText(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const prevDebouncedSearch = useRef('');
    const valueRef = useRef(value);

    // Sync ref synchronously to avoid dependency trigger loop
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        // Safe check without triggering purely on upstream `value` shifts
        if (debouncedSearch.length === 0 || debouncedSearch === valueRef.current) {
            setOptions([]);
            setShowDropdown(false);
            prevDebouncedSearch.current = '';
        } else if (debouncedSearch !== prevDebouncedSearch.current) {
            prevDebouncedSearch.current = debouncedSearch;
            fetchOptions(debouncedSearch).then(data => {
                setOptions(data);
                setShowDropdown(true);
            }).catch(console.error);
        }
    }, [debouncedSearch, fetchOptions]);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative w-full flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    className="w-full border rounded p-2 pl-9 pr-10"
                    placeholder={placeholder}
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        if (hasSelection && onClear) {
                            onClear(); // Tell parent we no longer have a selection
                        }
                    }}
                    onFocus={() => { if (options.length > 0) setShowDropdown(true); }}
                />
                {hasSelection && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchText('');
                            if (onClear) onClear();
                        }}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            {showDropdown && searchText.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                    {options.length > 0 ? options.map(opt => (
                        <li
                            key={opt.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                                onSelect(opt);
                                setSearchText(opt.label);
                                setShowDropdown(false);
                            }}
                        >
                            {opt.label}
                        </li>
                    )) : (
                        <li className="px-4 py-2 text-gray-500 text-sm">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
}
