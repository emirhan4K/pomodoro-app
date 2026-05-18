import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/api.services';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await AuthService.login(formData);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard'; 
      
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 font-sans">
      
      {/* SOL PANEL - GÖRSEL (Sadece büyük ekranlarda görünür) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-600 overflow-hidden">
        {/* Dekoratif Işıklar */}
        <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-fuchsia-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 text-center px-12 flex flex-col items-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-10 border border-white/20 shadow-2xl">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-white to-indigo-200">P</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-6 tracking-tighter drop-shadow-md">Odaklan.</h1>
          <p className="text-lg text-indigo-100/80 font-medium leading-relaxed max-w-md">
            Pomodoro tekniği ile zamanını yönet, hedeflerine ulaş. Senin verimliliğin, senin kontrolünde.
          </p>
        </div>
      </div>

      {/* SAĞ PANEL - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md">
          
          {/* Mobil İçin Üst Logo (Sadece mobilde görünür) */}
          <div className="lg:hidden w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg">
            <span className="text-3xl font-black text-white">P</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Hoş Geldin 👋</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Hesabına giriş yap ve devam et</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-sm font-bold p-4 rounded-2xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 pl-1">E-Posta Adresi</label>
              <input
                type="email"
                required
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500/50 dark:focus:border-indigo-500/50 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-700 dark:text-white outline-none transition-all shadow-inner placeholder:font-medium placeholder:text-slate-400"
                placeholder="ornek@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 pl-1 pr-1">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Şifre</label>
                <Link to="/forgot-password" className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Şifremi Unuttum</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500/50 dark:focus:border-indigo-500/50 rounded-2xl py-3.5 pl-5 pr-12 text-sm font-bold text-slate-700 dark:text-white outline-none transition-all shadow-inner placeholder:font-medium placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isLoading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
            </button>
          </form>

          <p className="text-center mt-10 text-sm font-bold text-slate-500 dark:text-slate-400">
            Henüz hesabın yok mu?{' '}
            <Link to="/register" className="text-indigo-500 hover:text-indigo-600 transition-colors">
              Hemen Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;