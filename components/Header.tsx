import React from 'react';
import { LeafIcon, ArrowLeftStartOnRectangleIcon } from './icons/Icons';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onOpenProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenProfile }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src="/Nutria/logo.png" alt="Nutria Logo" className="w-10 h-10 rounded-full shadow-sm" />
            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Nutria <span className="text-brand font-medium">Nutrición IA</span></span>
          </div>

          {user?.isLoggedIn && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              >
                <div className="w-7 h-7 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold text-xs">
                  {user?.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline-block text-sm font-semibold italic">Mi Ficha</span>
              </button>

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                title="Cerrar Sesión"
              >
                <ArrowLeftStartOnRectangleIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
