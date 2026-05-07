import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomService } from '../services/api.services';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';

// DİKKAT: App.jsx'ten gelen 'profile' verisini buraya ekledik!
const Room = ({ profile }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#0b0e14] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-sm font-black uppercase tracking-tighter"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              DASHBOARD
            </button>
            <h1 className="text-4xl font-black text-white tracking-tight italic">TOPLULUK ODALARI</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Birlikte odaklan, tecrübe kazan ve seviye atla.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:-translate-y-1 active:scale-95"
          >
            <span className="text-xl">+</span> YENİ ODA KUR
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {rooms.length > 0 ? (
              rooms.map((room, index) => (
                <RoomCard 
                  key={room.id || room._id || index} 
                  room={room} 
                  currentUser={profile}        // 1. DÜZELTME: Silme butonunun görünmesi için eklendi
                  onJoinSuccess={fetchRooms} 
                  onDeleteSuccess={fetchRooms} // 2. DÜZELTME: F5 atmadan anında silinmesi için eklendi!
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[#161b22] border border-gray-800 rounded-3xl">
                <p className="text-gray-500 font-bold italic">Henüz aktif bir oda bulunamadı.</p>
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