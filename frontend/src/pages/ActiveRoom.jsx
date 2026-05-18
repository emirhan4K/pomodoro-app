import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoomService, FollowService } from "../services/api.services";
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

  // ÖZEL SAYAÇ
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customHours, setCustomHours] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [customError, setCustomError] = useState("");

  // 🔥 DAVET MODAL STATE'LERİ 🔥
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);

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
    if (!profile || (!profile._id && !profile.id)) return;

    const fetchRoomDetails = async () => {
      try {
        const response = await RoomService.getRoomBySlug(roomSlug);
        let data = response?.room || response?.data || response;
        if (profile && data.members) {
          const myAvatar = profile.avatar || profile.profile?.avatar || "default-avatar.png";
          const myUsername = profile.username || profile.user?.username || "Kullanıcı";
          const myIndex = data.members.findIndex(
            (m) =>
              String(m._id || m.id) ===
              String(profile._id || profile.id),
          );

          if (myIndex === -1) {
            data.members = [
              ...data.members,
              // 🔥 ANTI-HAYALET 1: Eksik username'i de objeye ekledik
              { ...profile, avatar: myAvatar, username: myUsername },
            ];
          } else {
            data.members[myIndex] = {
              ...data.members[myIndex],
              ...profile,
              avatar: myAvatar || data.members[myIndex].avatar,
              username: myUsername || data.members[myIndex].username,
            };
          }
        }

        setRoomData(data);
        roomIdRef.current = data.id || data._id;

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
    };
  }, [roomSlug, navigate, profile]);

  // 2. CHAT DİNLEYİCİLERİ
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (profileRef.current && (roomData?.id || roomData?._id)) {
        socket.emit("mark_seen", {
          roomId: String(roomData.id || roomData._id),
          messageId: msg._id,
          userId: profileRef.current.id || profileRef.current._id,
        });
      }
    };

    const handleUserTyping = ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.includes(username)) return [...prev, username];
          return prev;
        }
        return prev.filter((u) => u !== username);
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
        isTyping,
      });
    }
  };

  // 3. SOCKET.IO: GİRİŞ/ÇIKIŞ VE ANA YAYIN (HOST) YÖNETİMİ
  useEffect(() => {
    const realRoomId = roomData?.id || roomData?._id;
    if (!socket || !realRoomId) return;

    const roomIdStr = String(realRoomId);
    
    // 🔥 ANTI-HAYALET 2: Socket'e bomboş profil gitmesin diye "Garanti Zarf" hazırlıyoruz
    const safeCurrentUser = {
      ...profileRef.current,
      avatar: profileRef.current?.avatar || profileRef.current?.profile?.avatar || "default-avatar.png",
      username: profileRef.current?.username || profileRef.current?.user?.username || "Kullanıcı"
    };

    socket.emit("join_room", { roomId: roomIdStr, user: safeCurrentUser });

    const handleReconnect = () => {
      socket.emit("join_room", { roomId: roomIdStr, user: safeCurrentUser });
    };

    const handleUserJoined = (data) => {
      setRoomLogs((prev) => [...prev, { type: "join", text: data.message }]);

      const currentMembers = membersRef.current || [];
      const alreadyExists = currentMembers.some(
        (m) => String(m._id || m.id) === String(data.user._id || data.user.id),
      );

      let newMembersList = currentMembers;

      if (!alreadyExists) {
        // 🔥 ANTI-HAYALET 3: Karşıdan gelen profil eksikse onu da zorla giydiriyoruz
        const incomingUser = {
          ...data.user,
          avatar:
            data.user?.avatar ||
            data.user?.profile?.avatar ||
            "default-avatar.png",
          username: data.user?.username || data.user?.user?.username || "Birisi",
        };

        newMembersList = [...currentMembers, incomingUser];
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
        const myId = profileRef.current?._id || profileRef.current?.id;
        const leftUserId = data.user?._id || data.user?.id;
        
        if (String(myId) === String(leftUserId)) {
          return prevRoom; 
        }

        return {
          ...prevRoom,
          members: prevRoom.members?.filter(
            (m) => String(m._id || m.id) !== String(leftUserId),
          ),
        };
      });
    };

    socket.on("connect", handleReconnect);
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);

    return () => {
      socket.emit("leave_room", { roomId: roomIdStr, user: safeCurrentUser });
      socket.off("connect", handleReconnect);
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
    };
  }, [socket, roomData?.id, roomData?._id]);

  // 4. SÜRE DEĞİŞTİĞİNDE OTOMATİK SİNYAL YAYMA
  useEffect(() => {
    const realRoomId = roomData?.id || roomData?._id;
    if (isOwner && socket && realRoomId && isActive) {
      const syncInterval = setInterval(() => {
        socket.emit("sync_timer", {
          roomId: String(realRoomId),
          timerData: { timeLeft, isActive, selectedMinutes },
          activeMembers: membersRef.current,
        });
      }, 5000);
      return () => clearInterval(syncInterval);
    }
  }, [isActive, timeLeft, isOwner, selectedMinutes]);

  // 5. ÜYELERİN SİNYALİ DİNLEME
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

          let updatedMembers = [...data.activeMembers];
          const myId = profileRef.current?.id || profileRef.current?._id;

          // 🔥 ÖLÜMSÜZLÜK 2: Kurucunun listesinde yoksam (F5 kazası yüzünden beni sildiyse)
          if (myId) {
            const amIPresent = updatedMembers.some(m => String(m._id || m.id) === String(myId));
            
            // Yoksam, kendimi zorla listeye ekliyorum!
            if (!amIPresent) {
              const myAvatar = profileRef.current?.avatar || profileRef.current?.profile?.avatar || "default-avatar.png";
              const myUsername = profileRef.current?.username || profileRef.current?.user?.username || "Kullanıcı";
              
              updatedMembers.push({
                ...profileRef.current,
                avatar: myAvatar,
                username: myUsername
              });

              // Ve kurucuya arkadan sessizce "Ben buradayım, listeni düzelt" diyorum
              const realRoomId = prev.id || prev._id;
              socket.emit("join_room", { 
                roomId: String(realRoomId), 
                user: { ...profileRef.current, avatar: myAvatar, username: myUsername } 
              });
            }
          }

          return { ...prev, members: updatedMembers };
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

  const handleCustomIntegerInput = (setter) => (e) => {
    setter(e.target.value.replace(/[^0-9]/g, ""));
    setCustomError("");
  };

  const handleApplyCustomTime = () => {
    const hours = parseInt(customHours || "0", 10);
    const minutes = parseInt(customMinutes || "0", 10);
    const total = hours * 60 + minutes;

    if (!Number.isFinite(total) || total <= 0) {
      setCustomError("Lütfen geçerli bir süre girin.");
      return;
    }
    if (total > 600) {
      setCustomError("Maksimum 10 saat girebilirsiniz.");
      return;
    }

    handleRoomDurationSelect(total);
    setIsCustomOpen(false);
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

  // 🔥 DAVET ET MODALI FONKSİYONLARI 🔥
  const openInviteModal = async () => {
    setIsInviteModalOpen(true);
    try {
      const res = await FollowService.getFollowing(profile._id || profile.id);
      setFriendsList(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Arkadaşlar çekilemedi", error);
    }
  };

  const handleInvite = async (friendId) => {
    try {
      const realRoomId = roomData?.id || roomData?._id;
      await RoomService.inviteUser(realRoomId, friendId);
      setInvitedUsers((prev) => [...prev, friendId]);
    } catch (error) {
      console.error("Davet gönderilemedi", error);
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
      <div className="h-[100dvh] flex items-center justify-center bg-[#0b0e14] text-indigo-500 font-black animate-pulse text-2xl">
        ODAYA GİRİLİYOR...
      </div>
    );
  if (!roomData) return null;

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0b0e14] text-white overflow-hidden font-sans">
      <RoomCongratsModal
        isOpen={showCongrats}
        onClose={() => {
          setShowCongrats(false);
          handleReset();
        }}
        minutes={selectedMinutes}
      />

      {/* 🔥 DAVET ET MODAL'I 🔥 */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f121a] w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="font-black text-white text-lg tracking-tight">
                Odaya Davet Et
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {friendsList.length > 0 ? (
                friendsList.map((friend) => (
                  <div
                    key={friend.userId}
                    className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                        {friend.avatar &&
                        friend.avatar !== "default-avatar.png" ? (
                          <img
                            src={
                              friend.avatar.startsWith("http")
                                ? friend.avatar
                                : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${friend.avatar}`
                            }
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                            {friend.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInvite(friend.userId)}
                      disabled={invitedUsers.includes(friend.userId)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        invitedUsers.includes(friend.userId)
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
                      }`}
                    >
                      {invitedUsers.includes(friend.userId)
                        ? "Davet Edildi ✓"
                        : "Davet Et"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <span className="text-4xl mb-3 opacity-50 block">👥</span>
                  <p className="text-sm font-bold text-slate-500 mt-2">
                    Henüz kimseyi takip etmiyorsun.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-20 shrink-0 flex items-center px-4 md:px-6 border-b border-slate-800/60 bg-[#0f121a] z-10">
        <div className="flex flex-1 justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={handleLeaveRoom}
              className="p-1.5 md:p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
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
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-2 uppercase tracking-tighter italic truncate max-w-[150px] md:max-w-none">
                {roomData.roomName}
              </h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                <span className="text-emerald-400">
                  {roomData.members?.length || 0} KİŞİ
                </span>{" "}
                AKTİF
              </p>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3">
            {isOwner && (
              <button
                onClick={handleDeleteRoom}
                className="px-3 py-2 md:px-5 md:py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-[10px] md:text-xs font-black transition-all uppercase"
              >
                Kapat
              </button>
            )}
            <button
              onClick={handleLeaveRoom}
              className="px-3 py-2 md:px-5 md:py-2.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl text-[10px] md:text-xs font-black transition-all border border-slate-700 uppercase tracking-widest"
            >
              Ayrıl
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden custom-scrollbar">
        {/* MERKEZ (SAYAÇ) */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-[#0b0e14] order-1 md:order-2 py-8 md:py-0 shrink-0 min-h-[450px] md:min-h-0 border-b md:border-b-0 border-slate-800/60">
          <div
            className={`absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[90px] md:blur-[120px] transition-all duration-1000 ${isActive ? "bg-orange-600/10" : "bg-indigo-600/10"}`}
          ></div>

          <div className="z-10 flex flex-col items-center w-full">
            {isOwner && (
              <>
                <div className="flex justify-center gap-2 md:gap-3 mb-4 md:mb-6 px-2">
                  {[1, 25, 45, 60].map((min) => (
                    <button
                      key={min}
                      onClick={() => handleRoomDurationSelect(min)}
                      disabled={isActive}
                      className={`px-3 py-2 md:px-6 md:py-2.5 rounded-2xl text-[10px] font-black transition-all whitespace-nowrap ${selectedMinutes === min ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 translate-y-[-2px]" : "bg-slate-800/40 text-slate-500 hover:text-white border border-transparent hover:border-slate-700"} ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {min} DK
                    </button>
                  ))}
                  <button
                    onClick={() => setIsCustomOpen((v) => !v)}
                    disabled={isActive}
                    className={`px-3 py-2 md:px-5 md:py-2.5 rounded-2xl text-[10px] font-black transition-all flex items-center gap-1 whitespace-nowrap ${isCustomOpen || ![1, 25, 45, 60].includes(selectedMinutes) ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 translate-y-[-2px]" : "bg-slate-800/40 text-slate-500 hover:text-white border border-transparent hover:border-slate-700"} ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span>⚙️</span> ÖZEL
                  </button>
                </div>

                {isCustomOpen && (
                  <div className="mb-6 md:mb-10 w-full max-w-md mx-auto bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 md:p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-center">
                      Özel Süre Belirle
                    </p>
                    <div className="flex items-end justify-center gap-3">
                      <div className="flex flex-col items-center">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Saat</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={customHours}
                          onChange={handleCustomIntegerInput(setCustomHours)}
                          placeholder="0"
                          disabled={isActive}
                          className="w-16 md:w-20 text-center bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl py-2 md:py-2.5 text-lg font-black text-white outline-none transition-all"
                        />
                      </div>
                      <span className="text-2xl font-black text-slate-600 pb-2">:</span>
                      <div className="flex flex-col items-center">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Dakika</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={customMinutes}
                          onChange={handleCustomIntegerInput(setCustomMinutes)}
                          placeholder="0"
                          disabled={isActive}
                          className="w-16 md:w-20 text-center bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl py-2 md:py-2.5 text-lg font-black text-white outline-none transition-all"
                        />
                      </div>
                      <button
                        onClick={handleApplyCustomTime}
                        disabled={isActive}
                        className="ml-2 px-4 md:px-5 py-2 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] tracking-widest transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        UYGULA
                      </button>
                    </div>
                    {customError && (
                      <p className="text-rose-400 text-xs font-bold text-center mt-3">{customError}</p>
                    )}
                  </div>
                )}
              </>
            )}

            <div
              className={`relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] flex items-center justify-center ${!isOwner && !isActive ? "mt-6 md:mt-16" : ""}`}
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

              <div className="w-[230px] h-[230px] md:w-[340px] md:h-[340px] rounded-full bg-[#0f121a] flex flex-col items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] border border-slate-800/50">
                <span
                  className={`text-[60px] md:text-[90px] font-black tracking-tighter transition-all duration-500 ${isActive ? "text-orange-400 scale-110" : "text-white"}`}
                >
                  {formatTime(timeLeft)}
                </span>
                <div className="h-px w-10 md:w-12 bg-slate-800 my-1 md:my-2"></div>
                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  {isActive ? "SEANS BAŞLADI" : "MOLA BİTTİ"}
                </p>
              </div>
            </div>

            {isOwner ? (
              <div className="flex gap-3 md:gap-4 mt-8 md:mt-12">
                <button
                  onClick={handleRoomToggle}
                  className={`w-40 md:w-52 py-4 md:py-5 rounded-[2rem] font-black text-[10px] md:text-xs tracking-[0.3em] transition-all hover:-translate-y-1 active:scale-95 ${isActive ? "bg-orange-500 shadow-xl shadow-orange-500/20" : "bg-indigo-600 shadow-xl shadow-indigo-600/20"} text-white`}
                >
                  {isActive ? "DURAKLAT" : "ODAKLAN"}
                </button>
                <button
                  onClick={handleRoomReset}
                  className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-all border border-slate-700 shadow-lg shrink-0"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
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
              <div className="mt-8 md:mt-12 text-center px-4">
                <div className="inline-block bg-slate-800/40 border border-slate-700/50 px-4 md:px-6 py-3 md:py-4 rounded-2xl">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    SAYACI SADECE{" "}
                    <span className="text-orange-400">ODA SAHİBİ</span> KONTROL
                    EDEBİLİR
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SOL PANEL (Üyeler ve Chat) */}
        <div className="w-full md:w-72 border-r-0 md:border-r border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0 order-2 md:order-1 min-h-[500px] md:min-h-0">
          <div className="p-4 md:p-6 border-b border-slate-800/60 bg-indigo-600/5 max-h-[200px] md:max-h-[50%] overflow-y-auto custom-scrollbar shrink-0">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                ŞU AN ODADAKİLER
              </h3>
              {/* 🔥 DAVET ET BUTONU BURADA 🔥 */}
              <button
                onClick={openInviteModal}
                className="text-[10px] font-black bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-md transition-colors flex items-center gap-1"
              >
                <span>+</span> DAVET ET
              </button>
            </div>

            <div className="space-y-4 md:space-y-5">
              {roomData.members?.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 group animate-fade-in-up"
                >
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt="avatar"
                      className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover border border-slate-700 group-hover:border-indigo-500 transition-colors shadow-lg"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black group-hover:border-indigo-500 transition-colors shadow-lg">
                      {(m.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-black text-slate-200 uppercase tracking-tighter">
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

          <div className="flex-1 bg-[#0a0d13]/50 p-3 md:p-4 flex flex-col justify-end min-h-[300px]">
            <div className="flex-1 bg-[#0a0d13]/50 flex flex-col overflow-hidden">
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

        {/* SAĞ PANEL (CANLI LOGLAR) */}
        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-800/60 bg-[#0f121a] flex flex-col shrink-0 order-3 md:order-3 min-h-[200px] md:min-h-0">
          <div className="p-4 md:p-6 border-b border-slate-800/60 bg-emerald-600/5">
            <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1 md:mb-2">
              CANLI HAREKETLER
            </h3>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold">
              Odadaki anlık giriş ve çıkışlar
            </p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 md:space-y-3 custom-scrollbar">
            {roomLogs.length === 0 ? (
              <div className="text-[10px] text-slate-500 font-black tracking-widest text-center mt-6 md:mt-10 uppercase opacity-50">
                Henüz Hareket Yok
              </div>
            ) : (
              roomLogs.map((log, index) => (
                <div
                  key={index}
                  className={`text-[9px] md:text-[10px] font-bold px-3 py-2 md:py-3 rounded-xl border animate-fade-in-up ${
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