import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CDBBA4] w-5 h-5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 rounded-xl border border-[#E8DCC8] bg-white text-[#2B211B] focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CDBBA4] hover:text-[#766A60]"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
