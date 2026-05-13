import React from 'react';
import { Sun, Moon, Hammer, Languages } from 'lucide-react';

const Navbar = ({ darkMode, toggleDarkMode, language, toggleLanguage }) => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <img 
              src="/camtoollogo.png" 
              alt="CamTools" 
              className="h-28 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://via.placeholder.com/120x40?text=CamTools"
              }}
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Switch language"
            >
              <Languages className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === 'en' ? 'English' : 'ភាសាខ្មែរ'}
              </span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;