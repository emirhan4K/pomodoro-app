import React from 'react';
import Navbar from '../components/Navbar';

const Profile = ({ profile }) => {
  // --- GERÇEK VERİLER ---
  // API'den gelen verileri alıyoruz. Eğer veri henüz gelmediyse 'Kullanıcı' veya '0' gösteriyoruz.
  const username = profile?.username || 'Kullanıcı';
  
  // Backend'den çekilen istatistikler (Sen Pomodoro yaptıkça burası otomatik artar)
  const totalPomodoros = profile?.stats?.totalPomodoros || 0;
  const totalHours = profile?.stats?.totalWorkTime || 0;
  
  // Şimdilik sistemde Level mantığı olmadığı için gerçek pomodoro sayısına göre
  // basit bir Level hesaplıyoruz (Örn: Her 5 Pomodoro = 1 Level).
  // Bunu ileride Backend'e bağlayacağız.
  const calculatedLevel = Math.floor(totalPomodoros / 5) + 1; 

  // Deneyim (XP) Barı İçin Basit Hesaplama (Şimdilik görsel amaçlı, pomodoro sayısına duyarlı)
  const xpCurrent = totalPomodoros % 5; // Mevcut level içindeki pomodoro sayısı
  const xpTarget = 5; // Bir sonraki level için gereken pomodoro
  const xpPercentage = (xpCurrent / xpTarget) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Navbar'a gerçek profil verini yolluyoruz ki sağ üstte senin adın yazsın */}
        <Navbar profile={profile} />

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 mt-8">
          
          {/* --- SOL PANEL: PROFİL KARTI --- */}
          <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl rounded-[3rem] p-10 flex flex-col items-center text-center border border-slate-200 dark:border-slate-800/50 shadow-xl dark:shadow-2xl">
            
            <div className="relative mb-8">
              {/* Profil Resmi Alanı (Gerçek Baş Harfin) */}
              <div className="w-48 h-48 rounded-full border-[8px] border-slate-100 dark:border-slate-700/30 p-2 relative group">
                <div className="w-full h-full rounded-full bg-indigo-600 dark:bg-[#1e293b] flex items-center justify-center shadow-inner overflow-hidden border border-indigo-700 dark:border-slate-700/50 transition-colors">
                   <span className="text-6xl font-black text-white dark:opacity-20 uppercase tracking-tighter">
                    {username.charAt(0)}
                   </span>
                </div>
                
                {/* Dinamik Level Rozeti (Sen pomodoro yaptıkça artar) */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#facc15] text-slate-900 px-5 py-1.5 rounded-full text-[11px] font-black shadow-xl flex items-center gap-1.5 border-[3px] border-white dark:border-[#1e293b]">
                  <span className="text-xs">★</span> LVL {calculatedLevel}
                </div>
              </div>
            </div>

            {/* Gerçek Kullanıcı Adın */}
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-10">
              @{username}
            </h2>

            {/* Takipçi Sayıları (Şu an sistemde olmadığı için sabit duruyor) */}
            <div className="flex items-center gap-12 border-t border-slate-100 dark:border-slate-800/60 pt-10 w-full justify-center">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">0</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Takipçi</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">0</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Takip</p>
              </div>
            </div>
          </div>

          {/* --- SAĞ PANEL: İLERLEME VE İSTATİSTİKLER --- */}
          <div className="space-y-6">
            
            {/* Dinamik İlerleme Kartı */}
            <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800/50 shadow-xl dark:shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tight">Mevcut İlerleme</h3>
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-6 italic">
                Seviye {calculatedLevel + 1}'e geçmek için {xpTarget - xpCurrent} Pomodoro kaldı
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Deneyim</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white tracking-tighter">
                    {xpCurrent} / {xpTarget} Pomodoro
                  </span>
                </div>

                {/* Dinamik İlerleme Çubuğu */}
                <div className="w-full h-5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden p-1 border border-slate-200 dark:border-slate-700/30">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full dark:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-1000"
                    style={{ width: `${xpPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Gerçek İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gerçek Pomodoro Sayısı */}
              <StatCard label="Pomodoro" value={totalPomodoros} icon="🏆" color="text-yellow-500" bg="bg-yellow-100 dark:bg-yellow-500/5" />
              
              <StatCard label="Mevcut Seri" value="0" icon="🔥" color="text-orange-500" bg="bg-orange-100 dark:bg-orange-500/5" />
              <StatCard label="En İyi Seri" value="0" icon="📈" color="text-indigo-500 dark:text-indigo-400" bg="bg-indigo-100 dark:bg-indigo-500/5" />
              
              {/* Gerçek Toplam Saat */}
              <StatCard label="Toplam Saat" value={totalHours} icon="🕒" color="text-blue-500 dark:text-blue-400" bg="bg-blue-100 dark:bg-blue-500/5" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800/50 flex flex-col items-center justify-center transition-all hover:border-slate-300 dark:hover:border-slate-700 group shadow-xl">
    <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-5xl font-black text-slate-800 dark:text-white mb-3 tracking-tighter">{value}</p>
    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${color}`}>{label}</p>
  </div>
);

export default Profile;