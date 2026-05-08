import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ notificationCount = 0 }) => {
  const navigate = useNavigate();
  
  // İŞTE BÜTÜN SORUNU ÇÖZEN KELİME: 'user' DEĞİL 'profile' OLACAKTI!
  const { profile, logout } = useAuth(); 
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    setIsDarkMode(isDark);
  };

  const handleLogout = () => {
    logout(); 
    navigate('/'); 
  };

  // Açılır menü için XP Hesaplamaları (Artık 'profile' üzerinden çekiyoruz)
  const userLevel = profile?.level || 1;
  const currentXp = profile?.xp || 0;
  const requiredXp = Math.floor(userLevel * 100 * 1.5);
  const progressPercentage = Math.min((currentXp / requiredXp) * 100, 100);

  return (
    <nav className="bg-white dark:bg-[#1e293b]/60 backdrop-blur-md px-8 py-4 flex justify-between items-center rounded-b-[2rem] border-b border-slate-100 dark:border-slate-800 shadow-lg relative z-[100]">
      {/* Sol Taraf - Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg hover:rotate-12 transition-transform">P</div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">Odaklan.</h1>
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
            {/* Küçük Navbar Avatarı */}
            <div className="w-9 h-9 bg-[#0f172a] rounded-xl flex items-center justify-center text-white font-black shadow-inner border border-slate-600 overflow-hidden">
              {profile?.avatar && profile.avatar !== 'default-avatar.png' ? (
                <img 
                  src={profile.avatar?.startsWith('http') ? profile.avatar : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${profile.avatar}`} 
                  className="w-full h-full object-cover" 
                  alt="Avatar"
                />
              ) : (
                profile?.username?.charAt(0).toUpperCase() || 'E'
              )}
            </div>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1e293b] animate-bounce">
                {notificationCount}
              </span>
            )}
          </button>

          {/* ŞEKİLLİ ŞUKULLU AÇILIR MENÜ (DROPDOWN) */}
          {isDropdownOpen && (
            <div className="absolute top-14 right-0 w-80 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden z-[110] transform transition-all animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
              
              {/* --- YENİ NESİL HEADER: BANNER VE AVATAR --- */}
              <div className="relative h-32 w-full overflow-hidden">
                {/* Arka Plan Banner */}
                {profile?.banner && profile.banner !== 'default-banner.png' ? (
                  <img 
                    src={profile.banner?.startsWith('http') ? profile.banner : `https://pomodoro-app-omxg.onrender.com/public/uploads/banners/${profile.banner}`} 
                    className="w-full h-full object-cover" 
                    alt="Banner"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 opacity-40" />
                )}
                
                {/* Banner üzerine hafif karartma */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Header İçindeki Avatar ve Bilgiler */}
                <div className="absolute bottom-4 left-5 flex items-center gap-3 z-10">
                  <div className="w-14 h-14 rounded-2xl border-4 border-white/10 dark:border-[#0f172a] bg-[#0f172a] overflow-hidden flex items-center justify-center shadow-lg">
                    {profile?.avatar && profile.avatar !== 'default-avatar.png' ? (
                      <img 
                        src={profile.avatar?.startsWith('http') ? profile.avatar : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${profile.avatar}`} 
                        className="w-full h-full object-cover" 
                        alt="Avatar"
                      />
                    ) : (
                      <span className="text-xl font-black text-white">{profile?.username?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-black text-white uppercase tracking-tight truncate w-32 drop-shadow-md">@{profile?.username || 'KULLANICI'}</p>
                    <span className="bg-indigo-500 text-[10px] px-2 py-0.5 rounded-lg font-black text-white uppercase italic shadow-sm">
                      SEVİYE {userLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* XP Barı Kısmı */}
              <div className="p-5 pt-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">İlerleme</span>
                    <span className="text-[10px] font-black text-indigo-500 tracking-tighter">{currentXp} / {requiredXp} XP</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-lg" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Menü Seçenekleri */}
              <div className="p-3 space-y-1">
                <button onClick={() => { navigate('/profile?tab=stats'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group">
                  <span className="text-lg group-hover:scale-110 group-hover:-rotate-12 transition-transform">👤</span> 
                  Profilim
                </button>

                <button onClick={() => { navigate('/statistics'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group">
                  <span className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform">📊</span> 
                  İstatistikler
                </button>
                
                <button onClick={() => { navigate('/profile?tab=friends'); setIsDropdownOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform">🫂</span> 
                    Arkadaşlarım
                  </div>
                  {notificationCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-md">{notificationCount}</span>}
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-2 mx-2"></div>

                <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-all group cursor-not-allowed opacity-80">
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 transition-transform">🏆</span> 
                    Liderlik
                  </div>
                  <span className="text-[8px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase font-black">Yakında</span>
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all group" onClick={() => { navigate('/settings?tab=profile'); setIsDropdownOpen(false); }} >
                  <span className="text-lg group-hover:rotate-45 transition-transform duration-300">⚙️</span> 
                  Ayarlar
                </button>
              </div>

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