import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 relative z-10 animate-scale-in overflow-hidden border border-slate-200">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-rose-100">
              <AlertTriangle className="h-6 w-6 text-rose-600" aria-hidden="true" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 leading-none">
                  {title}
                </h3>
                <button 
                  onClick={!isLoading ? onClose : undefined}
                  className="text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 p-1 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            isLoading={isLoading}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
