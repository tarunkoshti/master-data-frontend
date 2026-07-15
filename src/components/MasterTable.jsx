import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

export default function MasterTable({ 
  data, 
  columns,
  onEdit, 
  onDelete, 
  globalFilter,
  setGlobalFilter
}) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
  });

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4">

      <div className="w-full overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${header.id === 'actions' ? 'text-right' : ''}`}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort() && header.id !== 'actions'
                            ? 'cursor-pointer select-none flex items-center gap-1.5 hover:text-slate-800 transition-colors inline-flex group'
                            : `flex items-center gap-1.5 inline-flex ${header.id === 'actions' ? 'justify-end w-full' : ''}`,
                          onClick: header.id !== 'actions' ? header.column.getToggleSortingHandler() : undefined,
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ArrowUp className="w-4 h-4 text-primary-600" />,
                          desc: <ArrowDown className="w-4 h-4 text-primary-600" />,
                        }[header.column.getIsSorted()] ?? (
                          header.column.getCanSort() && header.id !== 'actions' ? (
                            <ArrowUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-500 transition-colors" />
                          ) : null
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === 'actions') {
                      return (
                         <td key={cell.id} className="p-3 w-32">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                  onClick={() => onEdit(row.original)}
                                  className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                               </button>
                               {/* <button 
                                  onClick={() => onDelete(row.original)}
                                  className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                               </button> */}
                            </div>
                         </td>
                      )
                    }

                    return (
                      <td key={cell.id} className="p-3 text-sm text-slate-600">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="h-14">
                {columns.map((_, i) => (
                  <td key={`empty-${i}`} className="p-3"></td>
                ))}
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
