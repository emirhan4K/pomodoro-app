import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api"; 
import { useAuth } from "../context/AuthContext"; 
import { FollowService } from "../services/api.services"; 
import FollowModal from "../components/FollowModal"; // Modal Importu

const Profile = ({ profile, requests = [], refresh }) => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "stats";
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);

  // Giriş yapmış kullanıcıyı useAuth'tan alıyoruz
  const { profile: currentUser } = useAuth(); 

  // --- TAKİP SİSTEMİ STATE'LERİ ---
  const [isFollowing, setIsFollowing] = useState(profile?.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(profile?.social?.followersCount || 0);
  const [followingCount, setFollowingCount] = useState(profile?.social?.followingCount || 0);
  const [modalData, setModalData] = useState({isOpen: false, type: "", title: "", });

  const openModal = (type, title) => {
    setModalData({ isOpen: true, type, title });
  };

  const closeModal = () => {
    setModalData({ isOpen: false, type: "", title: "" });
  };

  // Profilin sana ait olup olmadığını kontrol et
  const myId = currentUser?.userId || currentUser?.id || currentUser?._id;
  const viewedId = profile?.userId || profile?.id || profile?._id;
  const isMyProfile = String(myId) === String(viewedId);

  useEffect(() => {
    // console.log için boş bırakmıştın, burayı silebilirsin veya log atabilirsin.
  }, [myId, viewedId, isMyProfile]);

  // Profil datası güncellendiğinde stateleri senkronize et
  useEffect(() => {
    setFollowersCount(profile?.social?.followersCount || 0);
    setFollowingCount(profile?.social?.followingCount || 0);
    setIsFollowing(profile?.isFollowing || false);
  }, [profile]);

  // --- PROFİL BİLGİLERİ MANTIĞI ---
  const displayName = profile?.username || "İsimsiz Kahraman";
  const bio = profile?.title || "Henüz bir unvan eklenmemiş.";

  const email = profile?.email || "";
  const nickname = email
    ? `@${email.split("@")[0].toLowerCase()}`
    : `@${profile?.username || "odaklayici"}`;

  const initial = displayName.charAt(0).toUpperCase();
  const avatar = profile?.avatar;
  const banner = profile?.banner;

  const currentStreak = profile?.currentStreak || 0;
  const bestStreak = profile?.bestStreak || 0;
  const totalPomodoros = profile?.totalPomodoros || 0;
  const totalHours = Number(profile?.totalWorkTime || 0).toFixed(1);
  const calculatedLevel = profile?.level || 1;

  // Arkadaş listesini çek
  useEffect(() => {
    if (activeTab === "friends") {
      api
        .get("/friendships")
        .then((res) => setFriends(res.data))
        .catch(() => setFriends([]));
    }
  }, [activeTab]);

  const handleAction = async (type, id) => {
    try {
      const status = type === "accept" ? "accepted" : "rejected";
      await api.patch(`/friendships/${id}/respond`, { status });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // --- TAKİP ET / TAKİPTEN ÇIK AKSİYONU ---
  const handleFollowToggle = async () => {
    try {
      const targetId = profile?.userId || profile?._id;
      if (isFollowing) {
        await FollowService.unfollow(targetId);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await FollowService.follow(targetId);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Takip işlemi başarısız:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <Navbar profile={profile} notificationCount={requests.length} />

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mt-8">
          {/* SOL PANEL (PROFIL KARTI) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl rounded-[3rem] p-8 flex flex-col items-center border border-slate-200 dark:border-slate-800/50 shadow-xl relative overflow-hidden">
              {/* --- KAPAK FOTOĞRAFI (BANNER) ALANI --- */}
              <div className="absolute top-0 left-0 w-full h-40 overflow-hidden z-0">
                {banner && banner !== "default-banner.png" ? (
                  <img
                    src={
                      banner?.startsWith("http")
                        ? banner
                        : `https://pomodoro-app-omxg.onrender.com/public/uploads/banners/${banner}`
                    }
                    alt="Kapak Fotoğrafı"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-sm"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-[#1e293b]/20"></div>
              </div>

              {/* Ayarlara Git Butonu */}
              <button
                onClick={() => (window.location.href = "/settings")}
                className="absolute top-6 right-6 p-2.5 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md rounded-xl transition-all text-slate-600 dark:text-slate-300 z-20 shadow-sm hover:scale-110 hover:rotate-45 duration-300"
                title="Profili Düzenle"
              >
                ⚙️
              </button>

              {/* Büyük Profil Avatarı */}
              <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 shadow-lg shadow-indigo-500/30 mb-5 mt-10 group">
                <div className="w-full h-full bg-white dark:bg-[#0f172a] rounded-full flex items-center justify-center border-4 border-white dark:border-[#1e293b] transition-transform group-hover:scale-95 duration-300 overflow-hidden">
                  {avatar && avatar !== "default-avatar.png" ? (
                    <img
                      src={
                        avatar?.startsWith("http")
                          ? avatar
                          : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${avatar}`
                      }
                      alt="Profil Avatarı"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 to-purple-500">
                      {initial}
                    </span>
                  )}
                </div>
              </div>

              {/* İsim ve Nickname */}
              <h2 className="relative z-10 text-2xl font-black text-slate-800 dark:text-white tracking-tight text-center px-4">
                {displayName}
              </h2>
              <p className="relative z-10 text-sm font-bold text-indigo-500 dark:text-indigo-400 mt-1.5 flex items-center gap-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {nickname}
              </p>

              {/* Unvan/Bio Kutusu */}
              <div className="relative z-10 w-full bg-slate-50 dark:bg-slate-800/50 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center mb-6 shadow-inner">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {bio}
                </p>
              </div>

              {/* --- TAKİP İSTATİSTİKLERİ VE BUTON ALANI --- */}
              <div className="relative z-10 w-full flex flex-col items-center gap-5 mb-8">
                {/* Rakamlar */}
                <div className="flex items-center justify-center gap-8 text-sm w-full">
                  
                  {/* Takipçi Kısmı - Tıklanabilir */}
                  <div 
                    onClick={() => openModal("followers", "Takipçiler")}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <span className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {followersCount}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Takipçi
                    </span>
                  </div>

                  {/* Ayraç */}
                  <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>

                  {/* Takip Edilen Kısmı - Tıklanabilir */}
                  <div 
                    onClick={() => openModal("following", "Takip Edilenler")}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <span className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {followingCount}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Takip Edilen
                    </span>
                  </div>
                </div>

                {/* Aksiyon Butonu */}
                {isMyProfile ? (
                  <button
                    onClick={() => (window.location.href = "/settings")}
                    className="w-[80%] relative overflow-hidden py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-indigo-500/50"
                  >
                    Profili Düzenle
                  </button>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    className={`w-[80%] relative overflow-hidden py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${
                      isFollowing
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/50"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-indigo-500/50"
                    }`}
                  >
                    <span className="relative z-10">
                      {isFollowing ? "Takipten Çık" : "Takip Et"}
                    </span>
                  </button>
                )}
              </div>

              {/* Level Rozeti */}
              <div className="relative z-10 w-full flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Mevcut Seviye
                </span>
                <span className="bg-[#facc15] text-slate-900 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md">
                  LVL {calculatedLevel}
                </span>
              </div>
            </div>

            {/* Sosyal Etkileşim Paneli */}
            <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800/50 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                Sosyal Etkileşim
              </h3>
              <div className="space-y-3 mb-6">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl"
                  >
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                      @{req.senderName}
                    </span>
                    <button
                      onClick={() => handleAction("accept", req.id)}
                      className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                    >
                      ✓
                    </button>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-2 italic">
                    İstek yok.
                  </p>
                )}
              </div>
              <input
                type="text"
                placeholder="Arkadaş ara..."
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* SAĞ PANEL (İSTATİSTİKLER VEYA ARKADAŞLAR) */}
          <div className="space-y-6">
            {activeTab === "stats" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  label="Pomodoro"
                  value={totalPomodoros}
                  icon="🏆"
                  color="text-yellow-500"
                />
                <StatCard
                  label="Toplam Saat"
                  value={totalHours}
                  icon="🕒"
                  color="text-blue-500"
                />
                <StatCard
                  label="Mevcut Seri"
                  value={currentStreak}
                  icon="🔥"
                  color="text-orange-500"
                />
                <StatCard
                  label="En İyi Seri"
                  value={bestStreak}
                  icon="📈"
                  color="text-indigo-500"
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[500px]">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 tracking-tighter">
                  Arkadaşlarım
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-[2rem] border border-slate-100 dark:border-slate-700/30 transition-all hover:border-indigo-500/50"
                    >
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 dark:text-white">
                          @{friend.username}
                        </p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          Çevrimiçi
                        </p>
                      </div>
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <p className="col-span-full text-center text-slate-400 py-20 font-black italic">
                      Henüz hiç arkadaşın yok.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL BURADA ÇAĞRILIYOR --- */}
      <FollowModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        type={modalData.type}
        title={modalData.title}
        profileId={profile?.userId || profile?._id}
      />

    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl rounded-[3rem] p-12 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-xl group hover:scale-[1.02] transition-all">
    <div className="text-4xl mb-6 group-hover:rotate-12 transition-transform">
      {icon}
    </div>
    <p className="text-6xl font-black text-slate-800 dark:text-white mb-3 tracking-tighter">
      {value}
    </p>
    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${color}`}>
      {label}
    </p>
  </div>
);

export default Profile;