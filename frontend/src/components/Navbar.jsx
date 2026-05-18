import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProfileService, NotificationService } from "../services/api.services";
import socket from "../services/socket.service";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  // --- ARAMA MOTORU STATELERİ ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // --- BİLDİRİM STATELERİ ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);

  // Menüler dışarı tıklandığında kapansın
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Arama motoru kapatma
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        !event.target.closest(".search-trigger-btn")
      ) {
        setIsSearchOpen(false);
      }
      // Bildirim menüsü kapatma
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
      // Profil menüsü kapatma
      if (!event.target.closest(".profile-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bildirimleri Çek ve Socket.io Dinlemeye Başla
  useEffect(() => {
    // 2. Güvenli ID Bulucu (Hangisi doluysa onu alır)
    const userId = profile?._id || profile?.id || profile?.userId;

    if (!userId) {
      return; // ID yoksa kod aşağı inmez!
    }

    const fetchNotifications = async () => {
      try {
        const res = await NotificationService.getNotifications();
        // API'nin dönüş yapısına göre (res.data veya res.data.data) ayarlayabilirsin
        setNotifications(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Bildirimler çekilemedi", error);
      }
    };
    fetchNotifications();

    socket.emit("join_user_room", userId);

    const handleNewNotification = (yeniBildirim) => {
      setNotifications((prev) => [yeniBildirim, ...prev]);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [profile]);

  // Sadece okunmamış bildirimleri filtrele (silinmiş gibi göstermek için)
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      // Tüm bildirimleri okundu yap (Bu sayede unreadNotifications filtresine takılıp ekrandan kaybolurlar)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Tümünü oku hatası:", error);
    }
  };

  // Bildirime Tıklama (Okundu İşaretle ve Yönlendir)
  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await NotificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
      } catch (error) {
        console.error("Bildirim okunamadı", error);
      }
    }
    setIsNotifDropdownOpen(false);
    if (notif.type === "FRIEND_REQUEST" || notif.content.includes("takip etti")) {
      navigate("/profile?tab=friends");
    } else if (notif.type === "LEVEL_UP") {
      navigate("/profile?tab=stats");
    } else {
      navigate("/profile"); 
    }
  };

  // DAVET KABUL ET
  const handleAcceptInvite = async (e, notif) => {
    e.stopPropagation(); 
    try {
      await NotificationService.markAsRead(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      setIsNotifDropdownOpen(false);
      
      if (notif.roomId) {
        try {
           await RoomService.joinRoom(notif.roomId, "INVITED_BYPASS"); 
        } catch(err) {
           console.log("Giriş hatası:", err);
        }
      }

      if (notif.roomSlug) {
        navigate(`/room/${notif.roomSlug}`);
      } else {
        navigate("/rooms"); 
      }
    } catch (error) {
      console.error("Kabul etme hatası", error);
    }
  };

  // DAVET REDDET
  const handleRejectInvite = async (e, notif) => {
    e.stopPropagation(); 
    try {
      await NotificationService.markAsRead(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error("Reddetme hatası", error);
    }
  };

  // Arama butonu tıklandığında inputa odaklan
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [isSearchOpen]);

  // Debounce ile Arama İşlemi
  useEffect(() => {
    if (!isSearchOpen) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await ProfileService.searchUsers(searchTerm);
          setResults(res.data?.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isSearchOpen]);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.theme = isDark ? "dark" : "light";
    setIsDarkMode(isDark);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // XP Hesaplamaları
  const userLevel = profile?.level || 1;
  const currentXp = profile?.xp || 0;
  const requiredXp = Math.floor(userLevel * 100 * 1.5);
  const progressPercentage = Math.min((currentXp / requiredXp) * 100, 100);

  // Bildirim İkonları İçin Yardımcı Fonksiyon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "FRIEND_REQUEST":
        return <span className="text-xl">🫂</span>;
      case "LEVEL_UP":
        return <span className="text-xl">🏆</span>;
      case "SYSTEM":
        return <span className="text-xl">💻</span>;
      default:
        return <span className="text-xl">📣</span>;
    }
  };

  return (
    <nav className="bg-white dark:bg-[#1e293b]/60 backdrop-blur-md px-4 md:px-8 py-4 flex justify-between items-center rounded-b-[2rem] border-b border-slate-100 dark:border-slate-800 shadow-lg relative z-[100]">
      {/* 1. SOL TARAF - Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg hover:rotate-12 transition-transform">
          P
        </div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter hidden sm:block">
          Odaklan.
        </h1>
      </div>

      {/* 2. ORTA/SAĞ TARAF - Arama, Bildirimler, Profil */}
      <div className="flex items-center gap-2 md:gap-3 relative">
        {/* Görevler Butonu */}
        <Link
          to="/tasks"
          className={`flex items-center gap-2 p-2.5 md:px-4 md:py-2.5 rounded-xl font-black text-xs transition-all border shadow-sm tracking-widest uppercase ${
            location.pathname === "/tasks"
              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700/50"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-amber-400 border-transparent hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <span className="text-sm md:text-base">🎯</span>
          <span className="hidden md:block">GÖREVLER</span>
        </Link>

        {/* ARAMA MOTORU KONTEYNERİ */}
        <div
          ref={searchContainerRef}
          className={`absolute right-0 top-full mt-3 w-80 z-[120] transition-all duration-300 ease-out origin-top-right ${isSearchOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
        >
          <div className="relative group">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Arkadaşlarını ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0f172a]/50 border border-transparent focus:border-indigo-500/50 rounded-2xl py-2.5 pl-4 pr-11 text-sm outline-none text-slate-700 dark:text-white transition-all backdrop-blur-md focus:ring-4 focus:ring-indigo-500/10 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {loading ? (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-slate-400">🔍</span>
              </div>
            )}
          </div>

          {/* Arama Sonuçları */}
          {isSearchOpen && searchTerm.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-700/50 rounded-[1.5rem] shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 z-[110]">
              <div className="p-2 max-h-[350px] overflow-y-auto scrollbar-hide">
                {results.length > 0 ? (
                  results.map((user) => (
                    <div
                      key={user.userId}
                      onClick={() => {
                        navigate(`/profile/${user.userId}`);
                        setIsSearchOpen(false);
                        setSearchTerm("");
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl cursor-pointer transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 group-hover:border-indigo-500/50 transition-all flex-shrink-0">
                        {user.avatar && user.avatar !== "default-avatar.png" ? (
                          <img
                            src={
                              user.avatar.startsWith("http")
                                ? user.avatar
                                : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${user.avatar}`
                            }
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors truncate">
                          @{user.username}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider truncate">
                          {user.title || "Odaklayıcı"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      Sonuç bulunamadı 😕
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ARAMA TETİKLEYİCİ BUTON */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className={`search-trigger-btn p-2.5 rounded-xl text-slate-500 transition-all border border-transparent shadow-sm ${isSearchOpen ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700" : "bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 dark:hover:text-amber-400 hover:border-slate-300 dark:hover:border-slate-700"}`}
        >
          🔍
        </button>

        {/* --- BİLDİRİMLER ZİLİ VE AÇILIR MENÜSÜ --- */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className={`p-2.5 rounded-xl text-slate-500 transition-all border shadow-sm relative ${isNotifDropdownOpen ? "bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-amber-400"}`}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1e293b] animate-bounce shadow-md">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Bildirimler Dropdown Paneli */}
          {isNotifDropdownOpen && (
            <div className="fixed sm:absolute top-[4.5rem] sm:top-14 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 w-[calc(100vw-2rem)] max-w-sm sm:max-w-none sm:w-96 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden z-[110] transform transition-all animate-in fade-in slide-in-from-top-4 duration-200 origin-top sm:origin-top-right flex flex-col max-h-[400px]">
              {/* BİLDİRİM BAŞLIĞI VE TÜMÜNÜ OKU BUTONU */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">
                    Bildirimler
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      {unreadCount} Yeni
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-tighter"
                  >
                    Tümünü Oku
                  </button>
                )}
              </div>

              <div className="overflow-y-auto overflow-x-hidden p-2 flex-1 scrollbar-hide">
                {/* SADECE OKUNMAMIŞ BİLDİRİMLERİ GÖSTERİYORUZ */}
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 bg-indigo-50/50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20"
                    >
                      {/* 🔥 AVATAR KONTROLÜ BURADA YAPILDI 🔥 */}
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#1e293b] flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden border border-slate-300 dark:border-slate-600">
                        {notif.avatar &&
                        notif.avatar !== "default-avatar.png" ? (
                          <img
                            src={
                              notif.avatar.startsWith("http")
                                ? notif.avatar
                                : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${notif.avatar}`
                            }
                            className="w-full h-full object-cover"
                            alt="Avatar"
                          />
                        ) : (
                          getNotificationIcon(notif.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm leading-tight break-words text-slate-800 dark:text-slate-200 font-bold">
                          {notif.content}
                        </p>
                        {/* 🔥 EĞER TİP DAVET İSE BUTONLARI GÖSTER 🔥 */}
                        {notif.type === "ROOM_INVITE" && (
                          <div className="flex items-center gap-2 mt-2.5">
                            <button
                              onClick={(e) => handleAcceptInvite(e, notif)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-500 hover:text-white rounded-lg text-[10px] font-black tracking-widest transition-all shadow-sm"
                            >
                              KABUL ET
                            </button>
                            <button
                              onClick={(e) => handleRejectInvite(e, notif)}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-500 hover:text-white rounded-lg text-[10px] font-black tracking-widest transition-all shadow-sm"
                            >
                              REDDET
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5 shadow-md shadow-indigo-500/50"></div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-4xl mb-3 opacity-50 text-slate-400">
                      📭
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                      Tüm bildirimleri okudun
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Şu an buralar tertemiz görünüyor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Butonu */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-amber-400 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
        >
          {isDarkMode ? "🌞" : "🌙"}
        </button>

        {/* Profil Açılır Menü Tetikleyici */}
        <div className="relative profile-dropdown-container">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border transition-all ${
              isDropdownOpen
                ? "border-indigo-500/50 shadow-md"
                : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="w-9 h-9 bg-[#0f172a] rounded-xl flex items-center justify-center text-white font-black shadow-inner border border-slate-600 overflow-hidden">
              {profile?.avatar && profile.avatar !== "default-avatar.png" ? (
                <img
                  src={
                    profile.avatar?.startsWith("http")
                      ? profile.avatar
                      : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${profile.avatar}`
                  }
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              ) : (
                profile?.username?.charAt(0).toUpperCase() || "E"
              )}
            </div>
          </button>

          {/* Profil Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-14 right-0 w-80 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden z-[110] transform transition-all animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
              <div className="relative h-32 w-full overflow-hidden">
                {profile?.banner && profile.banner !== "default-banner.png" ? (
                  <img
                    src={
                      profile.banner?.startsWith("http")
                        ? profile.banner
                        : `https://pomodoro-app-omxg.onrender.com/public/uploads/banners/${profile.banner}`
                    }
                    className="w-full h-full object-cover"
                    alt="Banner"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 opacity-40" />
                )}
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-4 left-5 flex items-center gap-3 z-10">
                  <div className="w-14 h-14 rounded-2xl border-4 border-white/10 dark:border-[#0f172a] bg-[#0f172a] overflow-hidden flex items-center justify-center shadow-lg">
                    {profile?.avatar &&
                    profile.avatar !== "default-avatar.png" ? (
                      <img
                        src={
                          profile.avatar?.startsWith("http")
                            ? profile.avatar
                            : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${profile.avatar}`
                        }
                        className="w-full h-full object-cover"
                        alt="Avatar"
                      />
                    ) : (
                      <span className="text-xl font-black text-white">
                        {profile?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-black text-white uppercase tracking-tight truncate w-32 drop-shadow-md">
                      @{profile?.username || "KULLANICI"}
                    </p>
                    <span className="bg-indigo-500 text-[10px] px-2 py-0.5 rounded-lg font-black text-white uppercase italic shadow-sm">
                      SEVİYE {userLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      İlerleme
                    </span>
                    <span className="text-[10px] font-black text-indigo-500 tracking-tighter">
                      {currentXp} / {requiredXp} XP
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <button
                  onClick={() => {
                    navigate("/profile?tab=stats");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group"
                >
                  <span className="text-lg group-hover:scale-110 group-hover:-rotate-12 transition-transform">
                    👤
                  </span>{" "}
                  Profilim
                </button>
                <button
                  onClick={() => {
                    navigate("/statistics");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group"
                >
                  <span className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    📊
                  </span>{" "}
                  İstatistikler
                </button>
                <button
                  onClick={() => {
                    navigate("/profile?tab=friends");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform">
                      🫂
                    </span>{" "}
                    Arkadaşlarım
                  </div>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-2 mx-2"></div>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all group"
                  onClick={() => {
                    navigate("/settings?tab=profile");
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="text-lg group-hover:rotate-45 transition-transform duration-300">
                    ⚙️
                  </span>{" "}
                  Ayarlar
                </button>
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-xl transition-all group"
                >
                  <span className="text-lg group-hover:translate-x-1 transition-transform">
                    🚪
                  </span>{" "}
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
