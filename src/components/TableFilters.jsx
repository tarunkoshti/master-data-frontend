import React from 'react';
import { Search } from 'lucide-react';

export default function TableFilters({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  children // For custom filters like Status dropdown
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        />
      </div>
      
      {children && (
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
