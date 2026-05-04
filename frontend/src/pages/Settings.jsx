import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // BACKEND HAZIR OLANA KADAR KULLANACAĞIMIZ GEÇİCİ STATE'LER
  // İleride bunları useEffect ile backend'den çekeceğiz
  const [formData, setFormData] = useState({
    name: user?.name || 'Emirhan Demirhan',
    email: user?.email || 'emirhan@example.com',
    title: 'Full-Stack Developer',
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    soundEnabled: true,
    notificationsEnabled: true,
    tickSoundEnabled: false,
  });

  // İnput değişikliklerini yakalama
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Sahte kaydetme efekti (Backend'i yazınca burayı güncelleyeceğiz)
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Başarılı toast mesajı eklenebilir
    }, 1500);
  };

  // Menü Sekmeleri
  const tabs = [
    { id: 'profile', icon: '👤', label: 'Profil Ayarları' },
    { id: 'timer', icon: '⏱️', label: 'Çalışma & Pomodoro' },
    { id: 'notifications', icon: '🔔', label: 'Bildirimler ve Ses' },
    { id: 'account', icon: '🔒', label: 'Hesap Güvenliği' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans">
      {/* Üst Başlık */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => window.history.back()} 
          className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
          <p className="text-sm text-slate-400">Deneyiminizi ve çalışma alışkanlıklarınızı kişiselleştirin.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SOL MENÜ (Sekmeler) */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-4 shadow-xl flex lg:flex-col gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-indigo-500/20 text-indigo-400 font-medium border border-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SAĞ İÇERİK ALANI */}
        <div className="flex-1">
          <div className="bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl min-h-[500px] flex flex-col">
            
            {/* 1. PROFİL AYARLARI */}
            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-slate-200">Profil Ayarları</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                    {formData.name.charAt(0)}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors mb-2">
                      Fotoğrafı Değiştir
                    </button>
                    <p className="text-xs text-slate-500">Önerilen boyut: 256x256px, Maksimum: 2MB</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Görünen Ad</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">E-posta Adresi</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">E-posta adresi şu an için değiştirilemez.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Unvan / Bio</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Örn: YKS Öğrencisi, Yazılımcı..."
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. ÇALIŞMA (POMODORO) AYARLARI */}
            {activeTab === 'timer' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-slate-200">Çalışma ve Mola Süreleri</h2>
                <p className="text-sm text-slate-400 mb-8">Kendi ritminize uygun çalışma sürelerini belirleyin. Değişiklikler bir sonraki oturumda aktif olur.</p>

                <div className="space-y-8">
                  {/* Odak Süresi Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-slate-300">Odaklanma Süresi</label>
                      <span className="text-indigo-400 font-bold">{formData.focusTime} dk</span>
                    </div>
                    <input 
                      type="range" 
                      name="focusTime"
                      min="15" max="60" step="5"
                      value={formData.focusTime}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>15 dk</span>
                      <span>60 dk</span>
                    </div>
                  </div>

                  {/* Kısa Mola Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-slate-300">Kısa Mola</label>
                      <span className="text-emerald-400 font-bold">{formData.shortBreak} dk</span>
                    </div>
                    <input 
                      type="range" 
                      name="shortBreak"
                      min="3" max="15" step="1"
                      value={formData.shortBreak}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>3 dk</span>
                      <span>15 dk</span>
                    </div>
                  </div>

                  {/* Uzun Mola Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-slate-300">Uzun Mola</label>
                      <span className="text-blue-400 font-bold">{formData.longBreak} dk</span>
                    </div>
                    <input 
                      type="range" 
                      name="longBreak"
                      min="10" max="30" step="5"
                      value={formData.longBreak}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>10 dk</span>
                      <span>30 dk</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BİLDİRİM VE SES AYARLARI */}
            {activeTab === 'notifications' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-slate-200">Bildirimler ve Ses</h2>
                
                <div className="space-y-4">
                  {/* Toggle Component 1 */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-slate-200">Alarm Sesi</p>
                      <p className="text-xs text-slate-400 mt-0.5">Süre bittiğinde uyarı sesi çal.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="soundEnabled" checked={formData.soundEnabled} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>

                  {/* Toggle Component 2 */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-slate-200">Masaüstü Bildirimleri</p>
                      <p className="text-xs text-slate-400 mt-0.5">Tarayıcı üzerinden görsel bildirim gönder.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="notificationsEnabled" checked={formData.notificationsEnabled} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>

                  {/* Toggle Component 3 */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-slate-200">Tık-Tık Sesi (Saat Sesi)</p>
                      <p className="text-xs text-slate-400 mt-0.5">Odaklanma sırasında arka planda saat sesi çal.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="tickSoundEnabled" checked={formData.tickSoundEnabled} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. HESAP GÜVENLİĞİ */}
            {activeTab === 'account' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-slate-200">Hesap Güvenliği</h2>
                
                <div className="space-y-4">
                  <button className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium transition-colors">
                    Şifre Değiştir
                  </button>
                  
                  <div className="pt-8 mt-8 border-t border-slate-800">
                    <h3 className="text-red-400 font-bold mb-2">Tehlikeli Bölge</h3>
                    <p className="text-xs text-slate-500 mb-4">Hesabınızı silmek geri alınamaz bir işlemdir. Tüm pomodoro verileriniz, başarımlarınız ve istatistikleriniz kalıcı olarak yok olur.</p>
                    <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-colors">
                      Hesabımı Kalıcı Olarak Sil
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* KAYDET BUTONU (Tüm sekmelerin altında sabit) */}
            <div className="mt-auto pt-8 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  'Değişiklikleri Kaydet'
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;