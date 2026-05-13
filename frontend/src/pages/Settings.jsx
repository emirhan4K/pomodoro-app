import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import BlockedUsersTab from "../components/BlockedUsersTab"; // Component'i çağırdık

const Settings = ({ refresh }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Ref'ler
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Avatar State'leri
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Banner State'leri
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Yükleme ve Bildirim State'leri
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Ana Ayarlar Form State'i
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    avatar: "",
    banner: "",
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    soundEnabled: true,
    notificationsEnabled: true,
    tickSoundEnabled: false,
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/profile/me");
        const userData = response.data.user || response.data;

        setFormData({
          name: userData?.username || userData?.name || "",
          email: userData?.email || "",
          title: userData?.title || "",
          avatar: userData?.avatar || "",
          banner: userData?.banner || "",
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value) || value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return showMessage("error", "Lütfen geçerli bir resim dosyası seçin.");
    }
    setSelectedAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = null;
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return showMessage("error", "Lütfen geçerli bir resim dosyası seçin.");
    }
    setSelectedBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    e.target.value = null;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (activeTab === "profile") {
        let updatedAvatar = formData.avatar;
        let updatedBanner = formData.banner;

        if (selectedAvatarFile) {
          const avatarData = new FormData();
          avatarData.append("avatar", selectedAvatarFile);
          const response = await api.put("/profile/avatar", avatarData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (response.data.avatar) {
            updatedAvatar = response.data.avatar;
            setFormData((prev) => ({ ...prev, avatar: updatedAvatar }));
          }
          setSelectedAvatarFile(null);
          setAvatarPreview(null);
        }

        if (selectedBannerFile) {
          const bannerData = new FormData();
          bannerData.append("banner", selectedBannerFile);
          const response = await api.put("/profile/banner", bannerData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (response.data.banner) {
            updatedBanner = response.data.banner;
            setFormData((prev) => ({ ...prev, banner: updatedBanner }));
          }
          setSelectedBannerFile(null);
          setBannerPreview(null);
        }

        await api.put("/profile/update-info", {
          name: formData.name,
          title: formData.title,
          avatar: updatedAvatar,
          banner: updatedBanner,
        });

        if (refresh) await refresh();
        showMessage("success", "Profil bilgileriniz başarıyla güncellendi.");
      } else if (activeTab === "timer" || activeTab === "notifications") {
        const settingsData = {
          focusTime: formData.focusTime,
          shortBreak: formData.shortBreak,
          longBreak: formData.longBreak,
          soundEnabled: formData.soundEnabled,
          notificationsEnabled: formData.notificationsEnabled,
          tickSoundEnabled: formData.tickSoundEnabled,
        };
        await api.put("/profile/settings", settingsData);
        if (refresh) await refresh();
        showMessage("success", "Tercihleriniz başarıyla kaydedildi.");
      }
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Kaydedilirken bir hata oluştu!"
      );
    } finally {
      setIsSaving(false);
    }
  };

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
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Şifre güncellenemedi!"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!"
    );
    if (!isConfirmed) return;
    try {
      await api.delete("/profile/account");
      localStorage.removeItem("token");
      navigate("/");
      window.location.reload();
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Hesap silinirken hata oluştu!"
      );
    }
  };

  // İŞTE BURAYA ENGELLENENLER SEKMESİNİ EKLEDİK
  const tabs = [
    { id: "profile", icon: "👤", label: "Profil Ayarları" },
    { id: "timer", icon: "⏱️", label: "Çalışma & Pomodoro" },
    { id: "notifications", icon: "🔔", label: "Bildirimler ve Ses" },
    { id: "account", icon: "🔒", label: "Hesap Güvenliği" },
    { id: "blocked", icon: "🚫", label: "Engellenenler" }, 
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
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans relative overflow-x-hidden">
      {message.text && (
        <div
          className={`fixed top-8 right-8 px-6 py-3 rounded-xl font-medium shadow-2xl z-[9999] animate-fadeIn ${
            message.type === "success"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
              : "bg-red-500/20 text-red-400 border border-red-500/50"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
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
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-4 shadow-xl flex lg:flex-col gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage({ type: "", text: "" });
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

          <div className="flex-1">
            <div className="bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl min-h-[500px] flex flex-col">
              {activeTab === "profile" && (
                <div className="animate-fadeIn">
                  <h2 className="text-xl font-bold mb-6 text-slate-200">
                    Profil Ayarları
                  </h2>

                  {/* KAPAK FOTOĞRAFI BÖLÜMÜ */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest text-[10px]">
                      Kapak Fotoğrafı
                    </label>
                    <div className="relative w-full h-40 md:h-48 rounded-2xl overflow-hidden group border border-slate-700/50 bg-slate-800/30">
                      {bannerPreview ? (
                        <img
                          src={bannerPreview}
                          className="w-full h-full object-cover"
                          alt="Banner Önizleme"
                        />
                      ) : formData.banner &&
                        formData.banner !== "default-banner.png" ? (
                        <img
                          src={
                            formData.banner?.startsWith("http")
                              ? formData.banner
                              : `https://pomodoro-app-omxg.onrender.com/public/uploads/banners/${formData.banner}`
                          }
                          className="w-full h-full object-cover"
                          alt="Banner"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center text-slate-600 italic text-sm">
                          Banner seçilmedi
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        onClick={() => bannerInputRef.current.click()}
                      >
                        <span className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold shadow-xl">
                          Kapağı Değiştir
                        </span>
                      </div>
                      <input
                        type="file"
                        ref={bannerInputRef}
                        onChange={handleBannerChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  </div>

                  {/* AVATAR BÖLÜMÜ */}
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-4 bg-slate-800/20 rounded-2xl border border-slate-700/30">
                    <div className="relative w-24 h-24 rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl group">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Önizleme"
                          className="w-full h-full object-cover"
                        />
                      ) : formData.avatar &&
                        formData.avatar !== "default-avatar.png" ? (
                        <img
                          src={
                            formData.avatar?.startsWith("http")
                              ? formData.avatar
                              : `https://pomodoro-app-omxg.onrender.com/public/uploads/avatars/${formData.avatar}`
                          }
                          alt="Profil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black">
                          {formData.name?.charAt(0)}
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <span className="text-[10px] font-bold">DEĞİŞTİR</span>
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-sm font-bold transition-all mb-2"
                      >
                        Profil Fotoğrafını Seç
                      </button>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        JPG, PNG veya WebP. Max 2MB.
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        className="hidden"
                        accept="image/*"
                      />
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
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">
                        E-posta (Değiştirilemez)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                      />
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
                        placeholder="Örn: Yazılım Geliştirici"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DİĞER SEKMELER */}
              {activeTab === "timer" && (
                <div className="animate-fadeIn">
                  <h2 className="text-xl font-bold mb-6 text-slate-200">
                    Çalışma ve Mola Süreleri
                  </h2>
                  <div className="space-y-8">
                    {["focusTime", "shortBreak", "longBreak"].map((field) => (
                      <div key={field}>
                        <div className="flex justify-between mb-2">
                          <label className="font-medium text-slate-300 capitalize">
                            {field.replace(/([A-Z])/g, " $1")}
                          </label>
                          <span className="text-indigo-400 font-bold">
                            {formData[field]} dk
                          </span>
                        </div>
                        <input
                          type="range"
                          name={field}
                          min={field === "focusTime" ? "15" : "3"}
                          max={field === "focusTime" ? "60" : "30"}
                          step={field === "shortBreak" ? "1" : "5"}
                          value={formData[field]}
                          onChange={handleChange}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="animate-fadeIn">
                  <h2 className="text-xl font-bold mb-6 text-slate-200">
                    Bildirimler ve Ses
                  </h2>
                  <div className="space-y-4">
                    {[
                      { id: "soundEnabled", label: "Uygulama Sesleri" },
                      { id: "notificationsEnabled", label: "Bildirimler" },
                      { id: "tickSoundEnabled", label: "Saat Tik Sesi" },
                    ].map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl"
                      >
                        <span className="font-medium text-slate-200">
                          {field.label}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name={field.id}
                            checked={formData[field.id]}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="animate-fadeIn">
                  <h2 className="text-xl font-bold mb-6 text-slate-200">
                    Şifre Değiştirme
                  </h2>
                  <div className="space-y-4 mb-8">
                    {[
                      { id: "oldPassword", label: "Eski Şifre" },
                      { id: "newPassword", label: "Yeni Şifre" },
                      { id: "confirmPassword", label: "Yeni Şifre (Tekrar)" },
                    ].map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                          {field.label}
                        </label>
                        <input
                          type="password"
                          name={field.id}
                          value={passwords[field.id] || ""}
                          onChange={handlePasswordChange}
                          className="w-full md:w-2/3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    ))}

                    <button
                      onClick={submitPasswordChange}
                      disabled={
                        !passwords.oldPassword ||
                        !passwords.newPassword ||
                        !passwords.confirmPassword ||
                        isSaving
                      }
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                      {isSaving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                    </button>
                  </div>

                  <div className="pt-8 mt-8 border-t border-slate-800">
                    <h3 className="text-red-400 font-bold mb-2">
                      Tehlikeli Bölge
                    </h3>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-all"
                    >
                      Hesabımı Kalıcı Olarak Sil
                    </button>
                  </div>
                </div>
              )}

              {/* İŞTE BURAYA BİZİM COMPONENTİ KOYDUK */}
              {activeTab === "blocked" && (
                <div className="animate-fadeIn h-full">
                  <BlockedUsersTab />
                </div>
              )}

              {/* SAVE BUTONU BURADA SAKLANDI */}
              {activeTab !== "account" && activeTab !== "blocked" && (
                <div className="mt-auto pt-8 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;