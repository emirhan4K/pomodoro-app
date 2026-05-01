import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PomodoroTimer from '../components/PomodoroTimer';
import ProfileCard from '../components/ProfileCard';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    try {
      const response = await api.get('/profile/me');
      setProfile(response.data); 
    } catch (error) {
      console.error("Profil çekilirken hata:", error);
    } finally {
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return (
    // BÜTÜN SAYFANIN ARKA PLANI BURADA DEĞİŞİYOR (bg-slate-50 -> bg-slate-950)
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-12 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4">
        
        <Navbar profile={profile} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Taraf: Sayaç */}
          <PomodoroTimer onComplete={fetchProfileData} />

          {/* Sağ Taraf: İstatistikler ve Kaybolan Günün Sözü Kartı */}
          <div className="space-y-8">
            <ProfileCard profile={profile} isLoading={isLoading} />
            
            {/* KAYBOLAN MOTİVASYON KARTI GERİ GELDİ */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 rounded-3xl shadow-lg dark:shadow-indigo-900/20 p-8 text-white transition-colors duration-300">
               <h3 className="font-bold mb-2 text-indigo-100 dark:text-indigo-200">Günün Sözü</h3>
               <p className="font-medium text-lg italic leading-relaxed">
                 "Büyük işler güçle değil, azimle başarılır."
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;