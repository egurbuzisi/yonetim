import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { 
  ArrowLeft, BarChart3, PieChart, TrendingUp, AlertTriangle, 
  Calendar, Clock, CheckCircle2, XCircle, Pause, Lightbulb,
  Target, Tag, FolderKanban, ChevronRight
} from 'lucide-react';
import { getTagById } from '../constants/projectTags';

export default function ProjectReportPage() {
  const { projects } = useData();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  // Filtreleme
  const filteredProjects = useMemo(() => {
    if (selectedPeriod === 'all') return projects;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return projects.filter(p => new Date(p.createdAt) >= startDate);
  }, [projects, selectedPeriod]);

  // İstatistikler
  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const byStatus = {
      dusunuluyor: filteredProjects.filter(p => p.status === 'dusunuluyor').length,
      planlandi: filteredProjects.filter(p => p.status === 'planlandi').length,
      devam_ediyor: filteredProjects.filter(p => p.status === 'devam_ediyor').length,
      tamamlandi: filteredProjects.filter(p => p.status === 'tamamlandi').length,
      beklemede: filteredProjects.filter(p => p.status === 'beklemede').length,
      iptal: filteredProjects.filter(p => p.status === 'iptal').length,
    };
    
    const avgProgress = total > 0 
      ? Math.round(filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / total)
      : 0;
    
    const completionRate = total > 0 
      ? Math.round((byStatus.tamamlandi / total) * 100)
      : 0;

    // Geciken projeler
    const now = new Date();
    const overdue = filteredProjects.filter(p => {
      if (p.status === 'tamamlandi' || p.status === 'iptal') return false;
      if (!p.endDate) return false;
      return new Date(p.endDate) < now;
    }).length;

    // Bu hafta biten
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const endingThisWeek = filteredProjects.filter(p => {
      if (p.status === 'tamamlandi' || p.status === 'iptal') return false;
      if (!p.endDate) return false;
      const end = new Date(p.endDate);
      return end >= now && end <= weekEnd;
    }).length;

    return { total, byStatus, avgProgress, completionRate, overdue, endingThisWeek };
  }, [filteredProjects]);

  // Etiket dağılımı
  const tagStats = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    filteredProjects.forEach(p => {
      (p.tags || []).forEach((tagId: string) => {
        tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .map(([id, count]) => ({ id, count, tag: getTagById(id) }))
      .filter(t => t.tag)
      .sort((a, b) => b.count - a.count);
  }, [filteredProjects]);

  // Durum renkleri
  const statusConfig = {
    dusunuluyor: { label: 'Düşünülüyor', color: 'bg-cyan-500', icon: Lightbulb },
    planlandi: { label: 'Planlandı', color: 'bg-purple-500', icon: Calendar },
    devam_ediyor: { label: 'Devam Ediyor', color: 'bg-blue-500', icon: TrendingUp },
    tamamlandi: { label: 'Tamamlandı', color: 'bg-green-500', icon: CheckCircle2 },
    beklemede: { label: 'Beklemede', color: 'bg-yellow-500', icon: Pause },
    iptal: { label: 'İptal', color: 'bg-red-500', icon: XCircle },
  };

  // En yüksek bar için max değer
  const maxStatusCount = Math.max(...Object.values(stats.byStatus));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Proje Raporu
          </h1>
          <div className="w-6" />
        </div>
        
        {/* Dönem Seçici */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Tümü' },
            { value: 'month', label: 'Son Ay' },
            { value: 'quarter', label: 'Son 3 Ay' },
            { value: 'year', label: 'Son Yıl' },
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.value
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Özet Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Toplam Proje */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <FolderKanban className="w-4 h-4" />
              Toplam Proje
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>

          {/* Ortalama İlerleme */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Target className="w-4 h-4" />
              Ort. İlerleme
            </div>
            <p className="text-3xl font-bold text-blue-600">%{stats.avgProgress}</p>
          </div>

          {/* Tamamlanma Oranı */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Tamamlanma
            </div>
            <p className="text-3xl font-bold text-green-600">%{stats.completionRate}</p>
          </div>

          {/* Geciken */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <AlertTriangle className="w-4 h-4" />
              Geciken
            </div>
            <p className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {stats.overdue}
            </p>
          </div>
        </div>

        {/* Durum Dağılımı - Bar Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Durum Dağılımı
          </h3>
          <div className="space-y-3">
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = stats.byStatus[key as keyof typeof stats.byStatus];
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const barWidth = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0;
              const Icon = config.icon;
              
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-28 flex items-center gap-2 text-sm text-gray-600">
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{config.label}</span>
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full ${config.color} transition-all duration-500 rounded-lg`}
                      style={{ width: `${barWidth}%` }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                      {count} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Etiket Dağılımı */}
        {tagStats.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500" />
              Etiket Dağılımı
            </h3>
            <div className="flex flex-wrap gap-2">
              {tagStats.map(({ id, count, tag }) => (
                <div 
                  key={id}
                  className={`${tag?.color} px-3 py-2 rounded-lg flex items-center gap-2`}
                >
                  <span>{tag?.icon}</span>
                  <span className="font-medium">{tag?.label}</span>
                  <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* İlerleme Dağılımı */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-500" />
            İlerleme Dağılımı
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: '0-25%', min: 0, max: 25, color: 'bg-red-100 text-red-700' },
              { label: '26-50%', min: 26, max: 50, color: 'bg-yellow-100 text-yellow-700' },
              { label: '51-75%', min: 51, max: 75, color: 'bg-blue-100 text-blue-700' },
              { label: '76-100%', min: 76, max: 100, color: 'bg-green-100 text-green-700' },
            ].map(range => {
              const count = filteredProjects.filter(p => 
                (p.progress || 0) >= range.min && (p.progress || 0) <= range.max
              ).length;
              return (
                <div key={range.label} className={`${range.color} rounded-xl p-3`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs font-medium">{range.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Uyarılar */}
        {(stats.overdue > 0 || stats.endingThisWeek > 0) && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Dikkat Gerektiren Projeler
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.overdue > 0 && (
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-sm opacity-90">Süresi Geçmiş</p>
                </div>
              )}
              {stats.endingThisWeek > 0 && (
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-2xl font-bold">{stats.endingThisWeek}</p>
                  <p className="text-sm opacity-90">Bu Hafta Bitiyor</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Son Projeler Listesi */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Son Eklenen Projeler
          </h3>
          <div className="space-y-2">
            {filteredProjects
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map(project => {
                const config = statusConfig[project.status as keyof typeof statusConfig];
                return (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className={`w-2 h-10 ${config?.color || 'bg-gray-300'} rounded-full`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{project.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{config?.label}</span>
                        <span>•</span>
                        <span>%{project.progress || 0}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="w-full mt-3 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors"
          >
            Tüm Projeleri Gör →
          </button>
        </div>
      </div>
    </div>
  );
}
