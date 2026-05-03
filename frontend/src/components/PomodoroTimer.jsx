import React, { useState, useEffect } from "react";
import { PomodoroService } from "../services/api.services";
import { useAuth } from "../context/AuthContext";
import CongratulationsModal from '../components/CongratulationsModal';

const PomodoroTimer = ({ onComplete }) => {
  const [workDuration, setWorkDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const { fetchProfile } = useAuth();

  // Test için 1 dakika
  const timeOptions = [1, 25, 30, 45, 60, 90]; 

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // SÜRE BİTİNCE ÇALIŞAN TERTEMİZ FONKSİYON
  const handleTimerComplete = async () => {
    // BURASI ÇOK ÖNEMLİ: Kodun buraya ulaştığını kesin kanıtlamak için test uyarısı!
    alert("TEST: Süre 00:00 oldu ve sistem bunu algıladı!"); 

    setIsActive(false);

    if (isWorkMode) {
      // 1. Modalı Aç
      setShowCongrats(true);

      // 2. Closure hatasından kaçmak için ID'yi güvene al ve hemen state'i temizle
      const currentId = sessionId;
      setSessionId(null);

      // 3. Backend'e "Tamamlandı" gönder
      if (currentId) {
        try {
          await PomodoroService.updateStatus(currentId, "completed");
        } catch (error) {
          console.error("Backend Tamamlama Hatası:", error);
        }
      }

      // 4. İstatistikleri ve XP'yi güncelle (Await kullanmıyoruz ki ekranı dondurmasın)
      if (typeof fetchProfile === 'function') {
         fetchProfile();
      }

      if (typeof onComplete === 'function') {
         onComplete();
      }

      // 5. Molaya Güvenli Geçiş (switchMode kullanmıyoruz, manuel yapıyoruz)
      setIsWorkMode(false);
      setTimeLeft(5 * 60);

    } else {
      alert("Mola bitti! Yeni bir seansa hazır mısın?");
      setIsWorkMode(true);
      setTimeLeft(workDuration * 60);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const toggleTimer = async () => {
    if (!isActive) {
      setIsActive(true);
      if (isWorkMode) {
        if (!sessionId) {
          try {
            const res = await PomodoroService.startSession(workDuration, "Genel");
            const newId = res?.data?.newSession?._id || res?.data?.newSession?.id || res?.newSession?._id || res?.id;
            setSessionId(newId);
          } catch (e) {
            console.error("BAŞLATIRKEN HATA:", e);
          }
        } else {
          try {
            await PomodoroService.updateStatus(sessionId, "running");
          } catch (e) {}
        }
      }
    } else {
      setIsActive(false);
      if (isWorkMode && sessionId) {
        try {
          await PomodoroService.updateStatus(sessionId, "paused");
        } catch (e) {}
      }
    }
  };

  const switchMode = async () => {
    setIsActive(false);
    const currentId = sessionId;
    setSessionId(null);

    if (isWorkMode && currentId) {
      try {
        await PomodoroService.updateStatus(currentId, "cancelled");
      } catch (e) {}
    }

    if (isWorkMode) {
      setIsWorkMode(false);
      setTimeLeft(5 * 60);
    } else {
      setIsWorkMode(true);
      setTimeLeft(workDuration * 60);
    }
  };

  const handleReset = async () => {
    setIsActive(false);
    setTimeLeft(isWorkMode ? workDuration * 60 : 5 * 60);
    const currentId = sessionId;
    setSessionId(null);

    if (isWorkMode && currentId) {
      try {
        await PomodoroService.updateStatus(currentId, "cancelled");
      } catch (e) {}
    }
  };

  const handleTimeSelect = async (time) => {
    const currentId = sessionId;
    setSessionId(null);

    if (isWorkMode && currentId) {
      try {
        await PomodoroService.updateStatus(currentId, "cancelled");
      } catch (e) {}
    }
    
    setWorkDuration(time);
    if (isWorkMode) {
      setIsActive(false);
      setTimeLeft(time * 60);
    }
  };

  return (
    <>
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm dark:shadow-2xl border border-slate-100 dark:border-slate-800 p-10 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="mb-10 flex flex-wrap justify-center gap-3 relative z-10">
          {timeOptions.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              disabled={isActive}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
                workDuration === time
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 scale-105"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              } ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {time} dk
            </button>
          ))}
        </div>

        <div
          className={`w-72 h-72 rounded-full border-[12px] flex items-center justify-center mb-12 shadow-inner transition-colors duration-500 relative z-10 ${
            isWorkMode
              ? "border-indigo-50 dark:border-indigo-900/20 bg-white dark:bg-slate-900"
              : "border-emerald-50 dark:border-emerald-900/20 bg-white dark:bg-slate-900"
          }`}
        >
          <span
            className={`text-7xl font-black tracking-tighter ${isWorkMode ? "text-slate-800 dark:text-white" : "text-emerald-600 dark:text-emerald-400"}`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={switchMode}
            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition text-md"
          >
            {isWorkMode ? "☕ Mola Ver" : "💻 Çalışmaya Dön"}
          </button>

          <button
            onClick={toggleTimer}
            className={`text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl text-lg flex items-center gap-2 ${
              isActive
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-none"
                : isWorkMode
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
                  : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none"
            }`}
          >
            {isActive ? "⏸ Duraklat" : "▶ Başla"}
          </button>

          <button
            onClick={handleReset}
            className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition shadow-sm group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 group-hover:-rotate-180 transition-transform duration-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {showCongrats && (
        <CongratulationsModal 
          onClose={() => setShowCongrats(false)} 
          duration={workDuration} 
        />
      )}
    </>
  );
};

export default PomodoroTimer;