import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ profile, notificationCount }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    setIsDarkMode(isDark);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const userLevel = Math.floor((profile?.stats?.totalPomodoros || 0) / 5) + 1;

  return (
    <nav className="bg-white dark:bg-[#1e293b]/60 backdrop-blur-md px-8 py-4 flex justify-between items-center rounded-b-[2rem] border-b border-slate-100 dark:border-slate-800 shadow-lg relative z-[100]">
      {/* Sol Taraf - Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg hover:rotate-12 transition-transform">P</div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">Odakoo.</h1>
      </div>
      
      {/* Sağ Taraf - Aksiyonlar */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Butonu */}
        <button onClick={toggleDarkMode} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-amber-400 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700 shadow-sm">
          {isDarkMode ? '🌞' : '🌙'}
        </button>

        {/* Profil Açılır Menü Tetikleyici */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border transition-all ${
              isDropdownOpen ? 'border-indigo-500/50 shadow-md' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-black shadow-inner border border-slate-600">
              {profile?.username?.charAt(0).toUpperCase() || 'E'}
            </div>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1e293b] animate-bounce">
                {notificationCount}
              </span>
            )}
          </button>

          {/* ŞEKİLLİ ŞUKULLU AÇILIR MENÜ (DROPDOWN) */}
          {isDropdownOpen && (
            <div className="absolute top-14 right-0 w-64 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden z-[110] transform transition-all animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
              
              {/* Kullanıcı Header Kısmı */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-br from-slate-50 to-white dark:from-[#1e293b]/40 dark:to-[#0f172a]/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                    {profile?.username?.charAt(0).toUpperCase() || 'E'}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">@{profile?.username || 'KULLANICI'}</p>
                    <span className="mt-1 w-max bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/30">
                      Seviye {userLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menü Seçenekleri */}
              <div className="p-3 space-y-1">
                <button onClick={() => { navigate('/profile?tab=stats'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group">
                  <span className="text-lg group-hover:scale-110 group-hover:-rotate-12 transition-transform">👤</span> 
                  Profilim
                </button>
                
                <button onClick={() => { navigate('/profile?tab=friends'); setIsDropdownOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform">🫂</span> 
                    Arkadaşlarım
                  </div>
                  {notificationCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-md">{notificationCount}</span>}
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-2 mx-2"></div>

                {/* Yeni Eklentiler (Backend'i sonra yazılacak) */}
                <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-all group cursor-not-allowed opacity-80">
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 transition-transform">🏆</span> 
                    Liderlik
                  </div>
                  <span className="text-[8px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase font-black">Yakında</span>
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all group">
                  <span className="text-lg group-hover:rotate-45 transition-transform duration-300">⚙️</span> 
                  Ayarlar
                </button>
              </div>

              {/* Çıkış Yap Kısmı */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-xl transition-all group">
                  <span className="text-lg group-hover:translate-x-1 transition-transform">🚪</span> 
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

export default Navbar;