import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api'; // API çağrıları için kendi axios/fetch dosyanı göster
import { useAuth } from '../context/AuthContext';

const Statistics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    focusHours: 0,
    sessionsCount: 0,
    efficiency: 0,
    categoryData: [],
    hourlyData: [],
    recentSessions: []
  });

  const currentStreak = user?.currentStreak || 0;
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const endpoint = timeRange === 'monthly' ? '/pomodoros/monthly-stats' 
                       : timeRange === 'weekly' ? '/pomodoros/weekly-stats' 
                       : '/pomodoros/daily-stats';
                       
        const response = await api.get(endpoint);
        const data = response.data;
        setStats({
          focusHours: timeRange === 'monthly' ? (data.monthlyFocusHours || 0) 
                    : timeRange === 'weekly' ? (data.weekFocusHours || 0) 
                    : (data.todayFocusHours || 0),
                    
          sessionsCount: timeRange === 'monthly' ? (data.monthlyTotalAttempted || 0) 
                       : timeRange === 'weekly' ? (data.weekTotalAttempted || 0) 
                       : (data.todaySessionsCount || 0),
                       
          efficiency: timeRange === 'monthly' ? (data.monthlyEfficiency || 0) 
                    : timeRange === 'weekly' ? (data.weekEfficiency || 0) 
                    : (data.efficiency || 0),
                    
          categoryData: timeRange === 'monthly' ? (data.monthlyCategoryData || []) 
                      : timeRange === 'weekly' ? (data.weekCategoryData || []) 
                      : (data.categoryData || []),
                      
          hourlyData: data.hourlyData || [],
          recentSessions: data.recentSessions || []
        });
      } catch (error) {
        console.error("İstatistikler çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const todayFormatted = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-300 text-xs mb-1">{label}</p>
          <p className="text-indigo-400 font-bold">{payload[0].value} dk odaklanma</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-8 flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Verileriniz analiz ediliyor...</p>
        </div>
      </div>
    );
  }

  const targetSessions = timeRange === 'monthly' ? 120 : timeRange === 'weekly' ? 28 : 4;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans">
      {/* Üst Başlık ve Filtreler */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()} 
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">İstatistikler</h1>
            <p className="text-sm text-slate-400 hidden sm:block">Verimlilik analiziniz ve çalışma raporlarınız.</p>
          </div>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs md:text-sm overflow-x-auto w-full md:w-auto">
          {[
            { id: 'daily', label: 'Günlük' },
            { id: 'weekly', label: 'Haftalık' },
            { id: 'monthly', label: 'Aylık' },
            { id: 'all', label: 'Tüm Zamanlar' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.id === 'daily' || tab.id === 'weekly' || tab.id === 'monthly') setTimeRange(tab.id);
              }}
              className={`px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                timeRange === tab.id 
                  ? 'bg-slate-700 text-white font-medium shadow' 
                  : tab.id === 'all' 
                    ? 'text-slate-400 hover:text-white opacity-50 cursor-not-allowed' 
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex bg-slate-800 rounded-lg overflow-hidden opacity-50 cursor-not-allowed">
          <button className="px-3 py-2 hover:bg-slate-700 border-r border-slate-700">&lt;</button>
          <button className="px-3 py-2 hover:bg-slate-700">&gt;</button>
        </div>
        <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-emerald-400 flex items-center gap-2 shadow-inner">
          📅 Bugün, {todayFormatted}
        </div>
      </div>

      {/* 4'lü Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard 
          icon="🕒" 
          title={timeRange === 'weekly' ? "Haftalık Odak" : "Bugün Odak"} 
          value={stats.focusHours} 
          unit="saat" 
          iconBg="bg-blue-900/50" 
          iconColor="text-blue-400" 
        />
        <StatCard 
          icon="🎯" 
          title={timeRange === 'weekly' ? "Haftalık Oturum" : "Bugünkü Oturum"} 
          value={stats.sessionsCount} 
          unit="adet" 
          iconBg="bg-orange-900/50" 
          iconColor="text-orange-400" 
        />
        <StatCard icon="🔥" title="Seri" value={currentStreak} unit="gün" iconBg="bg-red-900/50" iconColor="text-red-400" />
        <StatCard icon="⚡" title="Verimlilik" value={`%${stats.efficiency}`} unit="skor" iconBg="bg-purple-900/50" iconColor="text-purple-400" />
      </div>

      {/* Grafikler Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Çizgi Grafik (Saatlik Odaklanma) */}
        <div className="lg:col-span-2 bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold mb-6 text-slate-200">Saatlik Odaklanma</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val} dk`} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '5 5' }} />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#1e293b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pasta Grafik (Kategori Dağılımı) */}
        <div className="bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col shadow-xl">
          <h3 className="font-bold mb-2 text-slate-200">{timeRange === 'weekly' ? 'Haftalık Dağılım' : 'Günün Dağılımı'}</h3>
          <div className="flex-1 flex flex-col justify-center items-center relative">
             <div className="w-full h-48">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                  <Pie 
                    data={stats.categoryData} 
                    innerRadius={55} 
                    outerRadius={80} 
                    paddingAngle={3} 
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    formatter={(value) => [`${value} dk`, 'Süre']}
                  />
                </PieChart>
               </ResponsiveContainer>
             </div>
             {/* Özel Lejant (Legend) */}
             <div className="flex flex-wrap justify-center gap-3 mt-2">
               {stats.categoryData.map((cat, idx) => (
                 <div key={idx} className="flex items-center gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                   <span className="text-xs text-slate-400">{cat.name}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Alt Kısım: Son Oturumlar ve Hedef */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son Oturumlar Listesi */}
        <div className="lg:col-span-2 bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-200">{timeRange === 'weekly' ? 'Bu Haftaki Oturumlar' : 'Bugünkü Oturumlar'}</h3>
            <button className="text-indigo-400 text-sm hover:text-indigo-300 font-medium transition-colors">Tümünü Gör</button>
          </div>
          
          <div className="space-y-3">
            {stats.recentSessions && stats.recentSessions.length > 0 ? (
              stats.recentSessions.map((session) => (
                <SessionRow 
                  key={session.id}
                  category={session.category} 
                  time={session.time} 
                  duration={session.duration} 
                  status={session.status} 
                />
              ))
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
                <p className="text-slate-500 italic text-sm">Bu zaman aralığında henüz bir pomodoro tamamlamadın.</p>
              </div>
            )}
          </div>
        </div>

        {/* Hedef Kartı */}
        <div className="bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 border border-slate-800/80 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden">
           {/* Arka plan efekti */}
           <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
           
           <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-purple-500/20 z-10">
             ⚡
           </div>
           <h3 className="font-bold mb-6 text-slate-200 z-10 tracking-wide">
             {timeRange === 'weekly' ? 'Haftalık Hedef' : 'Günlük Hedef'}
           </h3>
           
           <div className="text-6xl font-black text-white mb-2 tracking-tighter z-10 flex items-baseline gap-1">
             {stats.sessionsCount}
             <span className="text-slate-500 text-3xl font-bold">/{targetSessions}</span>
           </div>
           <p className="text-xs text-slate-400 mb-8 z-10 uppercase tracking-widest font-bold">Pomodoro</p>
           
           <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden mb-4 shadow-inner z-10">
             <div 
               className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-1000 ease-out" 
               style={{ 
                 width: `${Math.min((stats.sessionsCount / targetSessions) * 100, 100)}%`,
                 backgroundSize: "200% 100%",
                 animation: "gradientMove 3s ease infinite"
               }}
             ></div>
           </div>
           
           <div className="z-10 h-6">
             {stats.sessionsCount >= targetSessions ? (
               <p className="text-xs font-bold text-emerald-400 animate-pulse">🎉 Hedefe ulaşıldı!</p>
             ) : (
               <p className="text-xs text-slate-500">Hedefe <span className="font-bold text-indigo-400">{Math.max(targetSessions - stats.sessionsCount, 0)}</span> pomodoro kaldı.</p>
             )}
           </div>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ icon, title, value, unit, iconBg, iconColor }) => (
  <div className="bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`w-10 h-10 md:w-14 md:h-14 ${iconBg} ${iconColor} rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-inner shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs md:text-sm text-slate-400 mb-0.5">{title}</p>
      <p className="text-xl md:text-3xl font-black text-slate-100 tracking-tight">
        {value} <span className="text-xs md:text-sm font-bold text-slate-500">{unit}</span>
      </p>
    </div>
  </div>
);

const SessionRow = ({ category, time, duration, status }) => {
  const isCompleted = status === "Tamamlandı" || status === "completed"; 
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl border border-slate-700/30 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-1 h-10 rounded-full ${isCompleted ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
        <div>
          <p className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{category}</p>
          <p className="text-[10px] text-slate-400 font-medium">🕒 {time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-sm text-slate-200">{duration}</p>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
          {status}
        </p>
      </div>
    </div>
  );
};

export default Statistics;