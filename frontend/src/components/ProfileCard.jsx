import React from "react";
import { useAuth } from "../context/AuthContext";

const ProfileCard = () => {
  const { user, loading: isLoading } = useAuth();
  const currentLevel = user?.level || 1;
  const currentXp = user?.xp || 0;
  const totalPomodoros = user?.stats?.totalPomodoros || 0;
  const totalWorkTime = user?.stats?.totalWorkTime || 0;
  const currentStreak = user?.streak?.currentStreak || 0;
  const bestStreak = user?.streak?.bestStreak || 0;

  // Hesaplama kısmı
  const requiredXp = Math.floor(currentLevel * 100 * 1.5);
  const progressPercentage = Math.min((currentXp / requiredXp) * 100, 100);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm dark:shadow-xl border border-slate-100 dark:border-slate-800 p-8 transition-colors duration-300">
      {/* Profil Başlığı ve İsim */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-2xl shadow-md flex items-center justify-center text-white font-bold text-xl uppercase">
          {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mb-2"></div>
          ) : (
            <h3 className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">
              {user?.username || "Kullanıcı"}
            </h3>
          )}
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Bugün hedeflerine ulaşalım.
          </p>
        </div>
      </div>

      {/* YENİ EKLENEN: Oyunlaştırma (Gamification) XP Barı */}
      <div className="mb-8">
        {isLoading ? (
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl"></div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-2 px-1">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Seviye {currentLevel}
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {currentXp}{" "}
                <span className="text-slate-400 dark:text-slate-500">
                  / {requiredXp} XP
                </span>
              </span>
            </div>
            {/* Arka plan çubuğu */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700/50">
              {/* Dolan çubuk (Animasyonlu Gradient) */}
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-1000 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundSize: "200% 100%",
                  animation: "gradientMove 3s ease infinite", // Tailwind config'e gerek yok, CSS yeterli
                }}
              ></div>
            </div>
          </>
        )}
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-center border border-slate-100 dark:border-slate-700 transition-colors hover:shadow-md">
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mx-auto mb-1"></div>
          ) : (
            <span className="block text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
              {totalPomodoros}
            </span>
          )}
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Pomodoro
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-center border border-slate-100 dark:border-slate-700 transition-colors hover:shadow-md">
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mx-auto mb-1"></div>
          ) : (
            <span className="block text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
              {totalWorkTime}
            </span>
          )}
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Saat
          </span>
        </div>
      </div>

      {/* Seri (Streak) Kartları */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-5 text-center border border-orange-200 dark:border-orange-800/50 transition-colors hover:shadow-md">
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mx-auto mb-1"></div>
          ) : (
            <span className="block text-3xl font-black text-orange-600 dark:text-orange-400 mb-1">
              {currentStreak}
            </span>
          )}
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
            🔥 Mevcut Seri
          </span>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 text-center border border-amber-200 dark:border-amber-800/50 transition-colors hover:shadow-md">
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mx-auto mb-1"></div>
          ) : (
            <span className="block text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">
              {bestStreak}
            </span>
          )}
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            ⭐ En İyi Seri
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
