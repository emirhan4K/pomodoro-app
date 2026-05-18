import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // PORTAL ÖZELLİĞİNİ EKLEDİK
import Confetti from 'react-confetti';
import { useAuth } from '../context/AuthContext';

const CongratulationsModal = ({ onClose, duration }) => {
  const { profile } = useAuth() || {};
  const displayName = profile?.username || profile?.name || 'Şampiyon';
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const detectSize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', detectSize);
    return () => window.removeEventListener('resize', detectSize);
  }, []);

  // Modalı document.body içine ışınlıyoruz!
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
      
      {/* Konfeti Animasyonu */}
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={600}
        gravity={0.15}
      />

      {/* Tebrik Kartı */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl text-center z-10 max-w-sm mx-4 transform animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-700">
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
          Tebrikler {displayName}!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Harika bir iş çıkardın. Odaklanma hedefini başarıyla tamamladın ve istatistiklerine yeni bir zafer daha ekledin.
        </p>
        
        <button 
          onClick={onClose} 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black py-3 px-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          TAMAM
        </button>
      </div>
    </div>,
    document.body 
  );
};

export default CongratulationsModal;