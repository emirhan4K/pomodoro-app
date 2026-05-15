import { createContext, useState, useEffect, useContext } from 'react';
import { ProfileService } from '../services/api.services';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await ProfileService.getMe();
      console.log("🔥 API'den Gelen Profil:", response.data);
      setProfile(response.data?.data || response.data);
    } catch (error) {
      console.log("Oturum süresi dolmuş veya giriş yapılmamış.");
      localStorage.removeItem('token');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ profile, login, logout, fetchProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}