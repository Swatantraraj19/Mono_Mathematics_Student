import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  User,
  Video,
  Radio,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';

import { navigationItems } from '../../constants/navigation';

export const Sidebar = ({ className = '', onItemClick }) => {
  const { userProfile, logout } = useAuth();

  return (
    <aside className={cn('w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none shrink-0 overflow-hidden', className)}>
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center gap-3 shrink-0">
        <img
          src={logo}
          alt="Mono Mathematics"
          className="w-8 h-8 object-contain shrink-0 drop-shadow-xs"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 truncate leading-tight tracking-tight">
            Mono Mathematics
          </span>
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-primary-600" />
            Student Platform
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto min-h-0">
        <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Student Menu
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/70">
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0">
              {userProfile?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-bold text-slate-900 truncate">
                {userProfile?.name || 'Student'}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[100px]" title={userProfile?.email}>
                {userProfile?.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-status-error hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors shrink-0 cursor-pointer shadow-xs active:bg-red-100"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
