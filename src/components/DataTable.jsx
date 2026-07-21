import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from 'lucide-react';
import Pagination from './Pagination';

export default function DataTable({
  columns,
  data,
  isLoading,

  // Server-side sorting
  sortConfig,
  onSort,

  // Server-side pagination
  paginationData,
  onPageChange,
  limit,
}) {

  // Client-side state (used if server-side props are not provided)
  const [clientSortConfig, setClientSortConfig] = useState({ sortBy: null, sortOrder: 'asc' });
  const [clientPage, setClientPage] = useState(1);
  const clientLimit = limit || 10;

  const isServerSideSort = Boolean(onSort);
  const isServerSidePagination = Boolean(paginationData && onPageChange);

  const currentSortConfig = isServerSideSort ? sortConfig : clientSortConfig;

  const handleSortClick = (key) => {
    if (isServerSideSort) {
      onSort(key);
    } else {
      let direction = 'asc';
      if (clientSortConfig.sortBy === key && clientSortConfig.sortOrder === 'asc') {
        direction = 'desc';
      }
      setClientSortConfig({ sortBy: key, sortOrder: direction });
    }
  };

  // Process data for client-side if needed
  const processedData = useMemo(() => {
    if (isServerSideSort && isServerSidePagination) return data;

    let processed = [...data];

    // Client-side sort
    if (!isServerSideSort && currentSortConfig.sortBy) {
      processed.sort((a, b) => {
        let valA = a[currentSortConfig.sortBy];
        let valB = b[currentSortConfig.sortBy];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSortConfig.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortConfig.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Client-side pagination
    if (!isServerSidePagination) {
      const startIndex = (clientPage - 1) * clientLimit;
      processed = processed.slice(startIndex, startIndex + clientLimit);
    }

    return processed;
  }, [data, isServerSideSort, isServerSidePagination, currentSortConfig, clientPage, clientLimit]);

  const renderSortIcon = (key, sortable) => {
    if (!sortable) return null;
    if (currentSortConfig?.sortBy !== key) return <ArrowUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    return currentSortConfig?.sortOrder === 'asc'
      ? <ArrowUp className="w-4 h-4 text-primary-700 font-bold" />
      : <ArrowDown className="w-4 h-4 text-primary-700 font-bold" />;
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="overflow-x-auto rounded-t-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, idx) => (
                <th key={idx} className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {col.sortable ? (
                    <div
                      className="cursor-pointer select-none flex items-center gap-1.5 hover:text-slate-800 transition-colors inline-flex group"
                      onClick={() => handleSortClick(col.accessor)}
                    >
                      {col.header}
                      {renderSortIcon(col.accessor, col.sortable)}
                    </div>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
                    <p className="font-medium">Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="font-medium text-lg text-slate-900 mb-1">No data found</p>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              processedData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`p-3 text-sm text-slate-600 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && processedData.length > 0 && (
        isServerSidePagination && paginationData ? (
          <Pagination
            currentPage={paginationData.page}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.totalDocuments}
            hasPrevPage={paginationData.hasPrevPage}
            hasNextPage={paginationData.hasNextPage}
            onPageChange={onPageChange}
            limit={limit}
          />
        ) : !isServerSidePagination && data.length > clientLimit ? (
          <Pagination
            currentPage={clientPage}
            totalPages={Math.ceil(data.length / clientLimit)}
            totalItems={data.length}
            hasPrevPage={clientPage > 1}
            hasNextPage={clientPage < Math.ceil(data.length / clientLimit)}
            onPageChange={setClientPage}
            limit={clientLimit}
          />
        ) : null
      )}
    </div>
  );
}
