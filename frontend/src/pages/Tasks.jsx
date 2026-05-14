import React from 'react';
import { useNavigate } from 'react-router-dom';

const Tasks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#0b0e14] text-white p-4 md:p-6 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Üst Başlık Bölümü */}
        <div className="mb-12">
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-sm font-black uppercase tracking-tighter"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            DASHBOARD
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight italic uppercase">
            Görev Merkezi 🎯
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Odaklan, görevlerini tamamla, XP kazan ve seviye atla.
          </p>
        </div>

        {/* Çok Yakında Banner'ı */}
        <div className="flex-1 flex flex-col items-center justify-center py-20 md:py-32 bg-[#161b22] border border-gray-800 rounded-3xl shadow-inner text-center px-4 relative overflow-hidden">
          
          {/* Arka Plan Dekoratif Işık */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

          <span className="text-6xl md:text-8xl mb-6 block animate-bounce drop-shadow-2xl">🚧</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight italic uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Çok Yakında
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
            Günlük görevler, pomodoro hedefleri ve yepyeni bir oyunlaştırma sistemi üzerinde çalışıyoruz. Odaklanmaya devam et, sürprizler yolda!
          </p>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-8 px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all border border-slate-700 shadow-lg uppercase text-xs tracking-widest active:scale-95"
          >
            Lobiye Dön
          </button>
        </div>

      </div>
    </div>
  );
};

export default Tasks;