import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';

const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select...", 
  searchPlaceholder = "Search...",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input-field flex items-center justify-between bg-white text-left cursor-default sm:text-sm"
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-[#2B211B] font-medium'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none flex items-center text-gray-400">
          <FiChevronDown className="h-4 w-4 text-[#CDBBA4]" aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-[#E8DCC8]">
          <div className="sticky top-0 z-10 bg-white px-2 py-2 border-b border-[#E8DCC8]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C85A17] focus:border-[#C85A17]"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <ul className="max-h-48 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="text-gray-500 cursor-default select-none relative py-3 pl-3 pr-9 text-sm text-center">
                No results found
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-[#FFF8EC] transition-colors ${
                    value === option.value ? 'bg-[#FFF8EC] text-[#C85A17]' : 'text-gray-900'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span className={`block truncate ${value === option.value ? 'font-bold text-[#7A2525]' : 'font-normal'}`}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#C85A17]">
                      <FiCheck className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
