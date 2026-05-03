import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { PomodoroService } from '../services/api.services';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ profile, notificationCount, onComplete }) => {
  // Varsayılan süre: 25 dakika
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // BACKEND ENTEGRASYONU: Oturum ID'si ve Profil güncelleme fonksiyonu
  const [sessionId, setSessionId] = useState(null);
  const { fetchProfile } = useAuth();

  // Dairenin çevresi
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  // İlerleme yüzdesi artık dinamik
  const progress = ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * circumference;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);
      
      // SÜRE BİTTİ: Backend'e bildir ve XP kazan!
      if (sessionId) {
        PomodoroService.updateStatus(sessionId, "completed")
          .then(() => {
            setSessionId(null);
            if (fetchProfile) fetchProfile(); // XP'yi ekranda güncelle
            if (onComplete) onComplete();
          })
          .catch(console.error);
      } else {
        if (onComplete) onComplete();
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionId, onComplete, fetchProfile]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationSelect = async (mins) => {
    // Eğer çalışan bir sayaç varsa ve süre değiştiriliyorsa oturumu iptal et
    if (sessionId) {
      try { await PomodoroService.updateStatus(sessionId, "cancelled"); } catch(e){}
      setSessionId(null);
    }
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    setIsActive(false);
  };

  // BAŞLAT / DURAKLAT MANTIĞI
  const toggleTimer = async () => {
    if (!isActive) {
      setIsActive(true);
      if (!sessionId) {
        // İlk kez başlatılıyor
        try {
          const res = await PomodoroService.startSession(selectedMinutes, "Genel");
          setSessionId(res.data.newSession._id || res.data.newSession.id);
        } catch (e) { console.error(e); }
      } else {
        // Duraklatıldıktan sonra devam ediliyor
        try { await PomodoroService.updateStatus(sessionId, "running"); } catch(e){}
      }
    } else {
      // Duraklatılıyor
      setIsActive(false);
      if (sessionId) {
        try { await PomodoroService.updateStatus(sessionId, "paused"); } catch(e){}
      }
    }
  };

  // SIFIRLA MANTIĞI
  const handleReset = async () => {
    if (sessionId) {
      try { await PomodoroService.updateStatus(sessionId, "cancelled"); } catch(e){}
      setSessionId(null);
    }
    setTimeLeft(selectedMinutes * 60);
    setIsActive(false);
  };

  const durations = [25, 30, 45, 60, 90];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <Navbar profile={profile} notificationCount={notificationCount} />

        <div className="flex flex-col items-center justify-center mt-16">
          
          {/* SÜRE SEÇİCİ (MODERN PİLL TASARIMI) */}
          <div className="flex items-center gap-1 sm:gap-2 mb-12 p-1.5 bg-slate-200/50 dark:bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-slate-800/80 shadow-inner">
            {durations.map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationSelect(mins)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 ${
                  selectedMinutes === mins
                    ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {mins} dk
              </button>
            ))}
          </div>

          {/* POMODORO SAYACI */}
          <div className="relative flex items-center justify-center group">
            <svg className="w-[300px] h-[300px] transform -rotate-90 drop-shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              <circle
                cx="150" cy="150" r={radius}
                className="stroke-slate-200 dark:stroke-slate-800/50"
                strokeWidth="8" fill="transparent"
              />
              <circle
                cx="150" cy="150" r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-1000 ease-linear"
                strokeWidth="8" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-md">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Odaklanma Vakti</p>
            </div>
          </div>

          {/* KONTROL BUTONLARI */}
          <div className="flex gap-4 mt-12">
            <button 
              onClick={toggleTimer}
              className={`px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all duration-300 ${
                isActive 
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' 
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-1'
              }`}
            >
              {isActive ? 'DURAKLAT' : 'BAŞLAT'}
            </button>
            <button 
              onClick={handleReset}
              className="px-10 py-4 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-300"
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