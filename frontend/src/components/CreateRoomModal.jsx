import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  
  // Önizleme için state'ler
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [showRoomPassword, setShowRoomPassword] = useState(false);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

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
      const newRoomSlug = response.data?.slug;
      
      if (onRoomCreated) onRoomCreated();
      onClose();
      
      if (newRoomSlug) navigate(`/room/${newRoomSlug}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Oda oluşturulurken bir hata oluştu!";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Arka Plan Blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Kartı */}
      <div className="relative bg-[#0f121a] border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Banner Yükleme Alanı (Görsel Önizleme) */}
        <div className="relative h-40 bg-slate-900 border-b border-slate-800 group">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 italic text-sm">Oda Kapak Görseli Seçilmedi</div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black border border-white/20">BANNER DEĞİŞTİR</span>
            <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
          </label>

          {/* Avatar Yükleme Alanı */}
          <div className="absolute -bottom-10 left-8">
            <div className="relative group w-24 h-24 rounded-3xl bg-indigo-600 border-4 border-[#0f121a] shadow-2xl overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black">{formData.roomName?.charAt(0) || '?'}</div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sol Kolon: Bilgiler */}
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Oda İsmi</label>
                <input 
                  type="text" required placeholder="Örn: Gece Tayfı Odak"
                  value={formData.roomName} onChange={(e) => setFormData({...formData, roomName: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Açıklama</label>
                <textarea 
                  required rows="3" placeholder="Bu odada ne üzerine çalışılacak?"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-700"
                ></textarea>
              </div>
            </div>

            {/* Sağ Kolon: Ayarlar */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Kapasite</label>
                  <select 
                    value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none transition-all appearance-none"
                  >
                    {[5, 10, 15, 20, 50].map(num => <option key={num} value={num}>{num} Kişi</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Gizlilik</label>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})}
                    className={`w-full py-4 rounded-2xl text-xs font-black transition-all border ${formData.isPrivate ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'}`}
                  >
                    {formData.isPrivate ? 'ŞİFRELİ' : 'HERKESE AÇIK'}
                  </button>
                </div>
              </div>

              {formData.isPrivate && (
                <div className="animate-slideDown">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Oda Şifresi</label>
                  <div className="relative">
                    <input
                      type={showRoomPassword ? 'text' : 'password'} required={formData.isPrivate} placeholder="Güçlü bir şifre girin"
                      value={formData.roomPassword} onChange={(e) => setFormData({...formData, roomPassword: e.target.value})}
                      className="w-full bg-orange-500/5 border border-orange-500/30 rounded-2xl pl-5 pr-12 py-4 text-sm focus:border-orange-500 outline-none transition-all placeholder:text-orange-900/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRoomPassword((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500/70 hover:text-orange-500 transition-colors"
                      aria-label={showRoomPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showRoomPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                 <p className="text-[10px] text-slate-500 leading-relaxed italic bg-slate-900/80 p-4 rounded-2xl border border-slate-800/50">
                  * Oda kurduğunda otomatik olarak odaya yönlendirilirsin ve yönetici yetkisine sahip olursun.
                 </p>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex items-center gap-4 mt-10">
            <button 
              type="button" onClick={onClose}
              className="px-8 py-4 text-sm font-black text-slate-500 hover:text-white transition-colors"
            >
              İPTAL
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-5 rounded-2xl font-black tracking-widest text-sm shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>ODAYI OLUŞTUR VE BAŞLA <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;