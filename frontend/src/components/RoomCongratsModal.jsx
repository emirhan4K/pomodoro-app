import React from 'react';

const RoomCongratsModal = ({ isOpen, onClose, minutes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Arka Plan Karartma */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Kart İçeriği */}
      <div className="relative bg-[#161b22] border border-emerald-500/30 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-500/20 text-center animate-fadeIn scale-110">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔥</span>
        </div>
        
        <h2 className="text-3xl font-black text-white italic tracking-tight mb-2">TEBRİKLER !</h2>
        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
          <span className="text-emerald-400 font-bold">{minutes} dakikalık</span> odaklanma seansını başarıyla tamamladın. XP ve istatistiklerin güncellendi.
        </p>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          DEVAM ET
        </button>
      </div>
    </div>
  );
};

export default RoomCongratsModal;