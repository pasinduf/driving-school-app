import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export interface DropdownOption {
    id: string;
    label: string;
}

interface SearchableMultiSelectProps {
    placeholder?: string;
    fetchOptions: (query: string) => Promise<DropdownOption[]>;
    selectedOptions: DropdownOption[];
    onAdd: (option: DropdownOption) => void;
    onRemove: (id: string) => void;
}

export default function SearchableMultiSelect({
    placeholder = 'Search...',
    fetchOptions,
    selectedOptions,
    onAdd,
    onRemove
}: SearchableMultiSelectProps) {
    const [searchText, setSearchText] = useState('');
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useDebounce(searchText, 300);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const prevDebouncedSearch = useRef('');

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (debouncedSearch.length === 0) {
            setOptions([]);
            setShowDropdown(false);
            prevDebouncedSearch.current = '';
            setIsLoading(false);
        } else if (debouncedSearch !== prevDebouncedSearch.current) {
            prevDebouncedSearch.current = debouncedSearch;
            setIsLoading(true);
            fetchOptions(debouncedSearch)
                .then(data => {
                    setOptions(data);
                    setShowDropdown(true);
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [debouncedSearch, fetchOptions]);

    // Filter out options that are already selected
    const availableOptions = options.filter(
        opt => !selectedOptions.some(selected => selected.id === opt.id)
    );

    return (
        <div className="w-full relative" ref={dropdownRef}>
            <div className="border rounded bg-white p-2 min-h-[42px] flex flex-wrap gap-2 items-center">

                {/* Selected Chips */}
                {selectedOptions.map(opt => (
                    <div key={opt.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        <span className="truncate max-w-[150px]">{opt.label}</span>
                        <button
                            type="button"
                            onClick={() => onRemove(opt.id)}
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* Search Input */}
                <div className="flex-1 min-w-[120px] relative flex items-center">
                    <Search className="absolute left-2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        className="w-full bg-transparent outline-none p-1 pl-8 text-sm"
                        placeholder={selectedOptions.length === 0 ? placeholder : 'Add more...'}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onFocus={() => {
                            if (availableOptions.length > 0) setShowDropdown(true);
                        }}
                    />
                    {isLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && searchText.length > 0 && !isLoading && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                    {availableOptions.length > 0 ? availableOptions.map(opt => (
                        <li
                            key={opt.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                                onAdd(opt);
                                setSearchText('');
                                setShowDropdown(false);
                                prevDebouncedSearch.current = '';
                            }}
                        >
                            {opt.label}
                        </li>
                    )) : (
                        <li className="px-4 py-2 text-gray-500 text-sm italic">
                            {options.length > 0 ? 'All mapped results already selected' : 'No results found'}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
