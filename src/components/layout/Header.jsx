import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { navigationItems } from '../../constants/navigation';
import logo from '../../assets/logo.png';

export const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const { userProfile } = useAuth();

  const currentItem = navigationItems.find((item) =>
    item.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.path)
  );

  const pageTitle = currentItem?.name || 'Mono Mathematics';

  return (
    <header className="h-16 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between px-4 sm:px-6 select-none shadow-xs">
      {/* Left: Mobile Hamburger Button + Logo + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <img src={logo} alt="Mono Mathematics" className="w-7 h-7 object-contain" />
        </div>

        {/* Page Title */}
        <div className="min-w-0 flex flex-col">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">
            {pageTitle}
          </h1>
          <span className="hidden sm:inline-flex text-[10px] text-slate-400 font-medium truncate">
            Mono Mathematics Classes — Student Platform
          </span>
        </div>
      </div>

      {/* Right: Enrolled Class Badge & Student Info */}
      <div className="flex items-center gap-2.5 shrink-0">
        {userProfile?.className && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-primary-700 border border-indigo-100">
            {userProfile.className} {userProfile.streamName ? `• ${userProfile.streamName}` : ''}
          </span>
        )}

        <div className="w-8 h-8 rounded-xl bg-primary-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
          {userProfile?.name?.charAt(0).toUpperCase() || 'S'}
        </div>
      </div>
    </header>
  );
};
