import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

// Sortable Row Component
const SortableRow = ({ row, onEdit, onToggleStatus, onDelete, isDragEnabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.original.id }); // Assuming id is the Mongo ID

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: isDragging ? 'relative' : 'static',
    zIndex: isDragging ? 10 : 'auto',
    background: isDragging ? '#f8fafc' : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-slate-200 hover:bg-slate-50 transition-colors group"
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === 'drag') {
          return (
            <td key={cell.id} className="p-3 w-12 text-center text-slate-400">
              <button
                {...attributes}
                {...listeners}
                disabled={!isDragEnabled}
                className={`p-1 touch-none ${isDragEnabled ? 'hover:text-slate-700 cursor-grab active:cursor-grabbing' : 'opacity-30 cursor-not-allowed'}`}
                title={!isDragEnabled ? "Clear sort/search to reorder" : "Drag to reorder"}
              >
                <GripVertical className="w-5 h-5" />
              </button>
            </td>
          );
        }
        
        if (cell.column.id === 'actions') {
          return (
             <td key={cell.id} className="p-3 w-32">
                <div className="flex items-center justify-end gap-2">
                   <button 
                      onClick={() => onToggleStatus(row.original)}
                      className={`p-1.5 rounded-md transition-colors ${
                        row.original.is_active 
                          ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                          : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title={row.original.is_active ? 'Disable' : 'Enable'}
                    >
                      {row.original.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                   </button>
                   <button 
                      onClick={() => onEdit(row.original)}
                      className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                   </button>
                   <button 
                      onClick={() => onDelete(row.original)}
                      className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                   </button>
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
  );
};

export default function MasterTable({ 
  data, 
  columns,
  onDataChange, 
  onSaveOrder, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  isReordering 
}) {
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );



  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

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
    getRowId: (row) => row.id, // Must match the sortable ID
  });

  const isDragEnabled = sorting.length === 0 && !globalFilter;

  const handleDragEnd = (event) => {
    if (!isDragEnabled) return;
    
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
      
      const newData = arrayMove(data, oldIndex, newIndex);
      // Update local state in parent
      onDataChange(newData);
    }
  };

  if (!data || data.length === 0) return null; // Parent handles empty state

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="px-4 pt-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search in all columns..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>
      <div className="w-full overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-left border-collapse">
            <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort() && header.id !== 'drag' && header.id !== 'actions'
                            ? 'cursor-pointer select-none flex items-center gap-1.5 hover:text-slate-800 transition-colors inline-flex group'
                            : 'flex items-center gap-1.5 inline-flex',
                          onClick: header.id !== 'drag' && header.id !== 'actions' ? header.column.getToggleSortingHandler() : undefined,
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
                          header.column.getCanSort() && header.id !== 'drag' && header.id !== 'actions' ? (
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
            <SortableContext
              items={data.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map((row) => (
                <SortableRow 
                  key={row.id} 
                  row={row} 
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                  isDragEnabled={isDragEnabled}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
      </div>
    </div>
  );
}
