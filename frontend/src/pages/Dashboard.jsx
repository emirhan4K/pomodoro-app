import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const Dashboard = ({ profile, notificationCount }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Dairenin çevresi: 2 * Math.PI * radius (r=120 ise ~754)
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * circumference;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <Navbar profile={profile} notificationCount={notificationCount} />

        <div className="flex flex-col items-center justify-center mt-20">
          <div className="relative flex items-center justify-center group">
            {/* DIŞ HALKA (Progress Ring) */}
            <svg className="w-[300px] h-[300px] transform -rotate-90 drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <circle
                cx="150" cy="150" r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="12" fill="transparent"
              />
              <circle
                cx="150" cy="150" r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-1000 ease-linear"
                strokeWidth="12" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
              />
            </svg>

            {/* İÇ ZAMANLAYICI */}
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Odaklanma Vakti</p>
            </div>
          </div>

          {/* Kontrol Butonları */}
          <div className="flex gap-4 mt-12">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all ${
                isActive ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30'
              }`}
            >
              {isActive ? 'DURAKLAT' : 'BAŞLAT'}
            </button>
            <button 
              onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }}
              className="px-10 py-4 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm tracking-widest"
            >
              SIFIRLA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;