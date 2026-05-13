import { useState, useEffect } from "react";
import { BlockService } from "../services/api.services"; // Yolunu kendi projene göre ayarla

export default function BlockedUsersTab() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await BlockService.getBlockedList();
      // Backend'den gelen listeyi state'e atıyoruz (Axios genellikle response.data içinde döner)
      setBlockedUsers(response.data || []); 
    } catch (error) {
      console.error("Engellenenler listesi çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await BlockService.unblock(userId);
      // Backend'e sil dedikten sonra sayfayı yenilemeden ekrandan da uçuruyoruz
      setBlockedUsers((prev) => prev.filter((user) => user.userId !== userId));
    } catch (error) {
      console.error("Engel kaldırılamadı:", error);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-slate-500">Liste yükleniyor...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in">
      <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
        <span>🚫</span> Engellenen Kullanıcılar
      </h2>
      
      {blockedUsers.length === 0 ? (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">Kara listen tertemiz. Kimseyi engellememişsin!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blockedUsers.map((user) => (
            <div 
              key={user.userId} 
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-all"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={user.avatar || "/default-avatar.png"} 
                  alt={user.username} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{user.username}</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user.title || "Üye"}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleUnblock(user.userId)}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-500/10 dark:hover:bg-rose-500 dark:text-rose-400 dark:hover:text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-sm"
              >
                Engeli Kaldır
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}