import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Arka Plan Karartma & Blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={!isDeleting ? onClose : undefined}
      ></div>
      
      {/* Kart İçeriği */}
      <div className="relative bg-[#161b22] border border-rose-500/30 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl shadow-rose-900/20 text-center animate-fadeIn scale-100">
        
        {/* Çöp Kutusu İkonu (Yuvarlak Çerçeve) */}
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
          <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">ODAYI SİL</h2>
        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
          Bu odayı kalıcı olarak silmek istediğine emin misin? İçindeki tüm konuşmalar ve veriler <span className="text-rose-400 font-bold">geri alınamaz şekilde</span> silinecektir.
        </p>

        {/* Butonlar */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all disabled:opacity-50"
          >
            İPTAL
          </button>
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black tracking-wider rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "SİL"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;