
import React from 'react';
import { LeafIcon } from './icons/Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <LeafIcon className="w-8 h-8 text-brand" />
            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Nourish Snap</span>
          </div>
          {/* Future navigation items can go here */}
        </div>
      </div>
    </header>
  );
};

export default Header;
