import React, { useState, useEffect, useCallback } from 'react'; // useCallback eklendi
import api from '../services/api';
import Navbar from '../components/Navbar';
import PomodoroTimer from '../components/PomodoroTimer';
import ProfileCard from '../components/ProfileCard';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Veri çekme işlemini dışarı aldık ki istediğimiz zaman çağırabilelim
  const fetchProfileData = useCallback(async () => {
    try {
      const response = await api.get('/profile/me');
      setProfile(response.data); 
    } catch (error) {
      console.error("Profil verileri çekilirken hata:", error);
    } finally {
      setIsLoading(false); 
    }
  }, []);

  // Sayfa ilk açıldığında çalışır
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <Navbar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SİHİR BURADA: Sayaca "Bitirdiğinde bana haber ver (fetchProfileData)" diyoruz */}
          <PomodoroTimer onComplete={fetchProfileData} />

          <div className="space-y-8">
            <ProfileCard profile={profile} isLoading={isLoading} />
            
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-lg p-8 text-white">
               <h3 className="font-bold mb-2 text-indigo-100">Günün Sözü</h3>
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