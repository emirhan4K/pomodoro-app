import React, { useState } from 'react';
import { RoomService } from '../services/api.services';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room, onJoinSuccess, onDeleteSuccess, currentUser }) => {
  if (!room || (!room.id && !room._id)) return null;

  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const members = room.members || [];
  const isFull = members.length >= (room.capacity || 10);
  const roomId = room.id || room._id;

const ownerId = room.owner?._id || room.owner?.id || room.owner;
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = currentUserId && ownerId && (currentUserId.toString() === ownerId.toString());
  const bannerUrl = room.roomBanner === "default-room-banner.png" 
    ? "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=500&auto=format&fit=crop" 
    : (room.roomBanner.startsWith('/') ? `http://localhost:3000${room.roomBanner}` : room.roomBanner);

  const avatarUrl = room.roomAvatar && room.roomAvatar.startsWith('/') 
    ? `http://localhost:3000${room.roomAvatar}` 
    : room.roomAvatar;

  const handleJoin = async () => {
    if (room.isPrivate && !showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }
    try {
      setIsJoining(true);
      setError('');

      await RoomService.joinRoom(roomId, password); 
      if (onJoinSuccess) onJoinSuccess();

      navigate(`/room/${room.slug}`); 
    } catch (err) {
      setError(err.response?.data?.message || "Giriş başarısız!");
      setIsJoining(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Bu odayı kalıcı olarak silmek istediğine emin misin?")) {
      try {
        setIsDeleting(true);
        await RoomService.deleteRoom(roomId);
        if (onDeleteSuccess) onDeleteSuccess();
      } catch (err) {
        console.error(err);
        alert("Oda silinemedi!");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="group relative bg-[#161b22] rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:-translate-y-1 flex flex-col h-full">
      <div className="h-24 w-full relative overflow-hidden shrink-0">
        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-80"></div>
        
        {/* MİNİK SİLME BUTONU (Sadece Owner Görebilir) */}
        {isOwner && (
          <div className="absolute top-2 left-2 z-20">
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              title="Odayı Sil"
              className="p-1.5 bg-black/50 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg backdrop-blur-md border border-rose-500/30 transition-all shadow-xl disabled:opacity-50"
            >
              {isDeleting ? (
                 <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          {room.isPrivate && (
            <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-orange-500/20 text-orange-400 shadow-xl" title="Şifreli Oda">
               <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-14 left-4 z-10">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 border-4 border-[#161b22] flex items-center justify-center shadow-2xl overflow-hidden">
          {/* ORİJİNAL KONTROLÜN */}
          {room.roomAvatar !== "default-room.png" ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-black text-white drop-shadow-md">
                {room.roomName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="pt-8 px-5 pb-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-bold text-white truncate max-w-[140px] group-hover:text-indigo-400 transition-colors">
            {room.roomName}
          </h3>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900/50 rounded-lg border border-gray-800">
            <div className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
            <span className="text-[10px] font-black text-gray-300">{members.length}/{room.capacity}</span>
          </div>
        </div>

        <p className="text-gray-400 text-xs line-clamp-2 h-8 mb-auto leading-relaxed italic opacity-80">
          {room.description}
        </p>

        <div className="mt-6">
          {showPasswordInput && (
            <div className="mb-4 animate-fadeIn">
              <input 
                type="password" placeholder="Şifre gerekli..." value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none transition-all"
              />
              {error && <p className="text-rose-400 text-[10px] mt-1 ml-1 font-bold">{error}</p>}
            </div>
          )}

          <button 
            onClick={handleJoin}
            disabled={(isFull && !showPasswordInput) || isJoining || isDeleting}
            className={`w-full py-3 rounded-xl text-[10px] font-black tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
              (isFull && !showPasswordInput) || isJoining || isDeleting
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/20 active:scale-95'
            }`}
          >
            {isJoining ? 'KATILINIYOR...' : isFull && !showPasswordInput ? 'ODA DOLU' : 'ODAYA KATIL'}
            {!isJoining && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;