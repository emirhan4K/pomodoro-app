import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Social = ({ profile, requests, refresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const res = await api.get(`/users/search?q=${query}`);
      setSearchResults(res.data);
    } else {
      setSearchResults([]);
    }
  };

  const handleAction = async (type, id) => {
    try {
      if (type === 'accept') await api.post(`/friends/accept/${id}`);
      else if (type === 'reject') await api.post(`/friends/reject/${id}`);
      refresh(); // App.jsx'teki veriyi tazele
    } catch (err) { alert("İşlem başarısız."); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <Navbar profile={profile} notificationCount={requests.length} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Arkadaşlık İstekleri */}
          <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">Bekleyen İstekler</h3>
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">{req.senderName?.charAt(0)}</div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">@{req.senderName}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction('accept', req.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-xs hover:bg-emerald-600 transition-all">ONAYLA</button>
                    <button onClick={() => handleAction('reject', req.id)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl font-black text-xs">SİL</button>
                  </div>
                </div>
              ))}
              {requests.length === 0 && <p className="text-center text-slate-400 py-10 font-medium italic">Henüz bir istek yok.</p>}
            </div>
          </div>

          {/* Kullanıcı Arama */}
          <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">Yeni Arkadaşlar Bul</h3>
            <input 
              type="text" 
              placeholder="Kullanıcı adı ara..." 
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white mb-6 transition-all"
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="space-y-3">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-2xl transition-colors">
                  <span className="font-bold text-slate-700 dark:text-slate-200">@{user.username}</span>
                  <button className="text-indigo-600 dark:text-indigo-400 font-black text-xs hover:underline uppercase tracking-widest">İstek At</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;