import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    passwordConfirm: '' // Joi şemandaki isimle birebir aynı yaptık
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend tarafında hızlı kontrol
    if (formData.password !== formData.passwordConfirm) {
      setError("Şifreler birbiriyle uyuşmuyor.");
      return;
    }

    setIsLoading(true);

    try {
      // Backend'e tüm objeyi gönderiyoruz (username, email, password, passwordConfirm)
      await api.post('/auth/register', formData);
      
      alert("Hesabın başarıyla oluşturuldu!");
      navigate('/');
    } catch (err) {
      // Joi'den gelen hata mesajlarını (örn: 'Şifre tekrarı alanı zorunludur') burada yakalıyoruz
      setError(err.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center p-4 font-sans">
      
      <div className="bg-white p-8 md:p-12 rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[480px] transition-all">
        
        {/* Logo Bölümü */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#a855f7] to-[#d946ef] rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-lg mb-6">
            P
          </div>
          <h2 className="text-[32px] font-black text-[#1e293b] tracking-tight mb-2">Aramıza Katıl</h2>
          <p className="text-[#94a3b8] font-medium text-center">Verimliliğini artırmaya başla.</p>
        </div>

        {/* Hata Mesajı Alanı */}
        {error && (
          <div className="bg-[#fff1f2] border border-[#ffe4e6] text-[#e11d48] px-6 py-4 rounded-3xl mb-8 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Kullanıcı Adı */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 ml-1">Kullanıcı Adı</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-6 py-4 bg-[#f1f5f9] border-none rounded-2xl focus:ring-2 focus:ring-[#a855f7] text-[#1e293b] font-medium transition-all outline-none placeholder-[#cbd5e1]"
              placeholder="flasco"
              required
            />
          </div>

          {/* E-Posta */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 ml-1">E-Posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-6 py-4 bg-[#f1f5f9] border-none rounded-2xl focus:ring-2 focus:ring-[#a855f7] text-[#1e293b] font-medium transition-all outline-none placeholder-[#cbd5e1]"
              placeholder="emodemo0101@mail.com"
              required
            />
          </div>

          {/* Şifre Alanları */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 ml-1">Şifre</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-6 py-4 bg-[#f1f5f9] border-none rounded-2xl focus:ring-2 focus:ring-[#a855f7] text-[#1e293b] transition-all outline-none"
                placeholder="••••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 ml-1">Şifre Tekrar</label>
              <input
                type="password"
                // BURASI DÜZELDİ: confirmPassword yerine passwordConfirm
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
                className="w-full px-6 py-4 bg-[#f1f5f9] border-none rounded-2xl focus:ring-2 focus:ring-[#a855f7] text-[#1e293b] transition-all outline-none"
                placeholder="••••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#9333ea] to-[#db2777] hover:opacity-90 text-white font-bold py-5 rounded-[22px] shadow-xl shadow-purple-100 transition-all active:scale-[0.98] disabled:opacity-50 text-lg"
          >
            {isLoading ? 'Lütfen Bekle...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="mt-10 text-center text-[15px] text-[#64748b] font-medium">
          Zaten hesabın var mı? <Link to="/" className="text-[#9333ea] font-bold hover:underline ml-1">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;