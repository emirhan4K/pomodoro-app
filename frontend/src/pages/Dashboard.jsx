import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { usePomodoro } from "../context/PomodoroContext";
import CongratulationsModal from "../components/CongratulationsModal";
import { useSocket } from "../context/SocketContext";

const Dashboard = ({ profile, onComplete, notificationCount }) => {
  const socket = useSocket();
  console.log("Benim Socket durumum:", socket ? "Bağlı 🟢" : "Bekleniyor 🔴");
  const {
    timeLeft,
    isActive,
    selectedMinutes,
    toggleTimer,
    handleReset,
    handleDurationSelect,
    showCongrats,
    setShowCongrats,
  } = usePomodoro();

  const navigate = useNavigate();

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress =
    ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) *
    circumference;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const durations = [1, 30, 45, 60, 90];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f111a] text-slate-800 dark:text-white transition-colors duration-500 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <Navbar profile={profile} notificationCount={notificationCount} />
        <div className="flex flex-col items-center justify-center mt-12 mb-20">
          <div className="flex items-center gap-1 sm:gap-2 mb-10 p-1.5 bg-white/50 dark:bg-[#151925]/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
            {durations.map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationSelect(mins)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 ${
                  selectedMinutes === mins
                    ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                {mins} dk
              </button>
            ))}
          </div>

          {/* Dairesel Sayaç */}
          <div className="relative flex items-center justify-center group">
            <svg className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] transform -rotate-90 drop-shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800/50"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-1000 ease-linear"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-6xl sm:text-7xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-md">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] mt-3">
                Odaklanma Vakti
              </p>
            </div>
          </div>

          {/* Kontrol Butonları */}
          <div className="flex gap-4 mt-12">
            <button
              onClick={toggleTimer}
              className={`px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all duration-300 ${
                isActive
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-1"
              }`}
            >
              {isActive ? "DURAKLAT" : "BAŞLAT"}
            </button>
            <button
              onClick={handleReset}
              className="px-10 py-4 bg-slate-200 dark:bg-[#1a1d2d] text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-300 dark:hover:bg-[#232738] transition-all duration-300 border border-transparent dark:border-slate-800/50"
            >
              SIFIRLA
            </button>
          </div>
        </div>

        {/* TOPLULUK ODALARINA YÖNLENDİRME (Kargaşa yerine temiz bir geçiş) */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800/60 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-3 relative z-10">
              Birlikte Odaklanın
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md relative z-10 text-sm">
              Tek başına çalışmaktan sıkıldın mı? Topluluk odalarına katıl,
              diğerleriyle senkronize Pomodoro yap ve motivasyonunu artır.
            </p>
            <button
              onClick={() => navigate("/rooms")}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 relative z-10 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Odalara Git
            </button>
          </div>
        </div>
      </div>

      {/* POMODORO BİTİŞ MODALI */}
      {showCongrats && (
        <CongratulationsModal
          onClose={() => setShowCongrats(false)}
          duration={selectedMinutes}
        />
      )}
    </div>
  );
};

export default Dashboard;
