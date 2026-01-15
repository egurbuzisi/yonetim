import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { messagesApi, projectTagsApi } from '../../services/api';
import { Plus, ChevronRight, MessageCircle, AlertTriangle, Clock, Search, Filter, X, Bell, Tag, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface ProjectTag {
  id: string;
  label: string;
  color: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const { getFilteredProjects, notifications } = useData();
  const navigate = useNavigate();
  
  // Arama ve filtreleme
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  
  // Her proje için mesaj sayısı
  const [projectMessages, setProjectMessages] = useState<Record<string, any[]>>({});
  // Son görüntüleme zamanları (localStorage)
  const [lastViewed, setLastViewed] = useState<Record<string, string>>({});
  
  // API'den gelen etiketler
  const [projectTags, setProjectTags] = useState<ProjectTag[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const allProjects = user ? getFilteredProjects(user.id, user.role) : [];
  
  // Etiketleri API'den yükle
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await projectTagsApi.getAll();
        setProjectTags(tags);
      } catch (err) {
        console.error('Etiketler yüklenemedi:', err);
      }
    };
    loadTags();
  }, []);
  
  // Etiket label'a göre renk bul
  const getTagColor = (tagLabel: string) => {
    const tag = projectTags.find(t => t.label === tagLabel);
    return tag?.color || 'bg-gray-100 text-gray-700';
  };
  
  // Filtrelenmiş projeler
  const projects = allProjects.filter(project => {
    // Arama filtresi
    const matchesSearch = searchQuery === '' || 
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Durum filtresi
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    // Etiket filtresi (description'dan)
    const matchesTag = tagFilter === 'all' || project.description === tagFilter;
    
    return matchesSearch && matchesStatus && matchesTag;
  });

  // Mesajları ve son görüntüleme zamanlarını yükle
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const allMessages = await messagesApi.getAll();
        const grouped: Record<string, any[]> = {};
        allMessages.forEach((msg: any) => {
          if (!grouped[msg.projectId]) {
            grouped[msg.projectId] = [];
          }
          grouped[msg.projectId].push(msg);
        });
        setProjectMessages(grouped);
      } catch (err) {
        console.error('Mesajlar yüklenemedi:', err);
      }
    };
    
    // localStorage'dan son görüntüleme zamanlarını al
    const savedLastViewed = localStorage.getItem('project_last_viewed');
    if (savedLastViewed) {
      setLastViewed(JSON.parse(savedLastViewed));
    }
    
    loadMessages();
    
    // Her 10 saniyede güncelle
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  // Proje için yeni mesaj var mı kontrol et
  const hasNewMessages = (projectId: string): number => {
    const messages = projectMessages[projectId] || [];
    const lastViewedTime = lastViewed[projectId];
    
    if (!lastViewedTime) {
      return messages.length; // Hiç görüntülenmemişse tüm mesajlar yeni
    }
    
    const lastViewedDate = new Date(lastViewedTime);
    return messages.filter(msg => new Date(msg.createdAt) > lastViewedDate).length;
  };

  // Kaç gündür devam ediyor
  const getDaysSinceStart = (project: any): number => {
    const startDate = new Date(project.startDate || project.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Son 15 günde ilerleme var mı (updatedAt kontrolü)
  const hasNoRecentProgress = (project: any): boolean => {
    if (project.status === 'tamamlandi' || project.status === 'iptal') {
      return false; // Tamamlanan veya iptal edilen projeler için uyarı gösterme
    }
    
    const updatedAt = new Date(project.updatedAt || project.createdAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceUpdate >= 15 && project.progress < 100;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      dusunuluyor: 'bg-cyan-100 text-cyan-700',
      planlandi: 'bg-purple-100 text-purple-700',
      devam_ediyor: 'bg-blue-100 text-blue-700',
      tamamlandi: 'bg-green-100 text-green-700',
      beklemede: 'bg-yellow-100 text-yellow-700',
      iptal: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      dusunuluyor: 'Düşünülüyor',
      planlandi: 'Planlandı',
      devam_ediyor: 'Devam Ediyor',
      tamamlandi: 'Tamamlandı',
      beklemede: 'Beklemede',
      iptal: 'İptal',
    };
    return labels[status] || status;
  };

  // Durum filtreleri
  const statusFilters = [
    { value: 'all', label: 'Tümü', color: 'bg-gray-100 text-gray-700' },
    { value: 'dusunuluyor', label: 'Düşünülüyor', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'planlandi', label: 'Planlandı', color: 'bg-purple-100 text-purple-700' },
    { value: 'devam_ediyor', label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700' },
    { value: 'tamamlandi', label: 'Tamamlandı', color: 'bg-green-100 text-green-700' },
    { value: 'beklemede', label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'iptal', label: 'İptal', color: 'bg-red-100 text-red-700' },
  ];

  // Her durum için proje sayısını hesapla
  const getStatusCount = (status: string) => {
    if (status === 'all') return allProjects.length;
    return allProjects.filter(p => p.status === status).length;
  };

  return (
    <div className="space-y-2 max-w-5xl mx-auto">
      {/* Başlık ve Yeni Buton */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Projeler</h1>
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center gap-1.5 sm:gap-2 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Yeni</span>
        </button>
      </div>

      {/* Proje Bildirimleri */}
      {notifications.filter(n => n.link?.startsWith('/projects')).length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                {notifications.filter(n => !n.read && n.link?.startsWith('/projects')).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="font-medium text-sm text-indigo-800">Proje Bildirimleri</span>
              {notifications.filter(n => !n.read && n.link?.startsWith('/projects')).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {notifications.filter(n => !n.read && n.link?.startsWith('/projects')).length} yeni
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="text-indigo-600 text-xs hover:underline"
            >
              Tümünü gör
            </button>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {notifications
              .filter(n => n.link?.startsWith('/projects'))
              .slice(0, 3)
              .map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => notif.link && navigate(notif.link)}
                  className={`w-full text-left p-2 rounded-lg text-xs sm:text-sm transition-colors ${
                    !notif.read 
                      ? 'bg-white shadow-sm border-l-2 border-indigo-500' 
                      : 'bg-white/50 hover:bg-white'
                  }`}
                >
                  <p className="font-medium text-gray-800 truncate">{notif.title}</p>
                  <p className="text-gray-500 text-xs truncate">{notif.message}</p>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Proje ara..."
          className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Durum Filtreleri */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        <Filter className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
              statusFilter === filter.value
                ? `${filter.color} ring-1 ring-offset-1 ring-indigo-400`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label} ({getStatusCount(filter.value)})
          </button>
        ))}
      </div>

      {/* Etiket Filtreleri - Açılır/Kapanır */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setShowTagFilter(!showTagFilter)}
          className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Kategoriler</span>
            {tagFilter !== 'all' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                {tagFilter}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {tagFilter !== 'all' && (
              <button
                onClick={(e) => { e.stopPropagation(); setTagFilter('all'); }}
                className="text-[10px] text-indigo-600 hover:underline"
              >
                Temizle
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/settings/project-tags'); }}
              className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
            >
              <Settings className="w-3 h-3" />
            </button>
            {showTagFilter ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
          </div>
        </button>
        
        {showTagFilter && (
          <div className="px-2 pb-2 pt-1 border-t">
            <div className="flex flex-wrap gap-0.5">
              <button
                onClick={() => setTagFilter('all')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  tagFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tümü ({allProjects.length})
              </button>
              {projectTags.map((tag) => {
                const count = statusFilter === 'all' 
                  ? allProjects.filter(p => p.description === tag.label).length
                  : allProjects.filter(p => p.description === tag.label && p.status === statusFilter).length;
                
                if (statusFilter !== 'all' && count === 0) return null;
                
                return (
                  <button
                    key={tag.id}
                    onClick={() => setTagFilter(tag.label)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                      tagFilter === tag.label
                        ? 'bg-indigo-600 text-white'
                        : tag.color
                    }`}
                  >
                    {tag.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sonuç bilgisi */}
      {(searchQuery || statusFilter !== 'all' || tagFilter !== 'all') && (
        <div className="text-xs sm:text-sm text-gray-500 flex items-center justify-between">
          <span>
            {projects.length} proje bulundu
            {searchQuery && <span className="hidden sm:inline"> • "{searchQuery}"</span>}
            {tagFilter !== 'all' && <span className="hidden sm:inline"> • {tagFilter}</span>}
          </span>
          <button 
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setTagFilter('all');
            }}
            className="text-indigo-600 hover:underline"
          >
            Temizle
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl p-6 sm:p-8 text-center">
          {allProjects.length === 0 ? (
            <>
              <p className="text-gray-500 text-sm sm:text-base">Henüz proje bulunmuyor</p>
              <button
                onClick={() => navigate('/projects/new')}
                className="mt-4 text-indigo-600 font-medium hover:underline text-sm sm:text-base"
              >
                İlk projeyi oluştur
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm sm:text-base">Arama kriterlerine uygun proje bulunamadı</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-4 text-indigo-600 font-medium hover:underline text-sm sm:text-base"
              >
                Filtreleri temizle
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {projects.map((project) => {
            const messageCount = (projectMessages[project.id] || []).length;
            const newMessageCount = hasNewMessages(project.id);
            const daysSinceStart = getDaysSinceStart(project);
            const noRecentProgress = hasNoRecentProgress(project);
            
            return (
              <button
                key={project.id}
                onClick={() => {
                  // Son görüntüleme zamanını kaydet
                  const newLastViewed = { ...lastViewed, [project.id]: new Date().toISOString() };
                  setLastViewed(newLastViewed);
                  localStorage.setItem('project_last_viewed', JSON.stringify(newLastViewed));
                  navigate(`/projects/${project.id}`);
                }}
                className="w-full bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all text-left relative"
              >
                {/* 15 gün ilerleme yok uyarısı */}
                {noRecentProgress && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="hidden sm:inline">İlerleme Yok!</span>
                    <span className="sm:hidden">!</span>
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Proje Adı */}
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate pr-2">
                      {project.title || 'İsimsiz Proje'}
                    </h3>
                    
                    {/* Etiket (Description'dan) */}
                    {project.description && (
                      <span className={`inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded-full mt-1 ${getTagColor(project.description)}`}>
                        {project.description}
                      </span>
                    )}
                    
                    {/* Durum ve Bilgiler */}
                    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                      <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                      
                      {/* Kaç gündür devam ediyor */}
                      <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysSinceStart} gün
                      </span>
                      
                      {/* Mesaj sayısı ve yeni mesaj bildirimi */}
                      <span className={`text-[10px] sm:text-xs flex items-center gap-1 ${newMessageCount > 0 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                        <MessageCircle className="w-3 h-3" />
                        {messageCount}
                        {newMessageCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full">
                            +{newMessageCount}
                          </span>
                        )}
                      </span>
                      
                      {project.mahalle && (
                        <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">📍 {project.mahalle}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-1 flex-shrink-0" />
                </div>
                
                {/* İlerleme Çubuğu */}
                <div className="mt-3 sm:mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs text-gray-500">İlerleme</span>
                    <span className="text-xs sm:text-sm font-bold text-blue-600">%{project.progress || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        noRecentProgress 
                          ? 'bg-gradient-to-r from-red-400 to-red-500' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
