import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Converter from './components/Converter';
import Footer from './components/Footer';
import { FileText, Table, Presentation, Image as ImageIcon, FileType, FileSpreadsheet, Combine, QrCode, Eraser } from 'lucide-react';

const translations = {
  en: {
    heroTitle: 'Fast and simple',
    heroTitleHighlight: 'online tools',
    heroDesc: 'Free, easy-to-use tools for your daily tasks. No registration required, secure and fast.',
    secureTitle: 'Secure Processing',
    secureDesc: 'Your files are processed locally and deleted immediately. Your privacy is our priority.',
    speedTitle: 'High Speed',
    speedDesc: 'Our optimized servers ensure your conversions are completed in a blink of an eye.',
    qualityTitle: 'Professional Quality',
    qualityDesc: 'We use the most reliable engines to ensure your documents look exactly as they should.',
    tools: {
      'word-to-pdf': 'Word to PDF',
      'excel-to-pdf': 'Excel to PDF',
      'ppt-to-pdf': 'PPT to PDF',
      'compress-image': 'Compress Image',
      'pdf-to-word': 'PDF to Word',
      'pdf-to-excel': 'PDF to Excel',
      'merge-pdf': 'Merge PDF',
      'qr-generator': 'QR Generator',
      'bg-remover': 'BG Remover'
    }
  },
  km: {
    heroTitle: 'ឧបករណ៍អនឡាញ',
    heroTitleHighlight: 'រហ័ស និងងាយស្រួល',
    heroDesc: 'ឧបករណ៍ឥតគិតថ្លៃ និងងាយស្រួលប្រើសម្រាប់កិច្ចការប្រចាំថ្ងៃរបស់អ្នក។ មិនត្រូវការចុះឈ្មោះ សុវត្ថិភាព និងរហ័ស។',
    secureTitle: 'ដំណើរការប្រកបដោយសុវត្ថិភាព',
    secureDesc: 'ឯកសាររបស់អ្នកត្រូវបានដំណើរការ និងលុបចេញភ្លាមៗ។ ភាពឯកជនរបស់អ្នកគឺជាអាទិភាពរបស់យើង។',
    speedTitle: 'ល្បឿនលឿន',
    speedDesc: 'ម៉ាស៊ីនបម្រើដែលបានបង្កើនប្រសិទ្ធភាពរបស់យើងធានាថាការបំប្លែងរបស់អ្នកត្រូវបានបញ្ចប់ក្នុងមួយប៉ប្រិចភ្នែក។',
    qualityTitle: 'គុណភាពកម្រិតអាជីព',
    qualityDesc: 'យើងប្រើប្រាស់ម៉ាស៊ីនដែលគួរឱ្យទុកចិត្តបំផុតដើម្បីធានាថាឯកសាររបស់អ្នកមើលទៅដូចដែលវាគួរតែមាន។',
    tools: {
      'word-to-pdf': 'Word ទៅ PDF',
      'excel-to-pdf': 'Excel ទៅ PDF',
      'ppt-to-pdf': 'PPT ទៅ PDF',
      'compress-image': 'បង្រួមរូបភាព',
      'pdf-to-word': 'PDF ទៅ Word',
      'pdf-to-excel': 'PDF ទៅ Excel',
      'merge-pdf': 'បញ្ចូល PDF',
      'qr-generator': 'បង្កើត QR',
      'bg-remover': 'លុបផ្ទៃខាងក្រោយ'
    }
  }
};

function App() {
  const [activeTool, setActiveTool] = useState('word-to-pdf');
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const t = translations[language];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleLanguage = () => setLanguage(language === 'en' ? 'km' : 'en');

  const tools = [
    { id: 'word-to-pdf', name: t.tools['word-to-pdf'], icon: <FileText className="w-5 h-5" /> },
    { id: 'excel-to-pdf', name: t.tools['excel-to-pdf'], icon: <Table className="w-5 h-5" /> },
    { id: 'ppt-to-pdf', name: t.tools['ppt-to-pdf'], icon: <Presentation className="w-5 h-5" /> },
    { id: 'compress-image', name: t.tools['compress-image'], icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'pdf-to-word', name: t.tools['pdf-to-word'], icon: <FileType className="w-5 h-5" />, soon: true },
    { id: 'pdf-to-excel', name: t.tools['pdf-to-excel'], icon: <FileSpreadsheet className="w-5 h-5" />, soon: true },
    { id: 'merge-pdf', name: t.tools['merge-pdf'], icon: <Combine className="w-5 h-5" /> },
    { id: 'qr-generator', name: t.tools['qr-generator'], icon: <QrCode className="w-5 h-5" /> },
    { id: 'bg-remover', name: t.tools['bg-remover'], icon: <Eraser className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${language === 'km' ? 'font-khmer' : ''}`}>
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        language={language} 
        toggleLanguage={toggleLanguage} 
      />
      
      <main className="flex-grow flex flex-col items-center">
        <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {language === 'en' ? (
                <>{t.heroTitle} <span className="text-primary-600">{t.heroTitleHighlight}</span></>
              ) : (
                <>{t.heroTitle} <span className="text-primary-600">{t.heroTitleHighlight}</span></>
              )}
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              {t.heroDesc}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 relative ${
                    activeTool === tool.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tool.icon}
                  {tool.name}
                  {tool.soon && (
                    <span className="absolute -top-2 -right-1 bg-amber-500 text-[10px] text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {language === 'en' ? 'Soon' : 'ឆាប់ៗ'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full">
          <Converter activeTool={activeTool} language={language} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="text-xl font-bold dark:text-white">{t.secureTitle}</h3>
            <p className="text-slate-500 dark:text-slate-400">{t.secureDesc}</p>
          </div>
          <div className="space-y-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-xl font-bold dark:text-white">{t.speedTitle}</h3>
            <p className="text-slate-500 dark:text-slate-400">{t.speedDesc}</p>
          </div>
          <div className="space-y-4">
            <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold dark:text-white">{t.qualityTitle}</h3>
            <p className="text-slate-500 dark:text-slate-400">{t.qualityDesc}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
