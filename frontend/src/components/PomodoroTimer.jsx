import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PomodoroTimer = ({ onComplete }) => {
  // --- STATE'LER ---
  const [workDuration, setWorkDuration] = useState(25); // Kullanıcının seçtiği ana dakika
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Saniye cinsinden kalan süre
  const [isActive, setIsActive] = useState(false); // Sayaç akıyor mu?
  const [isWorkMode, setIsWorkMode] = useState(true); // Çalışma modunda mı?

  // İstediğin dakika seçenekleri
  const timeOptions = [25, 30, 45, 60, 90];

  // --- GERİ SAYIM MOTORU ---
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

  // --- SÜRE BİTİNCE ---
  const handleTimerComplete = async () => {
    if (isWorkMode) {
      try {
        // Artık dinamik olarak kullanıcının seçtiği süreyi backend'e atıyoruz
        await api.post('/pomodoros', { duration: workDuration }); 
        if (onComplete) onComplete(); 
        alert(`Tebrikler! ${workDuration} dakikalık harika bir odaklanma seansını tamamladın!`);
      } catch (error) {
        console.error("Pomodoro kaydedilirken hata oluştu:", error);
      }
    } else {
      alert("Mola bitti! Yeni bir hedefe doğru yelken açmaya hazır mısın?");
    }
    switchMode(); 
  };

  // --- KONTROL FONKSİYONLARI ---
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const toggleTimer = () => setIsActive(!isActive);

  const handleReset = () => {
    setIsActive(false);
    // Hangi moddaysak onu sıfırla
    setTimeLeft(isWorkMode ? workDuration * 60 : 5 * 60);
  };

  const handleTimeSelect = (time) => {
    setWorkDuration(time);
    // Eğer çalışma modundaysa anında sayacı da güncelle ve durdur
    if (isWorkMode) {
      setIsActive(false);
      setTimeLeft(time * 60);
    }
  };

  const switchMode = () => {
    setIsActive(false);
    if (isWorkMode) {
      setIsWorkMode(false);
      setTimeLeft(5 * 60); // 5 dakika mola
    } else {
      setIsWorkMode(true);
      setTimeLeft(workDuration * 60); // Kaldığı süreden çalışmaya dön
    }
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
      {/* Üst Dekoratif Çizgi */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      {/* --- DAKİKA SEÇİCİ (ZAMAN KAPSÜLLERİ) --- */}
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {timeOptions.map((time) => (
          <button
            key={time}
            onClick={() => handleTimeSelect(time)}
            disabled={isActive} // Sayaç akarken dakika değiştirilmesin
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
              workDuration === time 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {time} dk
          </button>
        ))}
      </div>

      {/* --- SAYAÇ DAİRESİ --- */}
      <div className={`w-72 h-72 rounded-full border-[12px] flex items-center justify-center mb-12 shadow-inner transition-colors duration-500 ${isWorkMode ? 'border-indigo-50' : 'border-emerald-50'}`}>
        <span className={`text-7xl font-black tracking-tighter ${isWorkMode ? 'text-slate-800' : 'text-emerald-600'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* --- ALT KONTROL BUTONLARI --- */}
      <div className="flex items-center gap-4">
        
        {/* Mod Değiştirici Buton */}
        <button 
          onClick={switchMode}
          className="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-bold hover:bg-slate-200 transition text-md"
        >
          {isWorkMode ? '☕ Mola Ver' : '💻 Çalışmaya Dön'}
        </button>
        
        {/* Ana Oynat/Duraklat Butonu */}
        <button 
          onClick={toggleTimer}
          className={`text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl text-lg flex items-center gap-2 ${
            isActive 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
              : isWorkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
          }`}
        >
          {isActive ? '⏸ Duraklat' : '▶ Başla'}
        </button>

        {/* Sıfırlama (Reset) Butonu */}
        <button 
          onClick={handleReset}
          title="Sayacı Sıfırla"
          className="bg-slate-100 text-slate-500 p-4 rounded-2xl font-bold hover:bg-slate-200 hover:text-slate-700 transition shadow-sm group"
        >
          {/* Şık Dönüşüm (Refresh) İkonu */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 group-hover:-rotate-180 transition-transform duration-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

      </div>
    </div>
  );
};

export default PomodoroTimer;