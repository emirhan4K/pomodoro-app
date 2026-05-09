import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoomService } from "../services/api.services";
import { usePomodoro } from "../context/PomodoroContext"; 
import RoomCongratsModal from "../components/RoomCongratsModal";
import { useSocket } from "../context/SocketContext"; 

const ActiveRoom = ({ profile }) => {
  const { id: roomSlug } = useParams();
  const navigate = useNavigate();
  const socket = useSocket(); 

  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [roomLogs, setRoomLogs] = useState([]); 
  
  const roomIdRef = useRef(null);

  const { 
    timeLeft, isActive, selectedMinutes, 
    toggleTimer, handleReset, handleDurationSelect,
    showCongrats, setShowCongrats 
  } = usePomodoro();

  // Profil bilgisini güvenli bir referansa alıyoruz
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const radius = 190;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = selectedMinutes * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // 1. Odayı API'den Çekme İşlemi
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await RoomService.getRoomBySlug(roomSlug);
        let data = response?.room || response?.data || response;
        
        // ÇÖZÜM: Odaya girdiğimizde, eğer API'den gelen listede yoksak kendimizi anında ekleyelim!
        if (profileRef.current && data.members) {
          const amIHere = data.members.some(m => String(m._id || m.id) === String(profileRef.current._id || profileRef.current.id));
          if (!amIHere) {
            data.members = [...data.members, profileRef.current];
          }
        }

        setRoomData(data);
        roomIdRef.current = data.id || data._id;
      } catch (error) { 
        console.error("Oda bulunamadı", error); 
        navigate("/rooms"); 
      } finally { 
        setIsLoading(false); 
      }
    };
    if (roomSlug) fetchRoomDetails();

    return () => {
      if (roomIdRef.current) {
        RoomService.leaveRoom(roomIdRef.current).catch(err => console.log("Otomatik ayrılma hatası", err));
      }
    };
  }, [roomSlug, navigate]);

  // 2. SOCKET.IO MANTIĞI (F5 Gerektirmeyen Kurşun Geçirmez Versiyon)
  useEffect(() => {
    const realRoomId = roomData?.id || roomData?._id;
    
    if (!socket || !realRoomId) return;

    const roomIdStr = String(realRoomId);
    const currentUser = profileRef.current;

    // Odaya girildiğini backend'e bildir
    socket.emit('join_room', { roomId: roomIdStr, user: currentUser });

    // BAŞKASI GİRDİĞİNDE (Canlı Ekleme)
    const handleUserJoined = (data) => {
      setRoomLogs((prev) => [...prev, { type: 'join', text: data.message }]);
      
      setRoomData((prevRoom) => {
        if (!prevRoom) return prevRoom;
        
        const alreadyExists = prevRoom.members?.some(m => 
          String(m._id || m.id) === String(data.user._id || data.user.id)
        );
        
        if (alreadyExists) return prevRoom;
        
        return {
          ...prevRoom,
          members: [...(prevRoom.members || []), data.user]
        };
      });
    };

    // BAŞKASI ÇIKTIĞINDA (Canlı Silme)
    const handleUserLeft = (data) => {
      setRoomLogs((prev) => [...prev, { type: 'leave', text: data.message }]);
      
      setRoomData((prevRoom) => {
        if (!prevRoom) return prevRoom;
        return {
          ...prevRoom,
          members: prevRoom.members?.filter(m => 
            String(m._id || m.id) !== String(data.user._id || data.user.id)
          )
        };
      });
    };

    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    // Temizlik
    return () => {
      socket.emit('leave_room', { roomId: roomIdStr, user: currentUser });
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  // DİKKAT: Bağımlılıklarda sadece oda ID'si ve socket var. profile veya roomData objesi YOK!
  }, [socket, roomData?.id, roomData?._id]);

  const handleLeaveRoom = async () => {
    if (isLeaving || !roomData) return;
    try {
      setIsLeaving(true);
      const realRoomId = roomData.id || roomData._id;
      await RoomService.leaveRoom(realRoomId);
      navigate("/rooms");
    } catch (error) {
      navigate("/rooms");
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomData) return;
    if (window.confirm("Bu odayı kalıcı olarak silmek istediğine emin misin?")) {
      try {
        setIsLeaving(true);
        const realRoomId = roomData.id || roomData._id;
        await RoomService.deleteRoom(realRoomId);
        roomIdRef.current = null; 
        navigate("/rooms");
      } catch (error) {
        alert("Hata!");
        setIsLeaving(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#0b0e14] text-indigo-500 font-black animate-pulse text-2xl">ODAYA GİRİLİYOR...</div>;
  if (!roomData) return null;

  return (
    <div className="h-screen flex flex-col bg-[#0b0e14] text-white overflow-hidden font-sans">
      <RoomCongratsModal 
        isOpen={showCongrats} 
        onClose={() => { setShowCongrats(false); handleReset(); }} 
        minutes={selectedMinutes}
      />

      {/* HEADER */}
      <header className="h-20 shrink-0 flex items-center px-6 border-b border-slate-800/60 bg-[#0f121a] z-10">
        <div className="flex flex-1 justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={handleLeaveRoom} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter italic">{roomData.roomName}</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <span className="text-emerald-400">{roomData.members?.length || 0} ODA SAKİNİ</span> AKTİF
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
             {profile && (profile.id === (roomData.owner?._id || roomData.owner) || profile._id === (roomData.owner?._id || roomData.owner)) && (
               <button onClick={handleDeleteRoom} className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-xs font-black transition-all uppercase">Odayı Kapat</button>
             )}
             <button onClick={handleLeaveRoom} className="px-5 py-2.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl text-xs font-black transition-all border border-slate-700 uppercase tracking-widest">Odadan Ayrıl</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SOL PANEL (Üyeler) */}
        <div className="w-72 border-r border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-800/60 bg-indigo-600/5">
                <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">ŞU AN ODADAKİLER</h3>
                <div className="space-y-5">
                    {roomData.members?.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 group animate-fade-in-up">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black group-hover:border-indigo-500 transition-colors">
                                {(m.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-200 uppercase tracking-tighter">@{m.username || "Kullanıcı"}</span>
                                <span className="text-[8px] text-emerald-500 font-black tracking-widest">ODAKLANIYOR</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-[#0a0d13]/50 p-4 flex flex-col justify-end">
                <div className="bg-slate-800/20 rounded-2xl p-4 border border-slate-800/40">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest text-center">Mesajlaşma Çok Yakında!</p>
                </div>
            </div>
        </div>

        {/* MERKEZ (SAYAÇ) */}
        <div className="flex-1 flex items-center justify-center relative bg-[#0b0e14]">
          <div className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${isActive ? 'bg-orange-600/10' : 'bg-indigo-600/10'}`}></div>
          
          <div className="z-10 flex flex-col items-center">
            {/* Süre Seçiciler */}
            <div className="flex gap-3 mb-10">
              {[1, 25, 45, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => handleDurationSelect(min)}
                  disabled={isActive}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all ${selectedMinutes === min ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 translate-y-[-2px]' : 'bg-slate-800/40 text-slate-500 hover:text-white border border-transparent hover:border-slate-700'}`}
                >
                  {min} DAKİKA
                </button>
              ))}
            </div>

            {/* DAİRE VE SAYAÇ */}
            <div className="relative w-[420px] h-[420px] flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 450 450">
                <circle cx="225" cy="225" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800/20" />
                <circle
                  cx="225" cy="225" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                  strokeLinecap="round"
                  className={`${isActive ? 'text-orange-500' : 'text-indigo-600'} drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]`}
                />
              </svg>

              <div className="w-[340px] h-[340px] rounded-full bg-[#0f121a] flex flex-col items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] border border-slate-800/50">
                <span className={`text-[90px] font-black tracking-tighter transition-all duration-500 ${isActive ? 'text-orange-400 scale-110' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
                <div className="h-px w-12 bg-slate-800 my-2"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  {isActive ? "SEANS BAŞLADI" : "MOLA BİTTİ"}
                </p>
              </div>
            </div>

            {/* Kontroller */}
            <div className="flex gap-4 mt-12">
              <button 
                onClick={toggleTimer}
                className={`w-52 py-5 rounded-[2rem] font-black text-xs tracking-[0.3em] transition-all hover:-translate-y-1 active:scale-95 ${isActive ? 'bg-orange-500 shadow-xl shadow-orange-500/20' : 'bg-indigo-600 shadow-xl shadow-indigo-600/20'} text-white`}
              >
                {isActive ? "DURAKLAT" : "ODAKLAN"}
              </button>
              <button onClick={handleReset} className="w-16 h-16 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-all border border-slate-700 shadow-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL (CANLI LOGLAR) */}
        <div className="w-72 border-l border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-800/60 bg-emerald-600/5">
                <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">CANLI HAREKETLER</h3>
                <p className="text-[10px] text-slate-500 font-bold">Odadaki anlık giriş ve çıkışlar</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {roomLogs.length === 0 ? (
                <div className="text-[10px] text-slate-500 font-black tracking-widest text-center mt-10 uppercase opacity-50">
                  Henüz Hareket Yok
                </div>
              ) : (
                roomLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-[10px] font-bold px-3 py-3 rounded-xl border animate-fade-in-up ${
                      log.type === 'join'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}
                  >
                    {log.text}
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRoom;