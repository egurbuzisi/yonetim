import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, FolderKanban, ClipboardList, Clock, Calendar, Heart,
  TrendingUp, CheckCircle2, AlertCircle, PauseCircle,
  ChevronRight
} from 'lucide-react';

type TabType = 'projeler' | 'gundem' | 'bekleyen' | 'program' | 'cenaze';

export default function RaporPage() {
  const { projects, agendas, pendingTasks, scheduleItems, cenazes } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('projeler');

  // ==================== PROJE İSTATİSTİKLERİ ====================
  const projectStats = {
    total: projects.length,
    dusunuluyor: projects.filter(p => p.status === 'dusunuluyor').length,
    planlanmis: projects.filter(p => p.status === 'planlanmis').length,
    devamEdiyor: projects.filter(p => p.status === 'devam_ediyor').length,
    tamamlandi: projects.filter(p => p.status === 'tamamlandi').length,
    beklemede: projects.filter(p => p.status === 'beklemede').length,
    iptal: projects.filter(p => p.status === 'iptal').length,
    avgProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) 
      : 0,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  // ==================== GÜNDEM İSTATİSTİKLERİ ====================
  const agendaStats = {
    total: agendas.length,
    bekliyor: agendas.filter(a => a.status === 'bekliyor').length,
    gorusuldu: agendas.filter(a => a.status === 'gorusuldu').length,
    ertelendi: agendas.filter(a => a.status === 'ertelendi').length,
    iptal: agendas.filter(a => a.status === 'iptal').length,
    // Öncelik dağılımı
    acil: agendas.filter(a => a.priority === 'acil').length,
    yuksek: agendas.filter(a => a.priority === 'yuksek').length,
    orta: agendas.filter(a => a.priority === 'orta').length,
    dusuk: agendas.filter(a => a.priority === 'dusuk').length,
  };

  // ==================== BEKLEYEN İSTATİSTİKLERİ ====================
  const pendingStats = {
    total: pendingTasks.length,
    beklemede: pendingTasks.filter(t => t.status === 'beklemede').length,
    islemde: pendingTasks.filter(t => t.status === 'islemde').length,
    tamamlandi: pendingTasks.filter(t => t.status === 'tamamlandi').length,
    reddedildi: pendingTasks.filter(t => t.status === 'reddedildi').length,
    randevu: pendingTasks.filter(t => t.category === 'randevu').length,
    talep: pendingTasks.filter(t => t.category === 'talep').length,
    sikayet: pendingTasks.filter(t => t.category === 'sikayet').length,
    diger: pendingTasks.filter(t => t.category === 'diger').length,
  };

  // ==================== PROGRAM İSTATİSTİKLERİ ====================
  const today = new Date();
  const scheduleStats = {
    total: scheduleItems.length,
    planlanmis: scheduleItems.filter(s => s.status === 'planlanmis').length,
    devamEdiyor: scheduleItems.filter(s => s.status === 'devam_ediyor').length,
    tamamlandi: scheduleItems.filter(s => s.status === 'tamamlandi').length,
    iptal: scheduleItems.filter(s => s.status === 'iptal').length,
    bugun: scheduleItems.filter(s => {
      const d = new Date(s.startTime || s.date);
      return d.toDateString() === today.toDateString();
    }).length,
    buHafta: scheduleItems.filter(s => {
      const d = new Date(s.startTime || s.date);
      const weekLater = new Date(today);
      weekLater.setDate(weekLater.getDate() + 7);
      return d >= today && d <= weekLater;
    }).length,
  };

  // ==================== CENAZE İSTATİSTİKLERİ ====================
  const cenazeStats = {
    total: cenazes?.length || 0,
    baskanAradi: cenazes?.filter(c => c.baskanAradiMi).length || 0,
    baskanAramadi: cenazes?.filter(c => !c.baskanAradiMi).length || 0,
    tamamlanan: cenazes?.filter(c => c.tamamlandi).length || 0,
    bekleyen: cenazes?.filter(c => !c.tamamlandi).length || 0,
  };

  // Progress Bar Komponenti
  const ProgressBar = ({ value, color = 'bg-blue-500' }: { value: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div 
        className={`${color} h-3 rounded-full transition-all duration-500`} 
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );

  // Stat Card Komponenti
  const tabs = [
    { id: 'projeler', label: 'Projeler', icon: FolderKanban, color: 'text-blue-600' },
    { id: 'gundem', label: 'Gündem', icon: ClipboardList, color: 'text-green-600' },
    { id: 'bekleyen', label: 'Bekleyen', icon: Clock, color: 'text-orange-600' },
    { id: 'program', label: 'Program', icon: Calendar, color: 'text-purple-600' },
    { id: 'cenaze', label: 'Cenaze', icon: Heart, color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Raporlar</h1>
            <p className="text-sm text-gray-500">Modül bazlı istatistikler</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-2 shadow-sm flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== PROJE RAPORU ==================== */}
      {activeTab === 'projeler' && (
        <div className="space-y-4">
          {/* Özet Kartları */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Toplam Proje</p>
              <p className="text-3xl font-bold text-gray-800">{projectStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Tamamlanan</p>
              <p className="text-3xl font-bold text-green-600">{projectStats.tamamlandi}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
              <p className="text-sm text-gray-500">Devam Eden</p>
              <p className="text-3xl font-bold text-indigo-600">{projectStats.devamEdiyor}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
              <p className="text-sm text-gray-500">Beklemede</p>
              <p className="text-3xl font-bold text-orange-600">{projectStats.beklemede}</p>
            </div>
          </div>

          {/* İlerleme */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Ortalama İlerleme</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <ProgressBar value={projectStats.avgProgress} color="bg-gradient-to-r from-blue-500 to-indigo-500" />
              </div>
              <span className="text-2xl font-bold text-indigo-600">%{projectStats.avgProgress}</span>
            </div>
          </div>

          {/* Durum Dağılımı */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Durum Dağılımı</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{projectStats.dusunuluyor}</p>
                <p className="text-xs text-yellow-700">Düşünülüyor</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{projectStats.planlanmis}</p>
                <p className="text-xs text-blue-700">Planlandı</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">{projectStats.devamEdiyor}</p>
                <p className="text-xs text-indigo-700">Devam Ediyor</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{projectStats.tamamlandi}</p>
                <p className="text-xs text-green-700">Tamamlandı</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{projectStats.beklemede}</p>
                <p className="text-xs text-orange-700">Beklemede</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{projectStats.iptal}</p>
                <p className="text-xs text-red-700">İptal</p>
              </div>
            </div>
          </div>

          {/* Proje Listesi */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Proje Listesi</h3>
              <button 
                onClick={() => navigate('/projects')}
                className="text-indigo-600 text-sm flex items-center gap-1 hover:underline"
              >
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y">
              {[...projects].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{project.title}</p>
                    <p className="text-sm text-gray-500">İlerleme: %{project.progress || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <ProgressBar value={project.progress || 0} color="bg-blue-500" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.status === 'tamamlandi' ? 'bg-green-100 text-green-700' :
                      project.status === 'devam_ediyor' ? 'bg-indigo-100 text-indigo-700' :
                      project.status === 'beklemede' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status === 'tamamlandi' ? 'Tamamlandı' :
                       project.status === 'devam_ediyor' ? 'Devam Ediyor' :
                       project.status === 'beklemede' ? 'Beklemede' :
                       project.status === 'planlanmis' ? 'Planlandı' :
                       project.status === 'dusunuluyor' ? 'Düşünülüyor' : 'İptal'}
                    </span>
                  </div>
                </button>
              ))}
              {projects.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Henüz proje bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== GÜNDEM RAPORU ==================== */}
      {activeTab === 'gundem' && (
        <div className="space-y-4">
          {/* Özet Kartları */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Toplam Gündem</p>
              <p className="text-3xl font-bold text-gray-800">{agendaStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Görüşüldü</p>
              <p className="text-3xl font-bold text-blue-600">{agendaStats.gorusuldu}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500">Bekliyor</p>
              <p className="text-3xl font-bold text-yellow-600">{agendaStats.bekliyor}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
              <p className="text-sm text-gray-500">Ertelendi</p>
              <p className="text-3xl font-bold text-orange-600">{agendaStats.ertelendi}</p>
            </div>
          </div>

          {/* Durum Dağılımı */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Durum Dağılımı</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{agendaStats.bekliyor}</p>
                <p className="text-xs text-yellow-700">Bekliyor</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{agendaStats.gorusuldu}</p>
                <p className="text-xs text-blue-700">Görüşüldü</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{agendaStats.ertelendi}</p>
                <p className="text-xs text-orange-700">Ertelendi</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{agendaStats.iptal}</p>
                <p className="text-xs text-red-700">İptal</p>
              </div>
            </div>
          </div>

          {/* Öncelik Dağılımı */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Öncelik Dağılımı</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-red-50 rounded-lg p-3 text-center border-2 border-red-200">
                <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
                <p className="text-2xl font-bold text-red-600">{agendaStats.acil}</p>
                <p className="text-xs text-red-700">Acil</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center border-2 border-orange-200">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <p className="text-2xl font-bold text-orange-600">{agendaStats.yuksek}</p>
                <p className="text-xs text-orange-700">Yüksek</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center border-2 border-blue-200">
                <PauseCircle className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold text-blue-600">{agendaStats.orta}</p>
                <p className="text-xs text-blue-700">Orta</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center border-2 border-gray-200">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                <p className="text-2xl font-bold text-gray-600">{agendaStats.dusuk}</p>
                <p className="text-xs text-gray-700">Düşük</p>
              </div>
            </div>
          </div>

          {/* Gündem Listesi */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Son Gündemler</h3>
              <button 
                onClick={() => navigate('/agenda')}
                className="text-green-600 text-sm flex items-center gap-1 hover:underline"
              >
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y">
              {[...agendas]
                .sort((a, b) => {
                  // Önce önceliğe göre sırala (acil > yuksek > orta > dusuk)
                  const priorityOrder = { acil: 0, yuksek: 1, orta: 2, dusuk: 3 };
                  return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
                })
                .slice(0, 5)
                .map((agenda) => (
                <button
                  key={agenda.id}
                  onClick={() => navigate(`/agenda/${agenda.id}`)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    agenda.priority === 'acil' ? 'bg-red-500' :
                    agenda.priority === 'yuksek' ? 'bg-orange-500' :
                    agenda.priority === 'orta' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{agenda.title}</p>
                    <p className="text-sm text-gray-500">
                      {agenda.meetingDate ? new Date(agenda.meetingDate).toLocaleDateString('tr-TR') : 'Tarih belirlenmedi'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      agenda.priority === 'acil' ? 'bg-red-100 text-red-700' :
                      agenda.priority === 'yuksek' ? 'bg-orange-100 text-orange-700' :
                      agenda.priority === 'orta' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {agenda.priority === 'acil' ? 'Acil' :
                       agenda.priority === 'yuksek' ? 'Yüksek' :
                       agenda.priority === 'orta' ? 'Orta' : 'Düşük'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      agenda.status === 'gorusuldu' ? 'bg-green-100 text-green-700' :
                      agenda.status === 'bekliyor' ? 'bg-yellow-100 text-yellow-700' :
                      agenda.status === 'ertelendi' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {agenda.status === 'gorusuldu' ? 'Görüşüldü' :
                       agenda.status === 'bekliyor' ? 'Bekliyor' :
                       agenda.status === 'ertelendi' ? 'Ertelendi' : 'İptal'}
                    </span>
                  </div>
                </button>
              ))}
              {agendas.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Henüz gündem bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== BEKLEYEN RAPORU ==================== */}
      {activeTab === 'bekleyen' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
              <p className="text-sm text-gray-500">Toplam</p>
              <p className="text-3xl font-bold text-gray-800">{pendingStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500">Beklemede</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingStats.beklemede}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">İşlemde</p>
              <p className="text-3xl font-bold text-blue-600">{pendingStats.islemde}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Tamamlandı</p>
              <p className="text-3xl font-bold text-green-600">{pendingStats.tamamlandi}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Kategori Dağılımı</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-xl font-bold text-purple-600">{pendingStats.randevu}</p>
                <p className="text-xs text-purple-700">Randevu</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <ClipboardList className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xl font-bold text-blue-600">{pendingStats.talep}</p>
                <p className="text-xs text-blue-700">Talep</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
                <p className="text-xl font-bold text-red-600">{pendingStats.sikayet}</p>
                <p className="text-xs text-red-700">Şikayet</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                <p className="text-xl font-bold text-gray-600">{pendingStats.diger}</p>
                <p className="text-xs text-gray-700">Diğer</p>
              </div>
            </div>
          </div>

          {pendingTasks.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Henüz bekleyen kayıt bulunmuyor</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== PROGRAM RAPORU ==================== */}
      {activeTab === 'program' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Toplam</p>
              <p className="text-3xl font-bold text-gray-800">{scheduleStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
              <p className="text-sm text-gray-500">Bugün</p>
              <p className="text-3xl font-bold text-orange-600">{scheduleStats.bugun}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Bu Hafta</p>
              <p className="text-3xl font-bold text-blue-600">{scheduleStats.buHafta}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Tamamlanan</p>
              <p className="text-3xl font-bold text-green-600">{scheduleStats.tamamlandi}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Durum Dağılımı</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{scheduleStats.planlanmis}</p>
                <p className="text-xs text-blue-700">Planlanmış</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-indigo-600">{scheduleStats.devamEdiyor}</p>
                <p className="text-xs text-indigo-700">Devam Ediyor</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{scheduleStats.tamamlandi}</p>
                <p className="text-xs text-green-700">Tamamlandı</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-600">{scheduleStats.iptal}</p>
                <p className="text-xs text-red-700">İptal</p>
              </div>
            </div>
          </div>

          {scheduleItems.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Henüz program bulunmuyor</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== CENAZE RAPORU ==================== */}
      {activeTab === 'cenaze' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-500">
              <p className="text-sm text-gray-500">Toplam</p>
              <p className="text-3xl font-bold text-gray-800">{cenazeStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Başkan Aradı</p>
              <p className="text-3xl font-bold text-green-600">{cenazeStats.baskanAradi}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
              <p className="text-sm text-gray-500">Aranmadı</p>
              <p className="text-3xl font-bold text-red-600">{cenazeStats.baskanAramadi}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Tamamlanan</p>
              <p className="text-3xl font-bold text-blue-600">{cenazeStats.tamamlanan}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Durum Özeti</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{cenazeStats.tamamlanan}</p>
                    <p className="text-sm text-green-700">Tamamlanan İşlem</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{cenazeStats.bekleyen}</p>
                    <p className="text-sm text-yellow-700">Bekleyen İşlem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(cenazes?.length || 0) === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              <Heart className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Henüz cenaze kaydı bulunmuyor</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
