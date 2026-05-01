import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ profile }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) { document.documentElement.classList.add('dark'); localStorage.theme = 'dark'; }
      else { document.documentElement.classList.remove('dark'); localStorage.theme = 'light'; }
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const username = profile?.username || 'Kullanıcı';
  const initial = profile?.username ? profile.username.charAt(0).toUpperCase() : '?';

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50 px-8 py-4 flex justify-between items-center rounded-b-3xl mb-8 border border-slate-100 dark:border-slate-800 relative z-50 transition-all duration-300">
      
      {/* Sol Logo */}
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">P</div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Odaklan</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            {isDarkMode ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

        {/* Profil Tetikleyici */}
        <div className="flex items-center gap-3 cursor-pointer relative" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="relative">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-transparent hover:border-indigo-500 transition-all">{initial}</div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{username}</p>
            <p className="text-xs font-semibold text-emerald-500">Lvl 14</p>
          </div>

          {/* --- DROPDOWN MENÜ --- */}
          {isDropdownOpen && (
            <div className="absolute top-14 right-0 w-64 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[100] animate-fade-in-down">
              <div className="p-5 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1f2937]">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold">{initial}</div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">{username}</h3>
                  <p className="text-xs text-emerald-500 font-medium">Lvl 14</p>
                </div>
              </div>
              <div className="py-2">
                {/* BURAYA DİKKAT: onClick eklendi */}
                <MenuItem 
                  icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  text="Profilim" 
                  onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} 
                />
                <MenuItem icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" text="Genel Ayarlar" />
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// MenuItem bileşeni onClick desteğiyle güncellendi
const MenuItem = ({ icon, text, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-all text-sm font-medium">
    <svg className="w-5 h-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
    {text}
  </button>
);

export default Navbar;