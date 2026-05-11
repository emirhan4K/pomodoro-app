import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoomService } from "../services/api.services";
import { usePomodoro } from "../context/PomodoroContext";
import RoomCongratsModal from "../components/RoomCongratsModal";
import { useSocket } from "../context/SocketContext";
import ChatBox from "../components/ChatBox";

const ActiveRoom = ({ profile }) => {
  const { id: roomSlug } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [roomLogs, setRoomLogs] = useState([]);

  // CHAT STATE'LERİ
  const [messages, setMessages] = useState([]); 
  const [typingUsers, setTypingUsers] = useState([]);

  const roomIdRef = useRef(null);

  const {
    timeLeft,
    isActive,
    selectedMinutes,
    toggleTimer,
    handleReset,
    handleDurationSelect,
    showCongrats,
    setShowCongrats,
    setTimeLeft,
    setIsActive,
    setSelectedMinutes,
  } = usePomodoro();
  
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const isOwner =
    profile &&
    roomData &&
    (profile.id === (roomData.owner?._id || roomData.owner) ||
      profile._id === (roomData.owner?._id || roomData.owner));
  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    isOwnerRef.current = isOwner;
  }, [isOwner]);

  const timerRef = useRef({ timeLeft, isActive, selectedMinutes });
  useEffect(() => {
    timerRef.current = { timeLeft, isActive, selectedMinutes };
  }, [timeLeft, isActive, selectedMinutes]);

  const membersRef = useRef([]);
  useEffect(() => {
    if (roomData?.members) membersRef.current = roomData.members;
  }, [roomData?.members]);

  const radius = 190;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = selectedMinutes * 60;
  const progress =
    totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // 1. Odayı ve Geçmiş Mesajları API'den Çekme
 useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await RoomService.getRoomBySlug(roomSlug);
        let data = response?.room || response?.data || response;

        // ÇÖZÜM: Kendimizi listeye ekliyoruz veya backend eksik yolladıysa resmi zorla güncelliyoruz
        if (profileRef.current && data.members) {
          const myAvatar = profileRef.current.avatar || profileRef.current.profile?.avatar || "default-avatar.png";
          
          const myIndex = data.members.findIndex(
            (m) => String(m._id || m.id) === String(profileRef.current._id || profileRef.current.id)
          );

          if (myIndex === -1) {
            // 1. DURUM: Listede yoksak, resmimizle birlikte ekleniyoruz
            data.members = [...data.members, { ...profileRef.current, avatar: myAvatar }];
          } else {
            // 2. DURUM: Listede varsak (odayı yeni kurduğumuz senaryo), resmi zorla yapıştırıyoruz
            data.members[myIndex] = { 
              ...data.members[myIndex], 
              avatar: myAvatar || data.members[myIndex].avatar 
            };
          }
        }

        setRoomData(data);
        roomIdRef.current = data.id || data._id;

        // ÇÖZÜM: GEÇMİŞ MESAJLARI BURADA ÇEKİYORUZ
        const realId = data.id || data._id;
        if (realId) {
          try {
            const msgResponse = await RoomService.getRoomMessages(realId);
            if (msgResponse.success) setMessages(msgResponse.messages);
          } catch (err) {
            console.error("Geçmiş mesajlar çekilemedi", err);
          }
        }

      } catch (error) {
        navigate("/rooms");
      } finally {
        setIsLoading(false);
      }
    };

    if (roomSlug) fetchRoomDetails();

    return () => {
      if (roomIdRef.current) {
        RoomService.leaveRoom(roomIdRef.current).catch(() => {});
      }
    };
  }, [roomSlug, navigate]);

  // 2. CHAT DİNLEYİCİLERİ (Görüldü ve Yazıyor Sinyalleri)
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      
      // Mesaj geldiğinde "Görüldü" sinyali fırlat
      if (profileRef.current && (roomData?.id || roomData?._id)) {
         socket.emit("mark_seen", { 
           roomId: String(roomData.id || roomData._id), 
           messageId: msg._id, 
           userId: profileRef.current.id || profileRef.current._id 
         });
      }
    };

    const handleUserTyping = ({ username, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          if (!prev.includes(username)) return [...prev, username];
          return prev;
        }
        return prev.filter(u => u !== username);
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
    };
  }, [socket, roomData?.id, roomData?._id]);

  // --- CHAT KONTROLLERİ ---
  const handleSendMessage = (text) => {
    const realRoomId = roomData?.id || roomData?._id;
    if (socket && realRoomId) {
      socket.emit("send_message", {
        roomId: String(realRoomId),
        message: text,
        user: profile,
      });
    }
  };

  const handleTyping = (isTyping) => {
    const realId = roomData?.id || roomData?._id;
    if (socket && realId) {
      socket.emit("typing", {
        roomId: String(realId),
        username: profileRef.current?.username,
        isTyping
      });
    }
  };

  // 3. SOCKET.IO: GİRİŞ/ÇIKIŞ VE ANA YAYIN (HOST) YÖNETİMİ
  useEffect(() => {
    const realRoomId = roomData?.id || roomData?._id;
    if (!socket || !realRoomId) return;

    const roomIdStr = String(realRoomId);
    const currentUser = profileRef.current;

    socket.emit("join_room", { roomId: roomIdStr, user: currentUser });

    const handleReconnect = () => {
      socket.emit("join_room", { roomId: roomIdStr, user: currentUser });
    };

    const handleUserJoined = (data) => {
      setRoomLogs((prev) => [...prev, { type: "join", text: data.message }]);

      const currentMembers = membersRef.current || [];
      const alreadyExists = currentMembers.some(
        (m) => String(m._id || m.id) === String(data.user._id || data.user.id),
      );

      let newMembersList = currentMembers;

      if (!alreadyExists) {
        newMembersList = [...currentMembers, data.user];
        setRoomData((prevRoom) =>
          prevRoom ? { ...prevRoom, members: newMembersList } : prevRoom,
        );
      }

      if (isOwnerRef.current) {
        socket.emit("sync_timer", {
          roomId: roomIdStr,
          timerData: timerRef.current,
          activeMembers: newMembersList,
        });
      }
    };

    const handleUserLeft = (data) => {
      setRoomLogs((prev) => [...prev, { type: "leave", text: data.message }]);
      setRoomData((prevRoom) => {
        if (!prevRoom) return prevRoom;
        return {
          ...prevRoom,
          members: prevRoom.members?.filter(
            (m) =>
              String(m._id || m.id) !== String(data.user._id || data.user.id),
          ),
        };
      });
    };

    socket.on("connect", handleReconnect);
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);

    return () => {
      socket.emit("leave_room", { roomId: roomIdStr, user: currentUser });
      socket.off("connect", handleReconnect);
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
    };
  }, [socket, roomData?.id, roomData?._id]);

  // 4. SÜRE DEĞİŞTİĞİNDE OTOMATİK SİNYAL YAYMA (Sadece Kurucu Yayabilir)
  useEffect(() => {
    const realRoomId = roomData?.id || roomData?._id;

    if (isOwner && socket && realRoomId && isActive) {
      const syncInterval = setInterval(() => {
        socket.emit("sync_timer", {
          roomId: String(realRoomId),
          timerData: {
            timeLeft: timeLeft,
            isActive: isActive,
            selectedMinutes: selectedMinutes,
          },
          activeMembers: membersRef.current,
        });
      }, 5000); 

      return () => clearInterval(syncInterval);
    }
  }, [isActive, timeLeft, isOwner, selectedMinutes]); 

  // 5. ÜYELERİN SİNYALİ DİNLEME VE İTAAT ETME ALANI
  useEffect(() => {
    if (!socket || isOwner) return;

    const handleTimerUpdate = (data) => {
      if (data.timerData) {
        setTimeLeft(data.timerData.timeLeft);
        setIsActive(data.timerData.isActive);
        setSelectedMinutes(data.timerData.selectedMinutes);
      }

      if (data.activeMembers) {
        setRoomData((prev) => {
          if (!prev) return prev;
          return { ...prev, members: data.activeMembers };
        });
      }
    };

    socket.on("timer_updated", handleTimerUpdate);
    return () => socket.off("timer_updated", handleTimerUpdate);
  }, [socket, isOwner, setTimeLeft, setIsActive, setSelectedMinutes]);

  // --- ÖZEL BUTON KONTROLLERİ ---
  const handleRoomReset = () => {
    handleReset();
    if (isOwner && socket && roomData) {
      socket.emit("sync_timer", {
        roomId: String(roomData.id || roomData._id),
        timerData: {
          timeLeft: selectedMinutes * 60,
          isActive: false,
          selectedMinutes,
        },
        activeMembers: membersRef.current,
      });
    }
  };

  const handleRoomDurationSelect = (min) => {
    handleDurationSelect(min);
    if (isOwner && socket && roomData) {
      socket.emit("sync_timer", {
        roomId: String(roomData.id || roomData._id),
        timerData: {
          timeLeft: min * 60,
          isActive: false,
          selectedMinutes: min,
        },
        activeMembers: membersRef.current,
      });
    }
  };

  const handleRoomToggle = () => {
    toggleTimer();
    if (isOwner && socket && roomData) {
      socket.emit("sync_timer", {
        roomId: String(roomData.id || roomData._id),
        timerData: { timeLeft, isActive: !isActive, selectedMinutes },
        activeMembers: membersRef.current,
      });
    }
  };

  const handleLeaveRoom = async () => {
    if (isLeaving || !roomData) return;
    try {
      setIsLeaving(true);
      await RoomService.leaveRoom(roomData.id || roomData._id);
      navigate("/rooms");
    } catch (error) {
      navigate("/rooms");
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomData) return;
    if (
      window.confirm("Bu odayı kalıcı olarak silmek istediğine emin misin?")
    ) {
      try {
        setIsLeaving(true);
        await RoomService.deleteRoom(roomData.id || roomData._id);
        roomIdRef.current = null;
        navigate("/rooms");
      } catch (error) {
        setIsLeaving(false);
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#0b0e14] text-indigo-500 font-black animate-pulse text-2xl">
        ODAYA GİRİLİYOR...
      </div>
    );
  if (!roomData) return null;

  return (
    <div className="h-screen flex flex-col bg-[#0b0e14] text-white overflow-hidden font-sans">
      <RoomCongratsModal
        isOpen={showCongrats}
        onClose={() => {
          setShowCongrats(false);
          handleReset();
        }}
        minutes={selectedMinutes}
      />

      <header className="h-20 shrink-0 flex items-center px-6 border-b border-slate-800/60 bg-[#0f121a] z-10">
        <div className="flex flex-1 justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveRoom}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter italic">
                {roomData.roomName}
              </h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <span className="text-emerald-400">
                  {roomData.members?.length || 0} ODA SAKİNİ
                </span>{" "}
                AKTİF
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {isOwner && (
              <button
                onClick={handleDeleteRoom}
                className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-xs font-black transition-all uppercase"
              >
                Odayı Kapat
              </button>
            )}
            <button
              onClick={handleLeaveRoom}
              className="px-5 py-2.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl text-xs font-black transition-all border border-slate-700 uppercase tracking-widest"
            >
              Odadan Ayrıl
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SOL PANEL */}
        <div className="w-72 border-r border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-800/60 bg-indigo-600/5 max-h-[50%] overflow-y-auto custom-scrollbar">
            <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">
              ŞU AN ODADAKİLER
            </h3>
            <div className="space-y-5">
              {roomData.members?.map((m, i) => (
                <div
  key={i}
  className="flex items-center gap-3 group animate-fade-in-up"
>
  {/* RESİM KISMI BURAYA EKLENDİ */}
  {m.avatar ? (
    <img 
      src={m.avatar} 
      alt="avatar" 
      className="w-9 h-9 rounded-xl object-cover border border-slate-700 group-hover:border-indigo-500 transition-colors shadow-lg" 
    />
  ) : (
    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black group-hover:border-indigo-500 transition-colors shadow-lg">
      {(m.username || "U").charAt(0).toUpperCase()}
    </div>
  )}
  
  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-200 uppercase tracking-tighter">
                      @{m.username || "Kullanıcı"}
                      {String(m._id || m.id) ===
                        String(roomData.owner?._id || roomData.owner) && (
                        <span className="ml-2 text-[8px] text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                          KURUCU
                        </span>
                      )}
                    </span>
                    <span className="text-[8px] text-emerald-500 font-black tracking-widest">
                      ODAKLANIYOR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 bg-[#0a0d13]/50 p-4 flex flex-col justify-end min-h-[300px]">
            <div className="flex-1 bg-[#0a0d13]/50 flex flex-col overflow-hidden">
              {/* CHATBOX BİLEŞENİ GÜNCELLENDİ */}
              <ChatBox 
                messages={messages} 
                currentUser={profile}
                onSendMessage={handleSendMessage} 
                onTyping={handleTyping}
                typingUsers={typingUsers}
              />
            </div>
          </div>
        </div>

        {/* MERKEZ (SAYAÇ) */}
        <div className="flex-1 flex items-center justify-center relative bg-[#0b0e14]">
          <div
            className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${isActive ? "bg-orange-600/10" : "bg-indigo-600/10"}`}
          ></div>

          <div className="z-10 flex flex-col items-center">
            {/* Süre Seçiciler - SADECE KURUCUYA GÖRÜNÜR */}
            {isOwner && (
              <div className="flex gap-3 mb-10">
                {[1, 25, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => handleRoomDurationSelect(min)}
                    disabled={isActive}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all ${selectedMinutes === min ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 translate-y-[-2px]" : "bg-slate-800/40 text-slate-500 hover:text-white border border-transparent hover:border-slate-700"}`}
                  >
                    {min} DAKİKA
                  </button>
                ))}
              </div>
            )}

            <div
              className={`relative w-[420px] h-[420px] flex items-center justify-center ${!isOwner && !isActive ? "mt-16" : ""}`}
            >
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 450 450"
              >
                <circle
                  cx="225"
                  cy="225"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800/20"
                />
                <circle
                  cx="225"
                  cy="225"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  style={{
                    strokeDashoffset,
                    transition: "stroke-dashoffset 1s linear",
                  }}
                  strokeLinecap="round"
                  className={`${isActive ? "text-orange-500" : "text-indigo-600"} drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]`}
                />
              </svg>

              <div className="w-[340px] h-[340px] rounded-full bg-[#0f121a] flex flex-col items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] border border-slate-800/50">
                <span
                  className={`text-[90px] font-black tracking-tighter transition-all duration-500 ${isActive ? "text-orange-400 scale-110" : "text-white"}`}
                >
                  {formatTime(timeLeft)}
                </span>
                <div className="h-px w-12 bg-slate-800 my-2"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  {isActive ? "SEANS BAŞLADI" : "MOLA BİTTİ"}
                </p>
              </div>
            </div>

            {/* Kontroller */}
            {isOwner ? (
              <div className="flex gap-4 mt-12">
                <button
                  onClick={handleRoomToggle}
                  className={`w-52 py-5 rounded-[2rem] font-black text-xs tracking-[0.3em] transition-all hover:-translate-y-1 active:scale-95 ${isActive ? "bg-orange-500 shadow-xl shadow-orange-500/20" : "bg-indigo-600 shadow-xl shadow-indigo-600/20"} text-white`}
                >
                  {isActive ? "DURAKLAT" : "ODAKLAN"}
                </button>
                <button
                  onClick={handleRoomReset}
                  className="w-16 h-16 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-all border border-slate-700 shadow-lg"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="mt-12 text-center">
                <div className="inline-block bg-slate-800/40 border border-slate-700/50 px-6 py-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    SAYACI SADECE{" "}
                    <span className="text-orange-400">ODA SAHİBİ</span> KONTROL
                    EDEBİLİR
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SAĞ PANEL (CANLI LOGLAR) */}
        <div className="w-72 border-l border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-800/60 bg-emerald-600/5">
            <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">
              CANLI HAREKETLER
            </h3>
            <p className="text-[10px] text-slate-500 font-bold">
              Odadaki anlık giriş ve çıkışlar
            </p>
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
                    log.type === "join"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
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