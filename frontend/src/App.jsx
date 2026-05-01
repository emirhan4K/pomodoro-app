import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import api from './services/api';
import Login from './pages/Login'
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
  const [profile, setProfile] = useState(null);

  // Uygulama genelinde profil verisini çekme fonksiyonu
  const refreshProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/profile/me');
        setProfile(response.data);
      } catch (err) {
        console.error("Profil yüklenemedi", err);
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login onLoginSuccess={refreshProfile} />} />
        <Route path="/register" element={<Register />} />
        {/* Sayfalara profile verisini ve yenileme fonksiyonunu gönderiyoruz */}
        <Route path="/dashboard" element={<Dashboard profile={profile} onComplete={refreshProfile} />} />
        <Route path="/profile" element={<Profile profile={profile} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;