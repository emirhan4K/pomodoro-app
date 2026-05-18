import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomService } from '../services/api.services';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';

const Room = ({ profile }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredRooms = rooms.filter((room) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const name = (room.roomName || room.name || "").toLowerCase();
    return name.includes(term);
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await RoomService.getAllRooms();
      
      let safeRooms = [];
      if (Array.isArray(response)) safeRooms = response;
      else if (response && Array.isArray(response.data)) safeRooms = response.data;
      else if (response && response.rooms && Array.isArray(response.rooms)) safeRooms = response.rooms;

      const validRooms = safeRooms.filter(room => room && (room.id || room._id));
      setRooms(validRooms);
    } catch (error) {
      console.error("Odalar yüklenirken hata:", error);
      setRooms([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    // Mobilde p-4, bilgisayarda p-6 yaptık ki kenarlardan rahatlasın
    <div className="min-h-screen bg-[#0b0e14] text-white p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
          <div className="w-full md:w-auto">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-sm font-black uppercase tracking-tighter"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              DASHBOARD
            </button>
            {/* Mobilde text-3xl, bilgisayarda text-4xl */}
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight italic">TOPLULUK ODALARI</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Birlikte odaklan, tecrübe kazan ve seviye atla.</p>
          </div>
          
          {/* Mobilde w-full (tam genişlik), bilgisayarda w-auto */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto justify-center px-6 py-3 md:px-8 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:-translate-y-1 active:scale-95"
          >
            <span className="text-xl">+</span> YENİ ODA KUR
          </button>
        </div>

        <div className="mb-8 md:mb-10">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Oda adına göre ara..."
              className="w-full bg-[#161b22] border border-slate-800 focus:border-indigo-500/60 rounded-2xl py-3.5 pl-12 pr-10 text-sm font-bold text-white placeholder:text-slate-500 outline-none transition-all shadow-inner focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 transition-colors"
                aria-label="Aramayı temizle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room, index) => (
                <RoomCard
                  key={room.id || room._id || index}
                  room={room}
                  currentUser={profile}
                  onJoinSuccess={fetchRooms}
                  onDeleteSuccess={fetchRooms}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[#161b22] border border-gray-800 rounded-3xl">
                <p className="text-gray-500 font-bold italic">
                  {searchTerm.trim()
                    ? `"${searchTerm}" için sonuç bulunamadı.`
                    : "Henüz aktif bir oda bulunamadı."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateRoomModal 
          onClose={() => setIsModalOpen(false)} 
          onRoomCreated={fetchRooms} 
        />
      )}
    </div>
  );
};

export default Room;