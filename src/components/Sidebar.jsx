import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Database, ShieldCheck, X, ChevronDown, ChevronRight, Video, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MASTER_DATA_CATEGORIES } from '../constants/masterData';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState([MASTER_DATA_CATEGORIES[0].name]);


  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 shadow-xl md:shadow-none
        transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
        <div className="flex items-center">
          <ShieldCheck className="w-6 h-6 text-primary-500 mr-2" />
          <span className="font-bold text-slate-800 tracking-wide">MDM</span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        <button
          onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-medium transition-colors ${isMasterDataOpen ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <div className="flex items-center">
            <Database className="w-5 h-5 mr-3" />
            Master Data
          </div>
          {isMasterDataOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {isMasterDataOpen && (
          <div className="mt-1 ml-4 pl-2 border-l-2 border-slate-100 space-y-1">
            {MASTER_DATA_CATEGORIES.map(category => {
              const isExpanded = expandedCategories.includes(category.name);
              return (
                <div key={category.name} className="mb-1">
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedCategories(expandedCategories.filter(c => c !== category.name));
                      } else {
                        setExpandedCategories([...expandedCategories, category.name]);
                      }
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span>{category.name}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-1 ml-2 pl-2 border-l-2 border-slate-50 space-y-1">
                      {category.types.map(type => {
                        // The URL path will be just /type.value
                        const path = `/${type.value}`;
                        const isActive = location.pathname === path || (location.pathname === '/' && type.value === 'genders');

                        return (
                          <NavLink
                            key={type.value}
                            to={path}
                            onClick={() => {
                              if (window.innerWidth < 768) onClose();
                            }}
                            className={`block p-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                          >
                            {type.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <NavLink
          to="/user-intros"
          onClick={() => {
            if (window.innerWidth < 768) onClose();
          }}
          className={({ isActive }) => `flex items-center w-full px-3 py-2.5 rounded-lg font-medium transition-colors mt-1 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <Video className="w-5 h-5 mr-3" />
          User Intros
        </NavLink>

        <NavLink
          to="/success-stories"
          onClick={() => {
            if (window.innerWidth < 768) onClose();
          }}
          className={({ isActive }) => `flex items-center w-full px-3 py-2.5 rounded-lg font-medium transition-colors mt-1 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <Award className="w-5 h-5 mr-3" />
          Success Stories
        </NavLink>
      </div>
    </aside>
  );
}

