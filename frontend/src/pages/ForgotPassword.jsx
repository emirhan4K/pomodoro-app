import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  
  // Register sayfasındaki gibi daha iyi bir kullanıcı deneyimi için eklendi:
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const requestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();

      if (response.ok) {
        alert("Kod mailinize gönderildi!");
        setStep(2); 
      } else {
        setError(result.message || "Bir hata oluştu.");
      }
    } catch (err) {
      setError("İstek başarısız. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      
      const result = await response.json();

      if (response.ok) {
        alert("Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz.");
        navigate('/'); // Login sayfana yönlendiriyoruz
      } else {
        setError(result.message || "Kod hatalı veya süresi dolmuş.");
      }
    } catch (err) {
      setError("İstek başarısız. Lütfen bağlantınızı kontrol edin.");
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
        
        {/* Logo ve Başlık Bölümü */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#8B5CF6] rounded-[12px] flex items-center justify-center text-white font-bold text-2xl mb-4">
            P
          </div>
          <h2 className="text-[22px] font-bold text-white mb-2 tracking-tight">
            {step === 1 ? 'Şifreni mi Unuttun?' : 'Yeni Şifre Belirle'}
          </h2>
          <p className="text-[13px] text-[#828B9E] text-center">
            {step === 1 
              ? 'Hesabını kurtarmaya hazır mısın?' 
              : 'Kodunu ve yeni şifreni girerek devam et.'}
          </p>
        </div>

        {/* Hata Mesajı Alanı (Register ile aynı) */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-[10px] mb-6 text-[13px] text-center font-bold">
            {error}
          </div>
        )}

        {/* Formlar */}
        {step === 1 ? (
          <form onSubmit={requestResetCode} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-[#828B9E] uppercase tracking-[1px] mb-2">E-POSTA</label>
              <input
                type="email"
                placeholder="isim@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-[14px] bg-[#22283A] text-white border-none rounded-[10px] text-[14px] outline-none placeholder-[#828B9E] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-[14px] rounded-[10px] transition-colors text-[15px] mt-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Gönderiliyor...' : 'Kod Gönder'}
            </button>
          </form>
        ) : (
          <form onSubmit={updatePassword} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-[#828B9E] uppercase tracking-[1px] mb-2">KOD (6 HANELİ)</label>
              <input
                type="text"
                placeholder="Örn: 123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength="6"
                className="w-full px-4 py-[14px] bg-[#22283A] text-white border-none rounded-[10px] text-[14px] outline-none placeholder-[#828B9E] focus:ring-1 focus:ring-[#8B5CF6] transition-all tracking-[4px] font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#828B9E] uppercase tracking-[1px] mb-2">YENİ ŞİFRE</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-[14px] bg-[#22283A] text-white border-none rounded-[10px] text-[14px] outline-none placeholder-[#828B9E] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-[14px] rounded-[10px] transition-colors text-[15px] mt-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'İşleniyor...' : 'Şifreyi Yenile'}
            </button>
          </form>
        )}

        {/* Girişe Geri Dön Linki */}
        <div className="mt-8 text-center text-[12px] text-[#828B9E]">
          Şifreni hatırladın mı? <Link to="/" className="text-[#8B5CF6] font-bold hover:text-[#7C3AED] transition-colors ml-1 text-decoration-none">Giriş Yap</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;