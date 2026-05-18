import React, { useState } from "react";
import { RoomService } from "../services/api.services";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

const RoomCard = ({ room, onJoinSuccess, onDeleteSuccess, currentUser }) => {
  const authContext = useAuth() || {};
  const contextUser = authContext.profile || authContext.user;

  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  if (!room || (!room.id && !room._id)) return null;

  const members = room.members || [];
  const roomId = room.id || room._id;
  const activeUser = contextUser || currentUser;
  const currentUserId = activeUser?.id || activeUser?._id;
  const isMember = members.some(
    (m) => String(m._id || m) === String(currentUserId),
  );
  const isOwner = Boolean(
    currentUserId &&
    room.owner &&
    String(currentUserId) === String(room.owner._id || room.owner),
  );
  const isFull = members.length >= (room.capacity || 10);

  const bannerUrl =
    room.roomBanner === "default-room-banner.png"
      ? "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=500&auto=format&fit=crop"
      : room.roomBanner.startsWith("http")
        ? room.roomBanner
        : `https://pomodoro-app-omxg.onrender.com${room.roomBanner}`;

  const avatarUrl =
    room.roomAvatar && room.roomAvatar.startsWith("http")
      ? room.roomAvatar
      : room.roomAvatar?.startsWith("/")
        ? `https://pomodoro-app-omxg.onrender.com${room.roomAvatar}`
        : room.roomAvatar;

  const handleJoin = async () => {
    if (isMember || isOwner) {
      navigate(`/room/${room.slug}`);
      return;
    }

    if (room.isPrivate && !showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    try {
      setIsJoining(true);
      setError("");
      await RoomService.joinRoom(roomId, password);
      if (onJoinSuccess) onJoinSuccess();
      navigate(`/room/${room.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || "Giriş başarısız!");
      setIsJoining(false);
    }
  };

  // Çöp kutusuna tıklayınca tarayıcı uyarısı yerine Modalı açar
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  // Modal'ın içindeki kırmızı SİL butonuna basılınca çalışacak asıl kod
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await RoomService.deleteRoom(roomId);
      setIsDeleting(false);
      setShowDeleteModal(false); // İşlem bitince modalı kapat
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      console.error(err);
      alert("Oda silinemedi!");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {/* YENİ ŞIK SİLME MODALIMIZ */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <div className="group relative bg-[#161b22] rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:-translate-y-1 flex flex-col h-full">
        <div className="h-24 w-full relative overflow-hidden shrink-0">
          <img
            src={bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-80"></div>

          {/* MİNİK SİLME BUTONU (Sadece Owner Görebilir) */}
          {isOwner && (
            <div className="absolute top-2 left-2 z-20">
              <button
                onClick={handleDeleteClick}
                title="Odayı Sil"
                className="p-1.5 bg-black/50 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg backdrop-blur-md border border-rose-500/30 transition-all shadow-xl"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-2">
            {room.isPrivate && (
              <div
                className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-orange-500/20 text-orange-400 shadow-xl"
                title="Şifreli Oda"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-14 left-4 z-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 border-4 border-[#161b22] flex items-center justify-center shadow-2xl overflow-hidden">
            {room.roomAvatar !== "default-room.png" ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
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
              <div
                className={`w-1.5 h-1.5 rounded-full ${isFull ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`}
              ></div>
              <span className="text-[10px] font-black text-gray-300">
                {members.length}/{room.capacity}
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-xs line-clamp-2 h-8 mb-auto leading-relaxed italic opacity-80">
            {room.description}
          </p>

          <div className="mt-6">
            {showPasswordInput && !isMember && (
              <div className="mb-4 animate-fadeIn relative group/input">
    {/* Parlama efekti arka planı */}
    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20 group-hover/input:opacity-30 transition duration-500"></div>
    
    <input
      type={showPasswordText ? "text" : "password"}
      placeholder="Oda şifresi..."
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="relative w-full bg-[#0f121a]/80 backdrop-blur-sm border border-slate-700 focus:border-indigo-500/50 rounded-2xl py-3.5 pl-6 pr-14 text-sm font-bold text-white outline-none transition-all shadow-inner placeholder:font-medium placeholder:text-slate-500 placeholder:tracking-tighter focus:ring-2 focus:ring-indigo-500/20"
    />

    <button
      type="button"
      onClick={() => setShowPasswordText((v) => !v)}
      tabIndex={-1}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
      aria-label={showPasswordText ? "Şifreyi gizle" : "Şifreyi göster"}
    >
      {showPasswordText ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      )}
    </button>

    {error && (
      <p className="text-rose-400 text-[10px] mt-1.5 ml-2 font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(225,29,72,0.3)]">
        ❌ {error}
      </p>
    )}
  </div>
)}

            <button
              onClick={handleJoin}
              disabled={
                (!isMember && isFull && !showPasswordInput) ||
                isJoining ||
                isDeleting
              }
              className={`w-full py-3 rounded-xl text-[10px] font-black tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                (!isMember && isFull && !showPasswordInput) ||
                isJoining ||
                isDeleting
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : isMember || isOwner
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {isJoining
                ? "KATILINIYOR..."
                : isMember || isOwner
                  ? "ODAYA GİT"
                  : isFull
                    ? "ODA DOLU"
                    : "ODAYA KATIL"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomCard;
