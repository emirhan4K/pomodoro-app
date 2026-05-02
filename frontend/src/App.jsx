import React, { useState, useEffect, useCallback } from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import api from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAppData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      setProfile(null);
      return;
    }

    try {
      const [profRes, notifRes] = await Promise.all([
        api.get('/profile/me'),
        api.get('/friendships/requests/pending').catch(() => ({ data: [] }))
      ]);

      setProfile(profRes.data);
      setNotifications(notifRes.data || []);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      if (err.response?.status === 401) {
        setProfile(null);
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // --- TEMA KONTROLÜ (A'DAN Z'YE PERSISTENCE) ---
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    refreshAppData();
  }, [refreshAppData]);

  if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-black text-white">YÜKLENİYOR...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={profile ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={refreshAppData} />} />
        <Route path="/register" element={profile ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={profile ? <Dashboard profile={profile} onComplete={refreshAppData} notificationCount={notifications.length} /> : <Navigate to="/" />} />
        <Route path="/profile" element={profile ? <Profile profile={profile} requests={notifications} refresh={refreshAppData} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;