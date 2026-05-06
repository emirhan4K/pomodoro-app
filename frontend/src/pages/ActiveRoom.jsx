import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoomService } from "../services/api.services";
import api from "../services/api"; // Profil ve istatistik güncellemeleri için api'yi dahil ettik

const ActiveRoom = ({ profile }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Oda Durumları
  const [message, setMessage] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  // --- POMODORO SAYAÇ DURUMLARI ---
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Saniye cinsinden
  const [isActive, setIsActive] = useState(false);

  // Odayı Getir
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await RoomService.getRoomById(id);
        setRoomData(response?.room || response?.data || response);
      } catch (error) {
        console.error("Oda verisi alınamadı:", error);
        navigate("/rooms"); 
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchRoomDetails();
  }, [id, navigate]);

  // --- POMODORO MANTIĞI (GERİ SAYIM) ---
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(interval);
      handlePomodoroComplete(); // Süre bitince istatistiklere yaz!
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Süre Bittiğinde Çalışacak Fonksiyon (İstatistik ve Level Güncelleme)
  const handlePomodoroComplete = async () => {
    setIsActive(false);
    
    try {
      // DİKKAT: Buradaki rotayı backend'de istatistikleri kaydettiğin kendi rotana göre uyarla!
      // Örneğin: '/statistics/add' veya '/pomodoro/complete' olabilir.
      await api.post('/statistics/pomodoro/complete', { 
        duration: selectedMinutes,
        roomId: id // İstatistiklere "Bu çalışma şu odada yapıldı" bilgisini de ekleyebilirsin
      });

      // Opsiyonel: Ses çal
      // const audio = new Audio('/alarm.mp3'); audio.play();

      alert(`🎉 Harika! ${selectedMinutes} dakikalık odaklanma seansı tamamlandı. Tecrübe puanı (XP) kazandın!`);
      
      // Sayacı başa sar
      setTimeLeft(selectedMinutes * 60);
    } catch (error) {
      console.error("İstatistik kaydedilemedi:", error);
      alert("Seans bitti ancak istatistiklere kaydedilirken bir sorun oluştu.");
    }
  };

  const handleTimeSelect = (mins) => {
    if (isActive) return; // Sayaç çalışırken dakika değiştirilemez
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  // ------------------------------------

  const handleLeaveRoom = async () => {
    if (isLeaving) return;
    try {
      setIsLeaving(true);
      await RoomService.leaveRoom(id);
      navigate("/rooms");
    } catch (error) {
      navigate("/rooms");
    }
  };

  const handleDeleteRoom = async () => {
    if (window.confirm("Bu odayı kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz!")) {
      try {
        setIsLeaving(true);
        await RoomService.deleteRoom(id);
        navigate("/rooms");
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Oda silinirken bir hata oluştu!");
        setIsLeaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0b0e14] text-indigo-500">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
          <div className="text-xl font-bold animate-pulse">Odaya Bağlanılıyor...</div>
        </div>
      </div>
    );
  }

  if (!roomData) return null;

  const membersList = roomData.members || [];
  const activeCount = membersList.length;
  const categoryName = roomData.category || "ÇALIŞMA ALANI";
  const isOwner = profile && (profile.id === roomData.owner || profile._id === roomData.owner);

  return (
    <div className="h-screen flex flex-col bg-[#0b0e14] text-white overflow-hidden font-sans">
      {/* HEADER */}
      <header className="relative h-20 shrink-0 flex items-center px-6 border-b border-slate-800/60 z-10 bg-[#0f121a]">
        <div className="relative z-10 flex flex-1 justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveRoom}
              disabled={isLeaving}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 group disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>

            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                {roomData.roomName || "İsimsiz Oda"}
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
            {isOwner && (
              <button
                onClick={handleDeleteRoom}
                disabled={isLeaving}
                title="Odayı Kalıcı Olarak Sil"
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 rounded-xl transition-all disabled:opacity-50 group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            <button
              onClick={handleLeaveRoom}
              disabled={isLeaving}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              {isLeaving ? "Ayrılıyor..." : "Odadan Ayrıl"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SOL PANEL: SOHBET & ÜYELER */}
        <div className="w-80 border-r border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0">
          <div className="p-5 border-b border-slate-800/60 shrink-0">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">ODADAKİLER ({activeCount})</h3>
            <div className="space-y-4">
              {membersList.map((member, index) => {
                const memberName = member.username || member.name || "Kullanıcı";
                const memberId = member._id || member.id || member;

                return (
                  <div key={memberId || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shadow-sm">
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-200">
                        {memberName} {memberId === roomData.owner && " 👑"}
                      </span>
                    </div>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0d13]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col justify-end">
              <div className="group">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-indigo-400">Sistem</span>
                  <span className="text-[10px] text-slate-600">
                    {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-0.5 leading-relaxed bg-[#131720] inline-block px-3 py-2 rounded-2xl rounded-tl-none border border-slate-800/50">
                  {roomData.roomName || "Bu"} odasına hoş geldin! Odaklanmaya başlamak için sağ taraftaki sayacı kullanabilirsin.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#0f121a] border-t border-slate-800/60">
              <div className="relative">
                <input
                  type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Sessizce bir şeyler yaz..."
                  className="w-full bg-[#171b26] border border-slate-700/50 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: POMODORO SAYAÇ */}
        <div className="flex-1 flex items-center justify-center relative bg-[#0b0e14]">
          <div className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${isActive ? 'bg-orange-600/10' : 'bg-indigo-600/5'}`}></div>
          
          <div className="z-10 flex flex-col items-center">
            
            {/* Dakika Seçici (Sadece duraklatılmışken değiştirilebilir) */}
            <div className="flex gap-3 mb-8">
              {[1, 25, 45, 50].map((min) => (
                <button
                  key={min}
                  onClick={() => handleTimeSelect(min)}
                  disabled={isActive}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedMinutes === min 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800/50'
                  }`}
                >
                  {min} Dk
                </button>
              ))}
            </div>

            {/* Dev Sayaç */}
            <div className="w-[450px] h-[450px] rounded-full border-[20px] border-[#161b22] flex flex-col items-center justify-center bg-[#11151f] shadow-2xl shadow-black/50 relative overflow-hidden">
              <span className={`text-[120px] font-black tracking-tighter drop-shadow-lg leading-none transition-colors duration-500 ${isActive ? 'text-orange-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.4em] mt-6">
                {isActive ? "Odaklanılıyor..." : "Ortak Odak Seansı"}
              </p>
            </div>

            {/* Kontrol Butonları */}
            <div className="flex gap-4 mt-12">
              <button 
                onClick={toggleTimer}
                className={`w-48 py-5 text-white rounded-2xl font-black tracking-widest transition-all shadow-lg text-lg hover:-translate-y-1 ${
                  isActive 
                  ? 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                }`}
              >
                {isActive ? "DURAKLAT" : "BAŞLAT"}
              </button>

              <button 
                onClick={resetTimer}
                title="Sayacı Sıfırla"
                className="px-6 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all shadow-lg hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRoom;