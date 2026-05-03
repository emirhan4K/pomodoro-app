import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Sekme kontrolü için
import Navbar from "../components/Navbar";
import api from "../services/api";

const Profile = ({ profile, requests = [], refresh }) => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "stats"; 
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]); 

  const username = profile?.username || "Kullanıcı";
  const currentStreak = profile?.currentStreak || 0;
  const bestStreak = profile?.bestStreak || 0;
  
  // ŞU 3 SATIRI DEĞİŞTİR:
  const totalPomodoros = profile?.totalPomodoros || 0; 
const totalHours = Number(profile?.totalWorkTime || 0).toFixed(1);
  const calculatedLevel = profile?.level || 1;

  // Gerçek arkadaş listesini çek
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
console.log("DEBUG - Profil İstatistikleri:", profile?.stats);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <Navbar profile={profile} notificationCount={requests.length} />

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mt-8">
          {/* SOL PANEL (HER ZAMAN GÖRÜNÜR) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl rounded-[3rem] p-10 flex flex-col items-center border border-slate-200 dark:border-slate-800/50 shadow-xl">
              <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-black mb-6 border-4 border-white dark:border-slate-800 shadow-xl">
                {username.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">
                @{username}
              </h2>
              <span className="bg-[#facc15] text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                LVL {calculatedLevel}
              </span>
            </div>

            {/* Sosyal Etkileşim Paneli (Sol Altta Sabit) */}
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
                      className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center"
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
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* SAĞ PANEL (DİNAMİK DEĞİŞEN KISIM) */}
          <div className="space-y-6">
            {activeTab === "stats" ? (
              // İSTATİSTİKLER SEKMESİ
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
                {/* Mevcut Seri Kartı - value kısmını değiştirdik */}
<StatCard
  label="Mevcut Seri"
  value={currentStreak} // "0" yerine bunu yazdık
  icon="🔥"
  color="text-orange-500"
/>

{/* En İyi Seri Kartı - value kısmını değiştirdik */}
<StatCard
  label="En İyi Seri"
  value={bestStreak} // "0" yerine bunu yazdık
  icon="📈"
  color="text-indigo-500"
/>
              </div>
            ) : (
              // ARKADAŞ LİSTESİ SEKMESİ
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
                      Henüz hiç arkadaşın yok. Yeni birilerini aramaya ne
                      dersin?
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
