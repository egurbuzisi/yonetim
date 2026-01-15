import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { authApi, staffApi } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Varsayılan avatar (isim baş harfleri)
const getDefaultAvatar = (name: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff&size=150`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Önce ana backend ile dene
      const response = await authApi.login(username, password);
      
      // Backend "user" döndürüyorsa ve "error" yoksa başarılı
      if (response.user && !response.error) {
        const userData: User = {
          id: String(response.user.id),
          name: response.user.name,
          email: response.user.email || '',
          phone: response.user.phone || '',
          role: response.user.role,
          department: response.user.department || response.user.role,
          avatar: response.user.avatar || getDefaultAvatar(response.user.name),
        };
        
        // Kaydedilmiş avatar varsa kullan
        const savedAvatar = localStorage.getItem(`avatar_${userData.id}`);
        if (savedAvatar) {
          userData.avatar = savedAvatar;
        }
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      // Ana backend başarısız olduysa staff login dene
      try {
        const staffResponse = await staffApi.login(username, password);
        if (staffResponse.user && !staffResponse.error) {
          const userData: User = {
            id: String(staffResponse.user.id),
            name: staffResponse.user.name,
            email: '',
            phone: staffResponse.user.phone || '',
            role: staffResponse.user.role,
            department: staffResponse.user.department || staffResponse.user.title,
            avatar: getDefaultAvatar(staffResponse.user.name),
          };
          
          // Kaydedilmiş avatar varsa kullan
          const savedAvatar = localStorage.getItem(`avatar_${userData.id}`);
          if (savedAvatar) {
            userData.avatar = savedAvatar;
          }
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        }
      } catch (staffError) {
        console.log('Staff login failed:', staffError);
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Ana backend erişilemiyorsa staff login dene
      try {
        const staffResponse = await staffApi.login(username, password);
        if (staffResponse.user && !staffResponse.error) {
          const userData: User = {
            id: String(staffResponse.user.id),
            name: staffResponse.user.name,
            email: '',
            phone: staffResponse.user.phone || '',
            role: staffResponse.user.role,
            department: staffResponse.user.department || staffResponse.user.title,
            avatar: getDefaultAvatar(staffResponse.user.name),
          };
          
          const savedAvatar = localStorage.getItem(`avatar_${userData.id}`);
          if (savedAvatar) {
            userData.avatar = savedAvatar;
          }
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        }
      } catch (staffError) {
        console.log('Staff login also failed:', staffError);
      }
      
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateAvatar = (avatarBase64: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarBase64 };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem(`avatar_${user.id}`, avatarBase64);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateAvatar, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
