import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  id,
  disabled = false,
  searchable = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border rounded-lg py-2.5 px-3.5 text-sm transition-colors duration-150 focus:outline-none
          ${disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-70' :
            error 
            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' 
            : isOpen 
              ? 'border-primary-500 ring-2 ring-primary-100' 
              : 'border-slate-300 hover:border-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
          }`}
      >
        <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-800'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1 max-h-60 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          {searchable && options.length > 0 && (
            <div className="px-2 pb-1 pt-1 border-b border-slate-100 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-3 text-sm text-slate-500 text-center">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors
                      ${isSelected ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    <span className="block truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
