import React, { useEffect, useState } from "react";
import { FollowService } from "../services/api.services";

const FollowModal = ({ isOpen, onClose, type, profileId, title }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !profileId) return;

    const fetchList = async () => {
      setLoading(true);
      try {
        let res;
        // type prop'una göre ("followers" veya "following") doğru servisi çağır
        if (type === "followers") {
          res = await FollowService.getFollowers(profileId);
        } else {
          res = await FollowService.getFollowing(profileId);
        }
        setList(res.data?.data || []);
      } catch (error) {
        console.error(`${title} listesi çekilemedi:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [isOpen, profileId, type, title]);

  if (!isOpen) return null;

  return (
    // Arka plan blur ve overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      
      {/* Modal Kutusu */}
      <div className="bg-white dark:bg-[#1e293b] w-[90%] max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 transform transition-all duration-300 scale-100">
        
        {/* Header Alanı */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors duration-200 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Liste Alanı */}
        <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : list.length === 0 ? (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-10 italic">
              Henüz kimse yok.
            </p>
          ) : (
            <div className="space-y-3">
              {list.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center overflow-hidden border border-indigo-500/20">
                    {user.avatar && user.avatar !== "default-avatar.png" ? (
                      <img
                        src={user.avatar?.startsWith("http") ? user.avatar : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${user.avatar}`}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-black text-indigo-500 uppercase">
                        {user.username?.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* İsim ve Unvan */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      @{user.username}
                    </p>
                    {user.title && (
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user.title}
                      </p>
                    )}
                  </div>
                  
                  {/* Profil Görüntüleme Butonu */}
                  <button 
                    onClick={() => {
                        window.location.href = `/profile/${user.userId}`
                    }}
                    className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg hover:bg-indigo-500 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    Profil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;