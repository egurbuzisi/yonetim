import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Home, FolderKanban, ClipboardList, Clock, Calendar, Bell, User, LogOut, Heart, BarChart3, Menu
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Özet', icon: Home },
  { path: '/projects', label: 'Projeler', icon: FolderKanban },
  { path: '/agenda', label: 'Gündem', icon: ClipboardList },
  { path: '/pending', label: 'Bekleyen', icon: Clock },
  { path: '/program', label: 'Program', icon: Calendar },
  { path: '/cenaze', label: 'Cenaze', icon: Heart },
  { path: '/rapor', label: 'Rapor', icon: BarChart3 },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { unreadNotificationCount } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      baskan: 'Başkan',
      ozel_kalem: 'Özel Kalem',
      baskan_yardimcisi: 'Başkan Yardımcısı',
      mudur: 'Müdür',
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-800 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobil menü butonu - sadece küçük ekranlarda */}
            <button 
              className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-base sm:text-lg md:text-xl">YILDIRIM</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Bildirim butonu */}
            <button 
              onClick={() => navigate('/notifications')} 
              className="relative p-1.5 sm:p-2 hover:bg-white/10 rounded-lg"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
            {/* Profil - tablet ve üstü */}
            <button 
              onClick={() => navigate('/profile')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg"
            >
              <User className="w-5 h-5" />
              <span className="text-sm">{user?.name}</span>
            </button>
            {/* Çıkış */}
            <button 
              onClick={handleLogout} 
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg"
              title="Çıkış"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
        {/* Kullanıcı bilgisi - sadece mobilde görünür */}
        <p className="text-xs sm:text-sm text-indigo-200 sm:hidden mt-1">{user?.name} - {user && getRoleLabel(user.role)}</p>
      </header>

      {/* Desktop Navigation - Üst menü (lg ve üstü) */}
      <nav className="hidden lg:block bg-white border-b shadow-sm sticky top-[52px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    isActive 
                      ? 'border-indigo-600 text-indigo-700 font-medium bg-indigo-50/50' 
                      : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Tablet Navigation - Yatay scroll (md-lg arası) */}
      <nav className="hidden md:block lg:hidden bg-white border-b px-2 py-1.5 overflow-x-auto sticky top-[52px] z-40">
        <div className="flex gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation - Yatay scroll (md altı) */}
      <nav className="md:hidden bg-white border-b px-1 py-1 overflow-x-auto sticky top-[68px] z-40">
        <div className="flex gap-0.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-white w-64 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menü başlığı */}
            <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-4">
              <h2 className="font-bold">{user?.name}</h2>
              <p className="text-sm text-indigo-200">{user && getRoleLabel(user.role)}</p>
            </div>
            
            {/* Menü öğeleri */}
            <div className="py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 font-medium border-r-4 border-indigo-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Alt kısım */}
            <div className="absolute bottom-0 left-0 right-0 border-t p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
