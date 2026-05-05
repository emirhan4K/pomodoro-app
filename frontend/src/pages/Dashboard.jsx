import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { usePomodoro } from '../context/PomodoroContext';

// --- STATİK (MOCK) ODA VERİLERİ ---
const mockRooms = [
  {
    id: 1,
    name: "Hollanda Yolcuları",
    description: "React ve Node.js ile portfolyo kasıyoruz. Sessiz çalışma.",
    category: "Programlama",
    level: 12,
    isPrivate: true,
    users: 4,
    capacity: 10,
    audio: "Sessiz",
    theme: "purple",
    avatar: "H",
    hasImage: false
  },
  {
    id: 2,
    name: "YKS 2027 Hedef İlk 10K",
    description: "Beraber çalışalım, sorusu olan chat'e yazsın.",
    category: "Sınav Hazırlığı",
    level: 5,
    isPrivate: false,
    users: 12,
    capacity: 20,
    audio: "Sesli",
    theme: "emerald",
    avatar: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=150",
    hasImage: true
  },
  {
    id: 3,
    name: "Gece Yargıçları",
    description: "Sabaha kadar kod yazıp kahve içenler buraya!",
    category: "Yazılım",
    level: 8,
    isPrivate: false,
    users: 8,
    capacity: 15,
    audio: "Sessiz",
    theme: "teal",
    avatar: "G",
    hasImage: false
  }
];

const Dashboard = ({ profile, notificationCount }) => {
  const { 
    timeLeft, isActive, selectedMinutes, 
    toggleTimer, handleReset, handleDurationSelect 
  } = usePomodoro();

  const navigate = useNavigate();

  // --- YENİ ODA KURMA STATE'LERİ ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomName: '',
    description: '',
    capacity: 10,
    isPrivate: false,
    roomPassword: ''
  });

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * circumference;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const durations = [1, 30, 45, 60, 90];

  const getThemeClasses = (theme) => {
    switch(theme) {
      case 'purple': return 'bg-violet-600 hover:bg-violet-700 text-white';
      case 'emerald': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'teal': return 'bg-teal-500 hover:bg-teal-600 text-white';
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  const getTagClasses = (category) => {
    switch(category) {
      case 'Programlama': return 'text-violet-600 dark:text-violet-400 border-violet-500/30 bg-violet-500/10';
      case 'Sınav Hazırlığı': return 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData }; 
      payload.capacity = Number(payload.capacity);
      if (payload.isPrivate === false) {
        delete payload.roomPassword; 
      }

      const response = await api.post('/rooms', payload);
      const resData = response.data;
      
      let newRoomId = 
        resData?.id || resData?._id || 
        resData?.room?.id || resData?.room?._id || 
        resData?.newRoom?.id || resData?.newRoom?._id ||
        resData?.data?.id || resData?.data?._id;

      if (!newRoomId) {
          const stringified = JSON.stringify(resData);
          const match = stringified.match(/:"([a-f\d]{24})"/i);
          if (match) newRoomId = match[1];
      }
      
      setIsCreateModalOpen(false);

      if (newRoomId) {
        navigate(`/room/${newRoomId}`);
      } else {
        alert("Oda kuruldu ancak ID bulunamadı.");
      }
    } catch (error) {
      console.error("Oda oluşturma hatası:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Bir hata oluştu!";
      alert(`HATA: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f111a] text-slate-800 dark:text-white transition-colors duration-500 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <Navbar profile={profile} notificationCount={notificationCount} />

        {/* POMODORO SAYACI */}
        <div className="flex flex-col items-center justify-center mt-12 mb-20">
          
          <div className="flex items-center gap-1 sm:gap-2 mb-10 p-1.5 bg-white/50 dark:bg-[#151925]/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
            {durations.map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationSelect(mins)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 ${
                  selectedMinutes === mins
                    ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {mins} dk
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-center group">
            <svg className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] transform -rotate-90 drop-shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              <circle
                cx="50%" cy="50%" r={radius}
                className="stroke-slate-200 dark:stroke-slate-800/50"
                strokeWidth="8" fill="transparent"
              />
              <circle
                cx="50%" cy="50%" r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-1000 ease-linear"
                strokeWidth="8" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-6xl sm:text-7xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-md">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] mt-3">Odaklanma Vakti</p>
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button 
              onClick={toggleTimer}
              className={`px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all duration-300 ${
                isActive 
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' 
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-1'
              }`}
            >
              {isActive ? 'DURAKLAT' : 'BAŞLAT'}
            </button>
            <button 
              onClick={handleReset}
              className="px-10 py-4 bg-slate-200 dark:bg-[#1a1d2d] text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-300 dark:hover:bg-[#232738] transition-all duration-300 border border-transparent dark:border-slate-800/50"
            >
              SIFIRLA
            </button>
          </div>
        </div>

        {/* ÇALIŞMA ODALARI LİSTESİ */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800/60">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Çalışma Odaları</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Birlikte odaklan, tecrübe puanı (XP) kazan ve seviye atla.</p>
            </div>
            
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white dark:bg-[#1a1d2d] text-slate-700 dark:text-white text-sm rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#232738] transition-colors border border-slate-200 dark:border-slate-700/50 shadow-sm">
                Filtrele
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2"
              >
                <span>+</span> Yeni Oda Kur
              </button>
            </div>
          </div>

          {/* Kartlar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockRooms.map((room) => (
              <div key={room.id} className="bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col hover:border-indigo-500 dark:hover:border-slate-700 transition-all duration-300 shadow-sm dark:shadow-none">
                
                {/* Kart Üst Badge'leri */}
                <div className="flex justify-between items-center mb-6">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e2335] flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></div> Lv.{room.level}
                    </span>
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border flex items-center gap-1 ${room.isPrivate ? 'border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10' : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'}`}>
                      {room.isPrivate ? (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Şifreli</>
                      ) : (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Açık</>
                      )}
                    </span>
                  </div>
                </div>

                {/* Avatar & İsim */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-[72px] h-[72px] rounded-2xl mb-4 overflow-hidden flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
                    {room.hasImage ? (
                      <img src={room.avatar} alt={room.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-white">{room.avatar}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">{room.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2 px-2 line-clamp-2 min-h-[32px]">{room.description}</p>
                  
                  <div className="mt-4 mb-5">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded border ${getTagClasses(room.category)}`}>
                      {room.category}
                    </span>
                  </div>
                </div>

                {/* Alt İstatistikler */}
                <div className="flex justify-center gap-2 mb-5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-[#1a1d2d] border border-slate-100 dark:border-transparent rounded text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                    {room.users} kişi
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-[#1a1d2d] border border-slate-100 dark:border-transparent rounded text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeDasharray="2 2"/></svg>
                    {room.audio}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/room/${room.id}`)}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${getThemeClasses(room.theme)}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  Katıl
                </button>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL: SADECE YENİ ODA KURMA FORMU */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#0f111a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">✨ Yeni Oda Kur</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreateRoom} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Oda Adı <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" name="roomName" value={formData.roomName} onChange={handleInputChange}
                    placeholder="Örn: Hafta Sonu Kampa Giriş" 
                    className="w-full bg-slate-50 dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-transparent dark:focus:border-indigo-500 transition-colors text-sm"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Açıklama <span className="text-rose-500">*</span></label>
                  <textarea 
                    name="description" value={formData.description} onChange={handleInputChange}
                    placeholder="Odanın amacını kısaca anlat..." rows="2"
                    className="w-full bg-slate-50 dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-transparent dark:focus:border-indigo-500 transition-colors text-sm resize-none"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kapasite</label>
                  <input 
                    type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} min="2" max="50"
                    className="w-full bg-slate-50 dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-transparent dark:focus:border-indigo-500 transition-colors text-sm" 
                  />
                </div>

                <div className="bg-slate-50 dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" name="isPrivate" checked={formData.isPrivate} onChange={handleInputChange} className="sr-only" />
                      <div className={`block w-12 h-7 rounded-full transition-colors ${formData.isPrivate ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.isPrivate ? 'transform translate-x-5' : ''}`}></div>
                    </div>
                    <div>
                      <div className="text-slate-800 dark:text-white font-medium text-sm">Gizli Oda (Şifreli)</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Sadece şifreyi bilenler katılabilir</div>
                    </div>
                  </label>

                  {formData.isPrivate && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 animate-fadeIn">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Oda Şifresi <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" name="roomPassword" value={formData.roomPassword} onChange={handleInputChange}
                        placeholder="Güçlü bir şifre belirle" 
                        className="w-full bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-transparent dark:focus:border-indigo-500 transition-colors text-sm"
                        required={formData.isPrivate} 
                      />
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">
                    Odayı Oluştur ve Katıl
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;