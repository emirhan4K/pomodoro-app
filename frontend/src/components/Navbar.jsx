import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center rounded-b-3xl mb-8 border border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200">
          P
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Odaklan</h1>
      </div>
      
      <button
        onClick={handleLogout}
        className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors px-5 py-2.5 rounded-xl hover:bg-red-50"
      >
        Çıkış Yap
      </button>
    </nav>
  );
};

export default Navbar;