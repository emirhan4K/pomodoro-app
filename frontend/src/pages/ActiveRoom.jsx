import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // API dosyanın yolunu kendi projene göre kontrol et

const ActiveRoom = () => {
  const { id } = useParams(); // URL'deki /room/123 kısmından ID'yi alır
  const navigate = useNavigate();
  
  const [message, setMessage] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. BACKEND'DEN GERÇEK ODA VERİSİNİ ÇEKME
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await api.get(`/rooms/${id}`);
        // Backend'in dönüş formatına göre (genelde response.data veya response.data.room olur)
        setRoomData(response.data?.room || response.data);
      } catch (error) {
        console.error("Oda verisi alınamadı:", error);
        alert("Oda bulunamadı veya sunucu hatası!");
        navigate('/rooms'); // Hata olursa lobiye geri postala
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchRoomDetails();
  }, [id, navigate]);

  // Veri gelene kadar siyah, şık bir yükleniyor ekranı
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0b0e14] text-indigo-500">
        <div className="text-xl font-bold animate-pulse">Odaya Bağlanılıyor...</div>
      </div>
    );
  }

  // Veri yoksa boş dön
  if (!roomData) return null;

  const membersList = roomData.members || [];
  const activeCount = membersList.length;
  const categoryName = roomData.category || "ÇALIŞMA ALANI"; 

  return (
    <div className="h-screen flex flex-col bg-[#0b0e14] text-white overflow-hidden font-sans">
      
      {/* --- ÜST HEADER --- */}
      <header className="relative h-20 shrink-0 flex items-center px-6 border-b border-slate-800/60 z-10 bg-[#0f121a]">
        <div className="relative z-10 flex flex-1 justify-between items-center">
          <div className="flex items-center gap-4">
            {/* ÇALIŞAN GERİ TUŞU */}
            <button 
              onClick={() => navigate('/rooms')}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 group"
            >
              <svg className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                {roomData.roomName} {/* Backend'deki isim alanı */}
                <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                  {categoryName}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Şu an <span className="text-emerald-400 font-bold">{activeCount} kişi</span> aktif olarak odaklanıyor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ÇALIŞAN ODADAN AYRIL TUŞU */}
            <button 
              onClick={() => navigate('/rooms')}
              className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-sm font-bold transition-all hover:scale-105"
            >
              Odadan Ayrıl
            </button>
          </div>
        </div>
      </header>

      {/* --- ANA İÇERİK --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SOL PANEL: ODADAKİLER & CHAT */}
        <div className="w-80 border-r border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0">
          
          {/* Üyeler Listesi */}
          <div className="p-5 border-b border-slate-800/60 shrink-0">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              ODADAKİLER ({activeCount})
            </h3>
            <div className="space-y-4">
              {/* Eğer Backend user objesini populate() ettiyse name/username alanını basarız, etmediyse ID basarız */}
              {membersList.map((member, index) => (
                <div key={member._id || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shadow-sm">
                      {/* Üyenin adının ilk harfi veya E */}
                      {(member.username || member.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-200">
                      {member.username || member.name || "Kullanıcı"} 
                      {/* Oda kurucusuysa taç göster */}
                      {member._id === roomData.owner && ' 👑'}
                    </span>
                  </div>
                  {/* Aktiflik Noktası */}
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
              ))}
              
              {/* Sadece görünüm için kendimizi ekleyelim (Eğer backend henüz user tablosunu populate etmediyse boş kalmasın diye) */}
              {membersList.length === 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">E</div>
                    <span className="text-sm font-bold text-purple-400">Emirhan 👑</span>
                  </div>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Bölümü */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0d13]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col justify-end">
              {/* Şimdilik Statik Chat - İleride Socket.io bağlanacak */}
              <div className="group">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-indigo-400">Sistem</span>
                  <span className="text-[10px] text-slate-600">{new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-sm text-slate-300 mt-0.5 leading-relaxed bg-[#131720] inline-block px-3 py-2 rounded-2xl rounded-tl-none border border-slate-800/50">
                  {roomData.roomName} odasına hoş geldin! Sohbet özelliği yakında eklenecektir.
                </p>
              </div>
            </div>
            
            {/* Mesaj Input */}
            <div className="p-4 bg-[#0f121a] border-t border-slate-800/60">
              <div className="relative">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Sessizce bir şeyler yaz..." 
                  className="w-full bg-[#171b26] border border-slate-700/50 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: POMODORO & MERKEZ */}
        <div className="flex-1 flex items-center justify-center relative bg-[#0b0e14]">
          {/* Arka plan ışık efekti */}
          <div className="absolute w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="z-10 flex flex-col items-center">
            {/* Dev Sayaç */}
            <div className="w-[450px] h-[450px] rounded-full border-[20px] border-indigo-900/20 flex flex-col items-center justify-center bg-[#11151f] shadow-2xl shadow-black/50">
              <span className="text-[120px] font-black tracking-tighter text-white drop-shadow-lg leading-none">25:00</span>
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-[0.4em] mt-6">
                Ortak Odak Seansı
              </p>
            </div>

            <div className="flex gap-4 mt-16">
              <button className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black tracking-widest transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-1 hover:shadow-indigo-500/40 text-lg">
                SEANSA KATIL
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActiveRoom;