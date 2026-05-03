import { createContext, useState, useEffect, useContext } from 'react';
import { ProfileService } from '../services/api.services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı bilgilerini ve XP/Level durumunu backend'den çeker
  const fetchProfile = async () => {
    try {
      const response = await ProfileService.getMe();
      setUser(response.data); 
    } catch (error) {
      console.log("Oturum süresi dolmuş veya giriş yapılmamış.");
      localStorage.removeItem('token');
      setUser(null);
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
    fetchProfile(); // Giriş yapınca hemen profili çek
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);