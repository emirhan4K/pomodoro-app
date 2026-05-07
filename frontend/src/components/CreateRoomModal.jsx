import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateRoomModal = ({ onClose, onRoomCreated }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roomName: '',
    description: '',
    capacity: 10,
    isPrivate: false,
    roomPassword: ''
  });
  
  // Dosyalar için ayrı state
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Çift tıklama koruması

    if (!formData.roomName.trim() || !formData.description.trim()) {
      alert("Oda adı ve açıklama boş bırakılamaz!");
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      
      submitData.append('roomName', formData.roomName);
      submitData.append('description', formData.description);
      submitData.append('capacity', formData.capacity);
      submitData.append('isPrivate', formData.isPrivate); 
      
      if (formData.isPrivate && formData.roomPassword) {
        submitData.append('roomPassword', formData.roomPassword);
      }

      if (avatarFile) submitData.append('avatar', avatarFile);
      if (bannerFile) submitData.append('banner', bannerFile);

      const response = await api.post('/rooms', submitData);

      // İŞTE YENİ SİSTEM: Backend'den artık 'slug' (isim tabanlı link) geliyor!
      const newRoomSlug = response.data?.slug;
      
      if (onRoomCreated) onRoomCreated();
      onClose();
      
      // Sayfayı ID'ye değil, tertemiz SLUG linkine yönlendiriyoruz
      if (newRoomSlug) navigate(`/room/${newRoomSlug}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Oluşturulamadı!";
      alert("HATA: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-gray-800 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-[#1c2128]">
          <h2 className="text-2xl font-black text-white italic tracking-tight">✨ YENİ ODA KUR</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-rose-500 transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Avatar ve Banner Seçimi (Tasarımı bozmadan dosya seçimine çevrildi) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group cursor-pointer h-20 bg-[#0d1117] rounded-2xl border-2 border-dashed border-gray-700 hover:border-indigo-500 flex items-center justify-center overflow-hidden transition-colors">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="text-center">
                <span className="text-xl mb-1 block">{avatarFile ? "✅" : "📸"}</span>
                <span className="text-[10px] font-black text-gray-500 uppercase">
                  {avatarFile ? avatarFile.name.substring(0,10)+"..." : "Avatar Seç"}
                </span>
              </div>
            </div>

            <div className="relative group cursor-pointer h-20 bg-[#0d1117] rounded-2xl border-2 border-dashed border-gray-700 hover:border-indigo-500 flex items-center justify-center overflow-hidden transition-colors">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="text-center">
                <span className="text-xl mb-1 block">{bannerFile ? "✅" : "🖼️"}</span>
                <span className="text-[10px] font-black text-gray-500 uppercase">
                  {bannerFile ? bannerFile.name.substring(0,10)+"..." : "Banner Seç"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <input 
              type="text" name="roomName" placeholder="Oda İsmi" required
              value={formData.roomName} onChange={handleInputChange}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-white focus:border-indigo-500 outline-none"
            />
            <textarea 
              name="description" placeholder="Açıklama" required rows="2"
              value={formData.description} onChange={handleInputChange}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Diğer ayarlar (kapasite vs) buraya aynı şekilde gelir... */}
          <div className="flex items-center justify-between bg-[#0d1117] p-4 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" name="isPrivate" id="isPrivate"
                checked={formData.isPrivate} onChange={handleInputChange}
                className="w-5 h-5"
              />
              <label htmlFor="isPrivate" className="text-sm font-bold text-gray-300">Gizli Oda (Şifreli)</label>
            </div>
            <input 
              type="number" name="capacity" min="2" max="50"
              value={formData.capacity} onChange={handleInputChange}
              className="w-20 bg-[#161b22] border border-gray-700 rounded-lg p-2 text-center text-white"
            />
          </div>

          {formData.isPrivate && (
            <input 
              type="password" name="roomPassword" placeholder="Şifre Belirle" required
              value={formData.roomPassword} onChange={handleInputChange}
              className="w-full bg-[#0d1117] border border-orange-500/50 rounded-xl p-4 text-white focus:border-orange-500 outline-none"
            />
          )}

          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all">
            OLUŞTUR VE GİR
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;