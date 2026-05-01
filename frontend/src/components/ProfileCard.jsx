import React from 'react';

const ProfileCard = ({ profile, isLoading }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm dark:shadow-xl border border-slate-100 dark:border-slate-800 p-8 transition-colors duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-2xl shadow-md flex items-center justify-center text-white font-bold text-xl uppercase">
          {profile?.username ? profile.username.charAt(0) : '?'}
        </div>
        <div>
          {isLoading ? (
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mb-2"></div>
          ) : (
            <h3 className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">
              {profile?.username || 'Kullanıcı'}
            </h3>
          )}
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Bugün hedeflerine ulaşalım.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-center border border-slate-100 dark:border-slate-700 transition-colors">
          {isLoading ? (
             <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mx-auto mb-1"></div>
          ) : (
            <span className="block text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
              {profile?.stats?.totalPomodoros || 0}
            </span>
          )}
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pomodoro</span>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-center border border-slate-100 dark:border-slate-700 transition-colors">
          {isLoading ? (
             <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mx-auto mb-1"></div>
          ) : (
            <span className="block text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
              {profile?.stats?.totalWorkTime || 0}
            </span>
          )}
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Saat</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;