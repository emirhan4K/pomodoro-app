import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    passwordConfirm: '' 
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
      // Joi'den gelen hata mesajlarını burada yakalıyoruz
      setError(err.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{ 
        backgroundColor: '#090A0F', 
        backgroundImage: 'radial-gradient(circle at 50% 50%, #15103A 0%, #090A0F 80%)' 
      }}
    >
      
      <div className="bg-[#151928] p-10 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-[420px] box-border transition-all">
        
        {/* Logo Bölümü */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#8B5CF6] rounded-[12px] flex items-center justify-center text-white font-bold text-2xl mb-4">
            P
          </div>
          <h2 className="text-[22px] font-bold text-white mb-2 tracking-tight">Aramıza Katıl</h2>
          <p className="text-[13px] text-[#828B9E] text-center">Verimliliğini artırmaya başla.</p>
        </div>

        {/* Hata Mesajı Alanı (Karanlık temaya uyumlu kırmızı) */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-[10px] mb-6 text-[13px] text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Kullanıcı Adı */}
          <div>
            <label className="block text-[10px] font-bold text-[#828B9E] uppercase tracking-[1px] mb-2">KULLANICI ADI</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-[14px] bg-[#22283A] text-white border-none rounded-[10px] text-[14px] outline-none placeholder-[#828B9E] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              placeholder="Örn: emirhan"
              required
            />
          </div>

          {/* E-Posta */}
          <div>
            <label className="block text-[10px] font-bold text-[#828B9E] uppercase tracking-[1px] mb-2">E-POSTA</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-[14px] bg-[#22283A] text-white border-none rounded-[10px] text-[14px] outline-none placeholder-[#828B9E] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              placeholder="isim@mail.com"
              required
            />
          </div>

          {/* Şifre Alanları */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#828B9E] uppercase tracking-[1px] mb-2">ŞİFRE</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-[14px] bg-[#22283A] text-white border-none rounded-[10px] text-[14px] outline-none placeholder-[#828B9E] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#828B9E] uppercase tracking-[1px] mb-2">ŞİFRE TEKRAR</label>
              <input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
                className="w-full px-4 py-[14px] bg-[#22283A] text-white border-none rounded-[10px] text-[14px] outline-none placeholder-[#828B9E] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-[14px] rounded-[10px] transition-colors text-[15px] mt-2 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Lütfen Bekle...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-[#828B9E]">
          Zaten hesabın var mı? <Link to="/" className="text-[#8B5CF6] font-bold hover:text-[#7C3AED] transition-colors ml-1 text-decoration-none">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;