import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoomService } from "../services/api.services";
import { usePomodoro } from "../context/PomodoroContext"; 
import RoomCongratsModal from "../components/RoomCongratsModal"; // Yeni bileşeni bağladık

const ActiveRoom = ({ profile }) => {
  const { id: roomSlug } = useParams();
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [message, setMessage] = useState("");

  const { 
    timeLeft, isActive, selectedMinutes, 
    toggleTimer, handleReset, handleDurationSelect,
    showCongrats, setShowCongrats 
  } = usePomodoro();

  // --- DAİRE İLERLEME HESABI ---
  const radius = 190; // Daire yarıçapı
  const circumference = 2 * Math.PI * radius;
  // İlerleme yüzdesi
  const totalSeconds = selectedMinutes * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await RoomService.getRoomBySlug(roomSlug);
        setRoomData(response?.room || response?.data || response);
      } catch (error)  { console.error("Oda bulunamadı", error); navigate("/rooms"); } 
      finally { setIsLoading(false); }
    };
   if (roomSlug) fetchRoomDetails();
  }, [roomSlug, navigate]);

  const handleLeaveRoom = async () => {
    if (isLeaving || !roomData) return;
    try {
      setIsLeaving(true);
      const realRoomId = roomData.id || roomData._id; // Arka plan için gerçek ID lazım
      await RoomService.leaveRoom(realRoomId);
      navigate("/rooms");
    } catch (error) {
      navigate("/rooms");
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomData) return;
    if (window.confirm("Bu odayı kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz!")) {
      try {
        setIsLeaving(true);
        const realRoomId = roomData.id || roomData._id; // Arka plan için gerçek ID lazım
        await RoomService.deleteRoom(realRoomId);
        navigate("/rooms");
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Oda silinirken bir hata oluştu!");
        setIsLeaving(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#0b0e14] text-indigo-500 font-black animate-pulse">YÜKLENİYOR...</div>;
  if (!roomData) return null;

  const isOwner = profile && (profile.id === roomData.owner || profile._id === roomData.owner);

  return (
    <div className="h-screen flex flex-col bg-[#0b0e14] text-white overflow-hidden font-sans">
      
      {/* TEBRİK KARTI (Ayrı Dosyadan Gelen) */}
      <RoomCongratsModal 
        isOpen={showCongrats} 
        onClose={() => {
          setShowCongrats(false); 
          handleReset(); 
        }} 
        minutes={selectedMinutes}
      />

      {/* HEADER */}
      <header className="h-20 shrink-0 flex items-center px-6 border-b border-slate-800/60 bg-[#0f121a] z-10">
        <div className="flex flex-1 justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/rooms")} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">{roomData.roomName}</h1>
              <p className="text-xs text-slate-400">Su an <span className="text-emerald-400 font-bold">{roomData.members?.length || 0} kişi</span> aktif.</p>
            </div>
          </div>
          <button onClick={() => navigate("/rooms")} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold">Odadan Ayrıl</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SOL PANEL (Chat/Üyeler) */}
        <div className="w-80 border-r border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-800/60">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">ODADAKİLER</h3>
                <div className="space-y-4">
                    {roomData.members?.map((m, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black">
                                {(m.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-300">{m.username || "Kullanıcı"}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-[#0a0d13] p-4 flex flex-col justify-end">
                <p className="text-xs text-slate-500 italic mb-4">Sohbet yakında aktif edilecek...</p>
                <input type="text" placeholder="Mesaj yaz..." disabled className="w-full bg-[#171b26] border border-slate-800 rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed" />
            </div>
        </div>

        {/* MERKEZ (DAİRE EFEKTLİ POMODORO) */}
        <div className="flex-1 flex items-center justify-center relative bg-[#0b0e14]">
          <div className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000 ${isActive ? 'bg-orange-600/10' : 'bg-indigo-600/5'}`}></div>
          
          <div className="z-10 flex flex-col items-center">
            {/* Süre Seçiciler */}
            <div className="flex gap-2 mb-12">
              {[1, 25, 45, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => handleDurationSelect(min)}
                  disabled={isActive}
                  className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${selectedMinutes === min ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800/40 text-slate-500 hover:text-white disabled:opacity-30'}`}
                >
                  {min} DK
                </button>
              ))}
            </div>

            {/* DAİRE VE SAYAÇ */}
            <div className="relative w-[450px] h-[450px] flex items-center justify-center">
              {/* SVG Daire İlerleme Çizgisi */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 450 450">
                {/* Arka Plan Dairesi (Muted) */}
                <circle cx="225" cy="225" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-800/30" />
                {/* Hareketli İlerleme Dairesi */}
                <circle
                  cx="225" cy="225" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                  strokeLinecap="round"
                  className={`${isActive ? 'text-orange-500' : 'text-indigo-600'}`}
                />
              </svg>

              {/* İç Panel */}
              <div className="w-[360px] h-[360px] rounded-full bg-[#11151f] flex flex-col items-center justify-center shadow-2xl border border-slate-800/50">
                <span className={`text-[100px] font-black tracking-tighter transition-colors duration-500 ${isActive ? 'text-orange-400' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2">
                  {isActive ? "ODAKLANILIYOR" : "HAZIR MISIN?"}
                </p>
              </div>
            </div>

            {/* Kontroller */}
            <div className="flex gap-4 mt-16">
              <button 
                onClick={toggleTimer}
                className={`w-48 py-5 rounded-2xl font-black tracking-[0.2em] transition-all hover:-translate-y-1 ${isActive ? 'bg-orange-500 shadow-orange-500/20' : 'bg-indigo-600 shadow-indigo-600/20'} shadow-lg`}
              >
                {isActive ? "DURAKLAT" : "BAŞLAT"}
              </button>
              <button onClick={handleReset} className="p-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRoom;