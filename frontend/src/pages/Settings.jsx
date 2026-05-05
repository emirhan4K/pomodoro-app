import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Settings = ({ refresh }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Yükleme ve Bildirim State'leri
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" }); // type: 'success' | 'error'

  // Ana Ayarlar Form State'i
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    soundEnabled: true,
    notificationsEnabled: true,
    tickSoundEnabled: false,
  });

  // Şifre Değiştirme State'i
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/profile/me");

        // Backend'in veriyi nasıl döndüğünü bilmediğimiz için akıllı bir yakalama yapıyoruz.
        // Eğer "user" objesi varsa onu al, yoksa direkt gelen datanın kendisini kullan.
        const userData = response.data.user || response.data;

        setFormData({
          name: userData?.username || userData?.name || "",
          email: userData?.email || "",
          title: userData?.title || "",
          focusTime: userData?.settings?.focusTime ?? 25,
          shortBreak: userData?.settings?.shortBreak ?? 5,
          longBreak: userData?.settings?.longBreak ?? 15,
          soundEnabled: userData?.settings?.soundEnabled ?? true,
          notificationsEnabled:
            userData?.settings?.notificationsEnabled ?? true,
          tickSoundEnabled: userData?.settings?.tickSoundEnabled ?? false,
        });
      } catch (error) {
        console.error("Ayarlar çekilirken hata:", error);
        showMessage("error", "Bilgileriniz yüklenemedi!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // İnput değişikliklerini yakalama
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value) || value, // Sayısal inputları Number yap
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Geçici mesaj gösterme fonksiyonu
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // 2. KAYDET BUTONUNA BASILDIĞINDA (Profil veya Ayarlar)
  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (activeTab === "profile") {
        // Profil Sekmesi İstek
        await api.put("/profile/update-info", {
          name: formData.name,
          title: formData.title,
        });

        if (refresh) refresh();
        showMessage("success", "Profil bilgileriniz başarıyla güncellendi.");
      } else if (activeTab === "timer" || activeTab === "notifications") {
        // Ayarlar Sekmesi İstek
        const settingsData = {
          focusTime: formData.focusTime,
          shortBreak: formData.shortBreak,
          longBreak: formData.longBreak,
          soundEnabled: formData.soundEnabled,
          notificationsEnabled: formData.notificationsEnabled,
          tickSoundEnabled: formData.tickSoundEnabled,
        };
        await api.put("/profile/settings", settingsData);

        if (refresh) refresh(); // YENİ EKLENEN SATIR: React'a verileri güncellemesini söyler
        showMessage("success", "Tercihleriniz başarıyla kaydedildi.");
      }
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Kaydedilirken bir hata oluştu!",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 3. ŞİFRE DEĞİŞTİRME İŞLEMİ
  const submitPasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showMessage("error", "Yeni şifreler birbiriyle eşleşmiyor!");
    }
    if (passwords.newPassword.length < 6) {
      return showMessage("error", "Yeni şifreniz en az 6 karakter olmalıdır.");
    }

    setIsSaving(true);
    try {
      await api.put("/profile/password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      showMessage("success", "Şifreniz başarıyla değiştirildi.");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Formu temizle
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Şifre güncellenemedi!",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 4. HESAP SİLME İŞLEMİ
  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!",
    );
    if (!isConfirmed) return;

    try {
      await api.delete("/profile/account");
      localStorage.removeItem("token"); // Oturumu kapat
      navigate("/"); // Ana sayfaya (Login) at
      window.location.reload(); // Context'i temizlemek için sayfayı yenile
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Hesap silinirken hata oluştu!",
      );
    }
  };

  // Menü Sekmeleri
  const tabs = [
    { id: "profile", icon: "👤", label: "Profil Ayarları" },
    { id: "timer", icon: "⏱️", label: "Çalışma & Pomodoro" },
    { id: "notifications", icon: "🔔", label: "Bildirimler ve Ses" },
    { id: "account", icon: "🔒", label: "Hesap Güvenliği" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-8 flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Ayarlarınız yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans relative">
      {/* Toast Bildirim (Sağ Üst Köşe) */}
      {message.text && (
        <div
          className={`absolute top-8 right-8 px-6 py-3 rounded-xl font-medium shadow-2xl z-50 animate-fadeIn ${
            message.type === "success"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
              : "bg-red-500/20 text-red-400 border border-red-500/50"
          }`}
        >
          {message.text}
        </div>
      )}

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
          <p className="text-sm text-slate-400">
            Deneyiminizi ve çalışma alışkanlıklarınızı kişiselleştirin.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SOL MENÜ (Sekmeler) */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-4 shadow-xl flex lg:flex-col gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage({ type: "", text: "" }); // Sekme değişince mesajları sil
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-indigo-500/20 text-indigo-400 font-medium border border-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
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
            {activeTab === "profile" && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-slate-200">
                  Profil Ayarları
                </h2>

                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg uppercase">
                    {formData.name ? formData.name.charAt(0) : "?"}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors mb-2">
                      Fotoğrafı Değiştir
                    </button>
                    <p className="text-xs text-slate-500">
                      Önerilen boyut: 256x256px, Maksimum: 2MB
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                      Görünen Ad
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                      E-posta adresi güvenlik nedeniyle değiştirilemez.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                      Unvan / Bio
                    </label>
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
            {activeTab === "timer" && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-slate-200">
                  Çalışma ve Mola Süreleri
                </h2>
                <p className="text-sm text-slate-400 mb-8">
                  Kendi ritminize uygun çalışma sürelerini belirleyin.
                  Değişiklikler bir sonraki oturumda aktif olur.
                </p>

                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-slate-300">
                        Odaklanma Süresi
                      </label>
                      <span className="text-indigo-400 font-bold">
                        {formData.focusTime} dk
                      </span>
                    </div>
                    <input
                      type="range"
                      name="focusTime"
                      min="15"
                      max="60"
                      step="5"
                      value={formData.focusTime}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-slate-300">
                        Kısa Mola
                      </label>
                      <span className="text-emerald-400 font-bold">
                        {formData.shortBreak} dk
                      </span>
                    </div>
                    <input
                      type="range"
                      name="shortBreak"
                      min="3"
                      max="15"
                      step="1"
                      value={formData.shortBreak}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-slate-300">
                        Uzun Mola
                      </label>
                      <span className="text-blue-400 font-bold">
                        {formData.longBreak} dk
                      </span>
                    </div>
                    <input
                      type="range"
                      name="longBreak"
                      min="10"
                      max="30"
                      step="5"
                      value={formData.longBreak}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. BİLDİRİM VE SES AYARLARI */}
            {activeTab === "notifications" && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-slate-200">
                  Bildirimler ve Ses
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-slate-200">Alarm Sesi</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Süre bittiğinde uyarı sesi çal.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="soundEnabled"
                        checked={formData.soundEnabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-slate-200">
                        Masaüstü Bildirimleri
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tarayıcı üzerinden görsel bildirim gönder.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notificationsEnabled"
                        checked={formData.notificationsEnabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-slate-200">
                        Tık-Tık Sesi (Saat Sesi)
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Odaklanma sırasında arka planda saat sesi çal.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="tickSoundEnabled"
                        checked={formData.tickSoundEnabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. HESAP GÜVENLİĞİ */}
            {activeTab === "account" && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-slate-200">
                  Şifre Değiştirme
                </h2>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwords.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full md:w-2/3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full md:w-2/3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full md:w-2/3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <button
                    onClick={submitPasswordChange}
                    disabled={
                      !passwords.oldPassword ||
                      !passwords.newPassword ||
                      isSaving
                    }
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 border border-slate-600 rounded-xl text-sm font-medium transition-colors"
                  >
                    Şifreyi Güncelle
                  </button>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-800">
                  <h3 className="text-red-400 font-bold mb-2">
                    Tehlikeli Bölge
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Hesabınızı silmek geri alınamaz bir işlemdir. Tüm pomodoro
                    verileriniz, başarımlarınız ve istatistikleriniz kalıcı
                    olarak yok olur.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-colors"
                  >
                    Hesabımı Kalıcı Olarak Sil
                  </button>
                </div>
              </div>
            )}

            {/* KAYDET BUTONU (Hesap sekmesi hariç her yerde görünür) */}
            {activeTab !== "account" && (
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
                    "Değişiklikleri Kaydet"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
