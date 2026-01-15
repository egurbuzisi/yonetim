import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, ClipboardList, Clock, Calendar, Heart, Bell,
  Phone, Globe, MessageCircle, Building2, ChevronLeft, ChevronRight,
  Brush, HandHeart, TreeDeciduous, Snowflake, AlertTriangle
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { projects, agendas, pendingTasks, scheduleItems, notifications, cenazes, loading, refreshData } = useData();
  
  useEffect(() => {
    refreshData();
  }, []);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [callCenterTab, setCallCenterTab] = useState<'gun' | 'hafta' | 'ay'>('gun');

  const today = new Date();
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const dateStr = `${today.getDate()} ${monthNames[today.getMonth()]} ${dayNames[today.getDay()]}`;

  // Kullanıcıya göre filtreleme
  const myProjects = projects.filter(p => p.createdBy === user?.id);
  const assignedProjects = projects.filter(p => p.visibleTo?.includes(user?.id || ''));
  
  // Alarm veren projeler (15 gün ilerleme yok veya bitiş tarihi yaklaşıyor)
  const getAlertProjects = () => {
    const now = new Date();
    return projects.filter(p => {
      // Tamamlanmış veya iptal edilmiş projeleri hariç tut
      if (p.status === 'tamamlandi' || p.status === 'iptal') return false;
      
      // 15 gündür ilerleme yok
      const updatedAt = new Date(p.updatedAt || p.createdAt);
      const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      const noProgress = daysSinceUpdate >= 15 && (p.progress || 0) < 100;
      
      // Bitiş tarihi 7 gün içinde veya geçmiş
      let nearDeadline = false;
      if (p.endDate) {
        const endDate = new Date(p.endDate);
        const daysUntilEnd = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        nearDeadline = daysUntilEnd <= 7;
      }
      
      return noProgress || nearDeadline;
    });
  };
  
  const alertProjects = getAlertProjects();
  
  const myAgendas = agendas.filter(a => a.createdBy === user?.id);
  const assignedAgendas = agendas.filter(a => a.visibleTo?.includes(user?.id || ''));
  
  const myPendings = pendingTasks.filter(p => p.createdBy === user?.id);
  const assignedPendings = pendingTasks.filter(p => p.visibleTo?.includes(user?.id || ''));

  // Bugün ve bu hafta planlanmış
  const todaySchedules = scheduleItems.filter(s => {
    const itemDate = new Date(s.startTime || s.date);
    return itemDate.toDateString() === today.toDateString();
  });
  
  const tomorrowSchedules = scheduleItems.filter(s => {
    const itemDate = new Date(s.startTime || s.date);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return itemDate.toDateString() === tomorrow.toDateString();
  });

  const weekSchedules = scheduleItems.filter(s => {
    const itemDate = new Date(s.startTime || s.date);
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);
    return itemDate >= today && itemDate <= weekLater;
  });

  // Cenaze verileri
  const myCenazes = cenazes?.filter(c => c.createdBy === user?.id) || [];
  const assignedCenazes = cenazes?.filter(c => c.visibleTo?.includes(user?.id || '')) || [];
  const todayCenazes = cenazes?.filter(c => {
    if (!c.tarih) return false;
    const cDate = new Date(c.tarih);
    return cDate.toDateString() === today.toDateString();
  }) || [];
  const weekCenazes = cenazes?.filter(c => {
    if (!c.tarih) return false;
    const cDate = new Date(c.tarih);
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);
    return cDate >= today && cDate <= weekLater;
  }) || [];
  
  const cenazeData = { 
    total: cenazes?.length || 0, 
    created: myCenazes.length, 
    assigned: assignedCenazes.length, 
    today: todayCenazes.length, 
    week: weekCenazes.length 
  };

  const pages = ['Özet', 'Projeler', 'Gündem', 'Bekleyen', 'Program', 'Cenaze', 'Rapor'];
  const totalPages = pages.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {/* Tarih */}
      <p className="text-gray-500 text-sm">{dateStr}</p>

      {/* Hoşgeldin */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-800">
          Hoş geldin, {user?.name?.split(' ')[0]} <span className="inline-block">👋</span>
        </h1>
      </div>
      <p className="text-gray-600 -mt-2">
        {user?.role === 'baskan' ? 'Başkan' : 
         user?.role === 'ozel_kalem' ? 'Özel Kalem' :
         user?.role === 'baskan_yardimcisi' ? 'Başkan Yardımcısı' :
         user?.role === 'mudur' ? 'Müdür' : 'Personel'}
      </p>

      {/* Bildirim Özet Kartı */}
      <button
        onClick={() => navigate('/notifications')}
        className={`w-full rounded-xl p-4 shadow-lg relative overflow-hidden group transition-all ${
          notifications.filter(n => !n.read).length > 0
            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white'
            : 'bg-white border border-gray-200 text-gray-700'
        }`}
      >
        {/* Animasyonlu arka plan (sadece bildirim varken) */}
        {notifications.filter(n => !n.read).length > 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                notifications.filter(n => !n.read).length > 0
                  ? 'bg-white/20 backdrop-blur'
                  : 'bg-gray-100'
              }`}>
                <Bell className={`w-6 h-6 ${
                  notifications.filter(n => !n.read).length > 0 ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <div className="text-left">
              {notifications.filter(n => !n.read).length > 0 ? (
                <>
                  <p className="font-bold text-lg">
                    {notifications.filter(n => !n.read).length} Yeni Bildirim
                  </p>
                  <p className="text-white/80 text-sm">
                    {notifications.filter(n => !n.read && n.link?.startsWith('/projects')).length > 0 && 
                      `${notifications.filter(n => !n.read && n.link?.startsWith('/projects')).length} proje • `
                    }
                    Görüntülemek için tıklayın
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-700">Bildirimler</p>
                  <p className="text-gray-500 text-sm">Yeni bildirim yok ✓</p>
                </>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-1 ${
            notifications.filter(n => !n.read).length > 0 ? 'text-white/80' : 'text-gray-400'
          }`}>
            <span className="text-sm hidden sm:inline">Tümünü Gör</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
        
        {/* Alt çizgi animasyonu (sadece bildirim varken) */}
        {notifications.filter(n => !n.read).length > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
            <div className="h-full bg-white animate-pulse" style={{ width: '30%' }} />
          </div>
        )}
      </button>

      {/* Ana Kartlar Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Projeler Kartı */}
        <button
          onClick={() => navigate('/projects')}
          className={`bg-white rounded-xl p-4 shadow-sm text-left border ${alertProjects.length > 0 ? 'border-red-200' : 'border-gray-100'} relative`}
        >
          {/* Alarm badge */}
          {alertProjects.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              {alertProjects.length}
            </div>
          )}
          
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-blue-600 font-semibold text-sm">Projeler</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{projects.length}</p>
          <p className="text-xs text-gray-500 mt-1">Toplam proje</p>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-red-500">🔴 {myProjects.length} oluşturduğum</span>
              <span className="text-blue-500">🔵 {assignedProjects.length} bana gelen</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Oluşturduğum:</span>
              <span>Bana gelen:</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>✓{myProjects.filter(p => p.status === 'tamamlandi').length} ⏳{myProjects.filter(p => p.status !== 'tamamlandi').length}</span>
              <span>✓{assignedProjects.filter(p => p.status === 'tamamlandi').length} ⏳{assignedProjects.filter(p => p.status !== 'tamamlandi').length}</span>
            </div>
          </div>
          
          {/* Alarm Veren Projeler */}
          {alertProjects.length > 0 && (
            <div className="mt-3 pt-2 border-t border-red-100">
              <div className="flex items-center gap-1 text-red-500 mb-1.5">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[10px] font-semibold">DİKKAT!</span>
              </div>
              <div className="space-y-1">
                {alertProjects.slice(0, 2).map((p) => {
                  const now = new Date();
                  const endDate = p.endDate ? new Date(p.endDate) : null;
                  const daysUntilEnd = endDate ? Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                  const isOverdue = daysUntilEnd !== null && daysUntilEnd < 0;
                  
                  return (
                    <div key={p.id} className="bg-red-50 rounded p-1.5 text-[10px]">
                      <p className="font-medium text-gray-700 truncate">{p.title}</p>
                      <p className="text-red-500">
                        {isOverdue 
                          ? `⚠️ ${Math.abs(daysUntilEnd!)} gün gecikti!`
                          : daysUntilEnd !== null && daysUntilEnd <= 7
                            ? `⏰ ${daysUntilEnd} gün kaldı`
                            : '📊 15+ gün ilerleme yok'
                        }
                      </p>
                    </div>
                  );
                })}
                {alertProjects.length > 2 && (
                  <p className="text-[10px] text-red-400 text-center">+{alertProjects.length - 2} proje daha...</p>
                )}
              </div>
            </div>
          )}
        </button>

        {/* Gündem Kartı */}
        <button
          onClick={() => navigate('/agenda')}
          className="bg-white rounded-xl p-4 shadow-sm text-left border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-green-600 font-semibold text-sm">Gündem</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{agendas.length}</p>
          <p className="text-xs text-gray-500 mt-1">Toplam gündem</p>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-red-500">🔴 {myAgendas.length} atadığım</span>
              <span className="text-blue-500">🔵 {assignedAgendas.length} bana gelen</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Atadığım:</span>
              <span>Bana gelen:</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>✓{myAgendas.filter(a => a.status === 'gorusuldu').length} ⏳{myAgendas.filter(a => a.status !== 'gorusuldu').length}</span>
              <span>✓{assignedAgendas.filter(a => a.status === 'gorusuldu').length} ⏳{assignedAgendas.filter(a => a.status !== 'gorusuldu').length}</span>
            </div>
          </div>
          
          {/* Son Gündemler - Kompakt Liste */}
          {agendas.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-100 space-y-1.5">
              {agendas.slice(0, 2).map((a) => {
                const messageCount = a.messages?.length || 0;
                return (
                  <div key={a.id} className="flex items-center gap-2 text-[11px]">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      a.status === 'bekliyor' ? 'bg-yellow-500' :
                      a.status === 'gorusuldu' ? 'bg-green-500' :
                      a.status === 'ertelendi' ? 'bg-orange-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-gray-700 truncate flex-1">{a.title}</span>
                    {messageCount > 0 && (
                      <span className="text-blue-500 text-[10px] flex-shrink-0">{messageCount}💬</span>
                    )}
                  </div>
                );
              })}
              {agendas.length > 2 && (
                <p className="text-[10px] text-gray-400 pl-3.5">+{agendas.length - 2} daha</p>
              )}
            </div>
          )}
        </button>

        {/* Bekleyen Kartı */}
        <button
          onClick={() => navigate('/pending')}
          className="bg-white rounded-xl p-4 shadow-sm text-left border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-red-500 font-semibold text-sm">Bekleyen</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{pendingTasks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Toplam bekleyen</p>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-red-500">🔴 {myPendings.length} oluşturduğum</span>
              <span className="text-blue-500">🔵 {assignedPendings.length} bana gelen</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Oluşturduğum:</span>
              <span>Bana gelen:</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>✓{myPendings.filter(p => p.status === 'tamamlandi').length} ⏳{myPendings.filter(p => p.status !== 'tamamlandi').length}</span>
              <span>✓{assignedPendings.filter(p => p.status === 'tamamlandi').length} ⏳{assignedPendings.filter(p => p.status !== 'tamamlandi').length}</span>
            </div>
          </div>
        </button>

        {/* Program Kartı */}
        <button
          onClick={() => navigate('/program')}
          className="bg-white rounded-xl p-4 shadow-sm text-left border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-purple-600 font-semibold text-sm">Program</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{todaySchedules.length}</p>
          <p className="text-xs text-gray-500 mt-1">Bugün planlanmış</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded">📅 {todaySchedules.length} bugün</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded">🌙 {tomorrowSchedules.length} yarın</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded">📆 {weekSchedules.length} hafta</span>
          </div>
        </button>

        {/* Cenaze Kartı */}
        <button
          onClick={() => navigate('/cenaze')}
          className="bg-white rounded-xl p-4 shadow-sm text-left border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-gray-600 font-semibold text-sm">Cenaze</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{cenazeData.total}</p>
          <p className="text-xs text-gray-500 mt-1">Toplam cenaze</p>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-red-500">🔴 {cenazeData.created} oluşturduğum</span>
              <span className="text-blue-500">🔵 {cenazeData.assigned} bana gelen</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Oluşturduğum:</span>
              <span>Bana gelen:</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>✓0 ⏳0</span>
              <span>✓0 ⏳0</span>
            </div>
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-blue-500">🔷 {cenazeData.today} bugün</span>
            <span className="text-purple-500">📆 {cenazeData.week} hafta</span>
          </div>
        </button>

        {/* Çağrı Merkezi */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-sm">Çağrı Merkezi</span>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            {(['gun', 'hafta', 'ay'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCallCenterTab(tab)}
                className={`flex-1 py-1.5 text-xs rounded ${
                  callCenterTab === tab 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab === 'gun' ? '📅 Gün' : tab === 'hafta' ? '📆 Hafta' : '🗓️ Ay'}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
            <div>
              <p className="text-gray-400">Gelen</p>
              <p className="font-bold text-gray-600">--</p>
            </div>
            <div>
              <p className="text-gray-400">Yapılan</p>
              <p className="font-bold text-gray-600">--</p>
            </div>
            <div>
              <p className="text-gray-400">Kalan</p>
              <p className="font-bold text-red-500">--</p>
            </div>
          </div>

          {/* Kategoriler */}
          <div className="space-y-1 text-xs border-t pt-2">
            <p className="text-gray-400 text-[10px]">Kategori</p>
            <div className="flex items-center gap-2">
              <Brush className="w-3 h-3 text-purple-500" />
              <span>Temizlik</span>
              <span className="ml-auto text-gray-400">--</span>
            </div>
            <div className="flex items-center gap-2">
              <HandHeart className="w-3 h-3 text-yellow-500" />
              <span>Yardım</span>
              <span className="ml-auto text-gray-400">--</span>
            </div>
            <div className="flex items-center gap-2">
              <TreeDeciduous className="w-3 h-3 text-green-500" />
              <span>Budama</span>
              <span className="ml-auto text-gray-400">--</span>
            </div>
            <div className="flex items-center gap-2">
              <Snowflake className="w-3 h-3 text-blue-500" />
              <span>Buzlanma</span>
              <span className="ml-auto text-gray-400">--</span>
            </div>
          </div>

          {/* Gelen Çağrı Kanalları */}
          <div className="mt-3 pt-2 border-t">
            <p className="text-gray-400 text-[10px] mb-2">Gelen Çağrı Kanalları</p>
            <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
              <div className="p-1 bg-gray-50 rounded">
                <Phone className="w-4 h-4 mx-auto text-green-500" />
                <p>Telefon</p>
                <p className="font-bold">--</p>
              </div>
              <div className="p-1 bg-gray-50 rounded">
                <Globe className="w-4 h-4 mx-auto text-blue-500" />
                <p>Web</p>
                <p className="font-bold">--</p>
              </div>
              <div className="p-1 bg-gray-50 rounded">
                <MessageCircle className="w-4 h-4 mx-auto text-green-600" />
                <p>WhatsApp</p>
                <p className="font-bold text-red-500">--</p>
              </div>
              <div className="p-1 bg-gray-50 rounded">
                <Building2 className="w-4 h-4 mx-auto text-red-500" />
                <p>CİMER</p>
                <p className="font-bold text-red-500">--</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Son Bildirimler */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-indigo-500" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="font-semibold text-sm">Son Bildirimler</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length} yeni
              </span>
            )}
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="text-blue-500 text-xs hover:underline"
          >
            Tümü →
          </button>
        </div>
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  if (notif.link) {
                    navigate(notif.link);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  !notif.read 
                    ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    notif.type === 'info' ? 'bg-blue-500' :
                    notif.type === 'success' ? 'bg-green-500' :
                    notif.type === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{notif.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Henüz bildirim yok</p>
          </div>
        )}
      </div>

      {/* Alt Navigasyon */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className="text-gray-500 text-sm flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Geri
        </button>
        <span className="text-gray-600 text-sm">{currentPage}/{totalPages}</span>
        <button 
          onClick={() => {
            if (currentPage < totalPages) {
              setCurrentPage(currentPage + 1);
              navigate(`/${pages[currentPage].toLowerCase()}`);
            }
          }}
          className="text-blue-500 text-sm flex items-center gap-1"
        >
          {pages[currentPage]} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
