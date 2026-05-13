import React, { useState, useEffect } from 'react';
import { TaskService } from '../services/api.services';

const CreateTaskModal = ({ onClose, onSuccess, editTask }) => {
  const [formData, setFormData] = useState({ title: '', difficulty: 'medium' });
  const [isSaving, setIsSaving] = useState(false);

  // Eğer modal "Düzenle" butonundan açıldıysa formun içini mevcut verilerle doldur
  useEffect(() => {
    if (editTask) {
      setFormData({ title: editTask.title, difficulty: editTask.difficulty });
    }
  }, [editTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      if (editTask) {
        // Düzenleme modu
        await TaskService.updateTask(editTask._id, formData);
      } else {
        // Yeni görev modu
        await TaskService.createTask(formData);
      }
      onSuccess(); // Sayfadaki listeyi yenilemek için tetikle
      onClose();   // Modalı kapat
    } catch (error) {
      console.error("İşlem başarısız:", error);
      alert("Görev kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Arka plan karartması (Tıklayınca kapanır) */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Kutusu */}
      <div className="relative w-full max-w-md bg-[#161b22] border border-gray-800 rounded-3xl p-8 shadow-2xl animate-fade-in">
        <h2 className="text-2xl font-black italic mb-6 uppercase text-white">
          {editTask ? 'GÖREVİ DÜZENLE 📝' : 'YENİ GÖREV KUR 🎯'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Görev Başlığı Input */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">
              GÖREV BAŞLIĞI
            </label>
            <input 
              type="text" 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Neye odaklanacaksın?"
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 shadow-inner"
            />
          </div>

          {/* Zorluk Seçimi Select */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">
              ZORLUK DERECESİ
            </label>
            <select 
              value={formData.difficulty}
              onChange={e => setFormData({...formData, difficulty: e.target.value})}
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-inner appearance-none"
            >
              <option value="easy">KOLAY (20 XP)</option>
              <option value="medium">ORTA (50 XP)</option>
              <option value="hard">ZOR (100 XP)</option>
            </select>
          </div>

          {/* Butonlar */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              İPTAL
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 uppercase text-xs tracking-widest active:scale-95"
            >
              {isSaving ? 'KAYDEDİLİYOR...' : (editTask ? 'GÜNCELLEMEYİ KAYDET' : 'GÖREVİ BAŞLAT')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;