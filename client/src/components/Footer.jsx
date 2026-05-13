import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <img src="/camtoollogo.png" alt="CamTools" className="h-10 w-auto object-contain" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2026 CamTools. Fast and simple online tools.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
