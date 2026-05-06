import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoomService } from "../services/api.services";

const ActiveRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await RoomService.getRoomById(id);
        setRoomData(response?.room || response?.data || response);
      } catch (error) {
        console.error("Oda verisi alınamadı:", error);
        navigate("/rooms"); // Hata alırsak lobiye geri atar
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchRoomDetails();
  }, [id, navigate]);

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
        await RoomService.deleteRoom(id);
        navigate("/rooms"); 
      } catch (error) {
        console.error("Silme hatası:", error);
        const errorMessage = error.response?.data?.message || "Oda silinirken bir hata oluştu!";
        alert(errorMessage);
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

  return (
    <div className="h-screen flex flex-col bg-[#0b0e14] text-white overflow-hidden font-sans">
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
            <button
              onClick={handleLeaveRoom}
              disabled={isLeaving}
              className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLeaving ? "Ayrılıyor..." : "Odadan Ayrıl"}
            </button>
          </div>
        </div>
      </header>

      

      <div className="flex flex-1 overflow-hidden">
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
                  {roomData.roomName || "Bu"} odasına hoş geldin! Sohbet ve gerçek zamanlı senkronizasyon özelliği yakında eklenecektir.
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

        <div className="flex-1 flex items-center justify-center relative bg-[#0b0e14]">
          <div className="absolute w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="z-10 flex flex-col items-center">
            <div className="w-[450px] h-[450px] rounded-full border-[20px] border-indigo-900/20 flex flex-col items-center justify-center bg-[#11151f] shadow-2xl shadow-black/50">
              <span className="text-[120px] font-black tracking-tighter text-white drop-shadow-lg leading-none">25:00</span>
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-[0.4em] mt-6">Ortak Odak Seansı</p>
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