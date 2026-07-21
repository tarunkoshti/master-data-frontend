import React from 'react';
import { XCircle } from 'lucide-react';

export default function ViewTextModal({ isOpen, onClose, title, text }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 transition-colors p-1 rounded-md hover:bg-slate-100"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
