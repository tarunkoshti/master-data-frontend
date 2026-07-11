import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { GripVertical, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import dayjs from 'dayjs';

// Sortable Row Component
const SortableRow = ({ row, onEdit, onToggleStatus, onDelete }) => {
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
                className="hover:text-slate-700 cursor-grab active:cursor-grabbing p-1"
              >
                <GripVertical className="w-5 h-5" />
              </button>
            </td>
          );
        }
        
        if (cell.column.id === 'actions') {
          return (
             <td key={cell.id} className="p-3 w-32">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                      onClick={() => onEdit(row.original)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                   </button>
                   <button 
                      onClick={() => onToggleStatus(row.original)}
                      className={`p-1.5 rounded-md transition-colors ${
                        row.original.is_active 
                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={row.original.is_active ? 'Disable' : 'Enable'}
                    >
                      {row.original.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                   </button>
                   <button 
                      onClick={() => onDelete(row.original)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(
    () => [
      {
        id: 'drag',
        header: '',
        cell: () => null, 
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => <span className="font-medium text-slate-800">{info.getValue()}</span>,
      },
      {
        accessorKey: 'parent_id',
        header: 'Parent',
        cell: (info) => {
          const parent = info.getValue();
          return parent ? <span className="px-2 py-1 bg-slate-100 rounded text-xs">{parent.name || parent}</span> : <span className="text-slate-300">-</span>;
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: (info) => {
          const isActive = info.getValue();
          return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: (info) => <span className="text-xs text-slate-400">{dayjs(info.getValue()).format('MMM D, YYYY')}</span>,
      },
      {
        id: 'actions',
        header: '',
        cell: () => null,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // Must match the sortable ID
  });

  const handleDragEnd = (event) => {
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
    <div className="w-full overflow-x-auto">
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
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
