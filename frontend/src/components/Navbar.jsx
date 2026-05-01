import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ profile, notificationCount }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // İlk değeri sistemden veya localStorage'dan al
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  return (
    <nav className="bg-white dark:bg-[#1e293b]/60 backdrop-blur-md px-8 py-4 flex justify-between items-center rounded-b-[2rem] border-b border-slate-100 dark:border-slate-800 shadow-lg relative z-[100]">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">P</div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">Odakoo.</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Dark Mode Butonu */}
        <button onClick={toggleDarkMode} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-500/30 shadow-sm">
          {isDarkMode ? '🌞' : '🌙'}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-indigo-500/30 transition-all"
          >
            <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black shadow-md border border-slate-700">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-14 right-0 w-56 bg-white dark:bg-[#1e293b] rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[110] animate-in fade-in duration-200">
              <div className="p-4 border-b border-slate-50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-black dark:text-white uppercase tracking-tighter">@{profile?.username}</div>
              <div className="p-2">
                <button onClick={() => { navigate('/profile?tab=stats'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl flex items-center gap-3 transition-all">👤 Profilim</button>
                <button onClick={() => { navigate('/profile?tab=friends'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl flex items-center gap-3 transition-all">
                  🫂 Arkadaşlarım {notificationCount > 0 && <span className="bg-red-500 text-white text-[8px] px-1.5 rounded-full">{notificationCount}</span>}
                </button>
                <div className="h-px bg-slate-50 dark:bg-slate-800 my-2 mx-2"></div>
                <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }} className="w-full text-left px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl flex items-center gap-3 transition-all">🚪 Çıkış Yap</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;