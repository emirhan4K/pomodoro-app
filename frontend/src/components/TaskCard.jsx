import React from 'react';

const TaskCard = ({ task, onComplete, onDelete, onEdit }) => {
  // Zorluk derecelerine göre renk ve XP ayarları
  const difficultyConfig = {
    easy: { color: "text-emerald-400", bg: "bg-emerald-500", label: "KOLAY", xp: 20 },
    medium: { color: "text-amber-400", bg: "bg-amber-500", label: "ORTA", xp: 50 },
    hard: { color: "text-rose-400", bg: "bg-rose-500", label: "ZOR", xp: 100 }
  };

  const config = difficultyConfig[task.difficulty] || difficultyConfig.medium;

  return (
    <div className={`group relative bg-[#161b22] rounded-2xl overflow-hidden border border-gray-800 transition-all duration-300 shadow-xl flex flex-col h-full ${task.isCompleted ? 'opacity-50 grayscale' : 'hover:border-indigo-500/50 hover:-translate-y-1'}`}>
      
      {/* Üst Renk Şeridi (Oda Banner'ı niyetine) */}
      <div className={`h-2 w-full ${config.bg} opacity-80`}></div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[9px] font-black px-2 py-1 rounded-lg bg-gray-900 border border-gray-800 uppercase tracking-widest ${config.color}`}>
             {config.label} • {config.xp} XP
          </span>
          {task.isCompleted && (
             <span className="text-[9px] font-black text-emerald-400">✓ TAMAMLANDI</span>
          )}
        </div>

        <h3 className="text-md font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors uppercase tracking-tight italic">
          {task.title}
        </h3>

        <div className="mt-auto pt-6 flex items-center justify-between gap-2">
          {!task.isCompleted ? (
            <>
              {/* Görevi Bitir Butonu */}
              <button 
                onClick={() => onComplete(task._id)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                GÖREVİ BİTİR
              </button>
              
              {/* Düzenle Butonu */}
              <button 
                onClick={() => onEdit(task)} 
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 rounded-xl transition-colors border border-slate-700"
                title="Görevi Düzenle"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </>
          ) : (
            <div className="w-full text-center py-2 text-slate-500 font-bold text-[10px] italic">BU GÖREV ARŞİVLENDİ</div>
          )}
          
          {/* Sil Butonu */}
          <button 
            onClick={() => onDelete(task._id)} 
            className="p-2.5 hover:bg-rose-600/20 text-slate-600 hover:text-rose-500 rounded-xl transition-colors"
            title="Görevi Sil"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;