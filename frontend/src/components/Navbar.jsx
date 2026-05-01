import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ profile }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Tema Kontrolü (Sayfa Açıldığında)
  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  // KUSURSUZ ŞALTER
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      }
      return newMode;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const username = profile?.username || 'Kullanıcı';
  const initial = profile?.username ? profile.username.charAt(0).toUpperCase() : '?';

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50 px-8 py-4 flex justify-between items-center rounded-b-3xl mb-8 border border-slate-100 dark:border-slate-800 relative z-50 transition-colors duration-300">
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
          P
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Odaklan</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          
          {/* GECE/GÜNDÜZ BUTONU */}
          <button onClick={toggleDarkMode} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            {isDarkMode ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          
          <button className="relative hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">1</span>
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

        <div className="flex items-center gap-3 cursor-pointer relative" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-transparent hover:border-indigo-500 transition-all">
              {initial}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{username}</p>
            <p className="text-xs font-semibold text-emerald-500">Lvl 14</p>
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute top-20 right-8 w-64 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden text-slate-700 dark:text-slate-300 animate-fade-in-down z-50">
            <div className="p-5 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1f2937]">
              <div className="w-12 h-12 bg-gradient-to-tr from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-bold text-lg">{initial}</div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">{username}</h3>
                <p className="text-sm text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-medium">Lvl 14</p>
              </div>
            </div>
            <div className="py-2 text-sm font-medium">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 dark:hover:bg-slate-800 text-red-500 transition-colors group mt-2 border-t border-slate-100 dark:border-slate-800">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;