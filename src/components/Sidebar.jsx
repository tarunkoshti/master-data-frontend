import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Database, ShieldCheck, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Master Data', path: '/dashboard/master-data', icon: Database },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive
                ? 'bg-primary-50 text-primary-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg font-medium transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}
