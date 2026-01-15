import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Plus, Clock, Calendar, Search, X, Heart, MessageSquare, Briefcase, FileText, Edit2, Trash2, ClipboardList } from 'lucide-react';

// Tür bilgileri
const TYPE_INFO: Record<string, { icon: any; color: string; bgColor: string; label: string; border: string }> = {
  talep: { icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Talep', border: 'border-blue-500' },
  dugun: { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100', label: 'Düğün', border: 'border-pink-500' },
  randevu: { icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Randevu', border: 'border-green-500' },
  gorev: { icon: Briefcase, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Görev', border: 'border-purple-500' },
  diger: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Diğer', border: 'border-gray-300' },
};

type ViewMode = 'bekleyen' | 'planlanmis' | 'tamamlanmis';
type TypeFilter = 'tumu' | 'talep' | 'dugun' | 'randevu' | 'gorev' | 'diger';

export default function PendingPage() {
  const { user } = useAuth();
  const { getFilteredPendingTasks, getFilteredScheduleItems, addScheduleItem, updatePendingTask, deletePendingTask, addAgenda } = useData();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('bekleyen');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('tumu');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Gündem'e gönder modal
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [transferring, setTransferring] = useState(false);

  const tasks = user ? getFilteredPendingTasks(user.id, user.role) : [];

  // Tür sayıları
  const typeCounts = {
    tumu: tasks.length,
    talep: tasks.filter(t => t.type === 'talep').length,
    dugun: tasks.filter(t => t.type === 'dugun').length,
    randevu: tasks.filter(t => t.type === 'randevu').length,
    gorev: tasks.filter(t => t.type === 'gorev').length,
    diger: tasks.filter(t => !['talep', 'dugun', 'randevu', 'gorev'].includes(t.type)).length,
  };

  // Filtrelenmiş görevler
  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       task.requesterName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchType = typeFilter === 'tumu' || task.type === typeFilter || 
                     (typeFilter === 'diger' && !['talep', 'dugun', 'randevu', 'gorev'].includes(task.type));
    
    if (viewMode === 'bekleyen') {
      return matchSearch && matchType && (task.status === 'beklemede' || task.status === 'bekliyor');
    } else if (viewMode === 'planlanmis') {
      return matchSearch && matchType && task.status === 'planlanmis';
    } else {
      return matchSearch && matchType && task.status === 'tamamlandi';
    }
  });

  // Sabit saat dilimleri
  const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30',
  ];

  // Sonraki uygun saati bul (08:00'dan başla, doluysa sonraki boş saat)
  const getNextAvailableTime = (targetDate: Date): string => {
    if (!user) return '08:00';
    const scheduleItems = getFilteredScheduleItems(user.id, user.role);
    const sameDayItems = scheduleItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.toDateString() === targetDate.toDateString();
    });
    
    if (sameDayItems.length === 0) return '08:00';
    
    // Dolu saatleri bul
    const busyTimes = new Set(sameDayItems.map(item => item.time || '08:00'));
    
    // 08:00'dan başlayarak ilk boş saati bul
    for (const slot of TIME_SLOTS) {
      if (!busyTimes.has(slot)) {
        return slot;
      }
    }
    
    return '21:30';
  };

  // Tarih hesaplama
  const getTargetDate = (period: 'yarin' | 'bu_hafta' | 'bu_ay'): Date => {
    const now = new Date();
    switch (period) {
      case 'yarin':
        // Yarın: Bir sonraki gün
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      case 'bu_hafta':
        // Hafta: Gelecek haftanın Pazartesi'si
        const nextMonday = new Date(now);
        const dayOfWeek = nextMonday.getDay();
        // Pazartesi = 1, Pazar = 0
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
        return nextMonday;
      case 'bu_ay':
        // Ay: Gelecek ayın ilk iş günü (Pazartesi-Cuma)
        const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const firstDayOfWeek = firstDayNextMonth.getDay();
        // Eğer Cumartesi (6) ise Pazartesi'ye (2 gün ekle)
        // Eğer Pazar (0) ise Pazartesi'ye (1 gün ekle)
        if (firstDayOfWeek === 6) {
          firstDayNextMonth.setDate(firstDayNextMonth.getDate() + 2);
        } else if (firstDayOfWeek === 0) {
          firstDayNextMonth.setDate(firstDayNextMonth.getDate() + 1);
        }
        return firstDayNextMonth;
    }
  };

  // Direkt programa ekle
  const addToSchedule = async (task: any, period: 'yarin' | 'bu_hafta' | 'bu_ay') => {
    if (!user) return;

    const targetDate = getTargetDate(period);
    const time = task.scheduledTime || getNextAvailableTime(targetDate);

    try {
      // 1. Program modülüne ekle
      await addScheduleItem({
        title: task.title,
        description: task.description || '',
        type: task.type || 'gunluk',
        status: 'planlanmis',
        date: targetDate,
        time: time,
        location: task.location || '',
        createdBy: user.id,
        visibleTo: [user.id],
      });

      // 2. Bekleyen işi "Planlanmış" durumuna al
      await updatePendingTask(task.id, {
        status: 'planlanmis',
        scheduledDate: targetDate.toISOString(),
        scheduledTime: time,
      });

      // Başarılı mesajı göster
      alert(`"${task.title}" programa eklendi!`);

      // Program sayfasına git
      navigate('/program');
    } catch (error) {
      console.error('Programa eklenirken hata:', error);
      alert('Programa eklenirken bir hata oluştu.');
    }
  };

  // Görevi sil
  const handleDelete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      await deletePendingTask(taskId);
    }
  };

  // Düzenle
  const handleEdit = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/pending/${taskId}/edit`);
  };

  // Geçen gün sayısı
  const getDaysElapsed = (createdAt?: string | Date): number => {
    if (!createdAt) return 0;
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Tür bilgisi al
  const getTypeInfo = (type: string) => {
    return TYPE_INFO[type] || TYPE_INFO.diger;
  };

  // Gündem'e gönder butonuna tıklama
  const handleAgendaClick = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    setSelectedTask(task);
    setShowAgendaModal(true);
  };

  // Gündem'e Gönder
  const handleTransferToAgenda = async (priority: string) => {
    if (!user || !selectedTask) return;
    
    setTransferring(true);
    try {
      await addAgenda({
        title: selectedTask.title,
        description: selectedTask.description || '',
        status: 'bekliyor',
        priority: priority,
        createdBy: user.id,
        assignedTo: [user.id],
        visibleTo: [user.id],
        relatedToName: selectedTask.requesterName || '',
        mahalle: selectedTask.location?.split(',')[0]?.trim() || '',
        messages: [],
      });
      
      setShowAgendaModal(false);
      setSelectedTask(null);
      alert('Bekleyen iş başarıyla Gündem\'e aktarıldı!');
    } catch (error) {
      console.error('Aktarma hatası:', error);
      alert('Aktarma sırasında bir hata oluştu.');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-600" />
          Bekleyen İşler
        </h1>
        <button
          onClick={() => navigate('/pending/new')}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni</span>
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl p-3 shadow-sm space-y-3">
        {/* Görünüm Seçimi */}
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('bekleyen')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium ${
              viewMode === 'bekleyen' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Bekleyen
          </button>
          <button
            onClick={() => setViewMode('planlanmis')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium ${
              viewMode === 'planlanmis' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Planlanmış
          </button>
          <button
            onClick={() => setViewMode('tamamlanmis')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium ${
              viewMode === 'tamamlanmis' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tamamlanmış
          </button>
        </div>

        {/* Etiket/Tür Filtreleri */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter('tumu')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              typeFilter === 'tumu' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tümü ({typeCounts.tumu})
          </button>
          <button
            onClick={() => setTypeFilter('talep')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              typeFilter === 'talep' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            Talep ({typeCounts.talep})
          </button>
          <button
            onClick={() => setTypeFilter('dugun')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              typeFilter === 'dugun' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600'
            }`}
          >
            <Heart className="w-3 h-3" />
            Düğün ({typeCounts.dugun})
          </button>
          <button
            onClick={() => setTypeFilter('randevu')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              typeFilter === 'randevu' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'
            }`}
          >
            <Calendar className="w-3 h-3" />
            Randevu ({typeCounts.randevu})
          </button>
          <button
            onClick={() => setTypeFilter('gorev')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              typeFilter === 'gorev' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            Görev ({typeCounts.gorev})
          </button>
        </div>

        {/* Arama */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Görev Listesi */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {viewMode === 'bekleyen' ? 'Bekleyen görev bulunmuyor' :
             viewMode === 'planlanmis' ? 'Planlanmış görev bulunmuyor' :
             'Tamamlanmış görev bulunmuyor'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const daysElapsed = getDaysElapsed(task.createdAt);
            const isUrgent = daysElapsed >= 15;
            const typeInfo = getTypeInfo(task.type);
            const TypeIcon = typeInfo.icon;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border-l-4 ${typeInfo.border}`}
              >
                <div className="flex items-start gap-3">
                  {/* Sol - Görev Bilgileri */}
                  <button
                    onClick={() => navigate(`/pending/${task.id}`)}
                    className="flex-1 min-w-0 text-left overflow-hidden"
                  >
                    {/* Etiket + Geçen Gün */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeInfo.label}
                      </span>
                      {task.createdAt && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUrgent 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {daysElapsed} gün bekliyor
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    
                    {/* Açıklama */}
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-1 break-words whitespace-pre-wrap">{task.description}</p>
                    )}

                    {/* Kişi Bilgileri */}
                    <div className="mt-2 space-y-1">
                      {task.requesterName && (
                        <p className="text-sm text-gray-700 flex items-center gap-1">
                          <span className="text-gray-400">👤</span> {task.requesterName}
                        </p>
                      )}
                      {task.requesterPhone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="text-gray-400">📞</span> {task.requesterPhone}
                        </p>
                      )}
                      {/* Mahalle - telefon altında */}
                      {task.location && task.location.split(',')[0] && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="text-gray-400">📍</span> {task.location.split(',')[0].trim()}
                        </p>
                      )}
                    </div>

                    {/* Planlanmış tarih/saat */}
                    {task.scheduledDate && (
                      <div className="flex items-center gap-2 mt-2 text-blue-600 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(task.scheduledDate).toLocaleDateString('tr-TR')}
                          {task.scheduledTime && ` - ${task.scheduledTime}`}
                        </span>
                        {task.assignedToName && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            👤 {task.assignedToName}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Düğün/Randevu tarihi */}
                    {task.eventDate && (
                      <div className="flex items-center gap-2 mt-2 text-pink-600 text-xs">
                        {task.type === 'dugun' ? <Heart className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                        <span>
                          {new Date(task.eventDate).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          {task.eventTime && ` - ${task.eventTime}`}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Sağ - Aksiyonlar */}
                  <div className="flex flex-col items-end gap-2">
                    {/* Gündem'e Gönder butonu */}
                    <button
                      onClick={(e) => handleAgendaClick(e, task)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-green-600 text-[10px] font-medium"
                    >
                      <ClipboardList className="w-3 h-3" />
                      <span>Gündem'e Gönder</span>
                    </button>
                    
                    {/* Hızlı Planlama Butonları - Tüm kayıtlarda göster */}
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); addToSchedule(task, 'yarin'); }}
                        className="px-2 py-1 text-[10px] bg-blue-100 text-blue-600 rounded hover:bg-blue-200 active:scale-95"
                        title="Yarın programa ekle"
                      >
                        Yarın
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToSchedule(task, 'bu_hafta'); }}
                        className="px-2 py-1 text-[10px] bg-purple-100 text-purple-600 rounded hover:bg-purple-200 active:scale-95"
                        title="Bu hafta programa ekle"
                      >
                        Hafta
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToSchedule(task, 'bu_ay'); }}
                        className="px-2 py-1 text-[10px] bg-green-100 text-green-600 rounded hover:bg-green-200 active:scale-95"
                        title="Bu ay programa ekle"
                      >
                        Ay
                      </button>
                    </div>

                    {/* Düzenle ve Sil Butonları */}
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleEdit(task.id, e)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded active:scale-95"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-95"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Adres Detayı - sadece virgülden sonraki kısım */}
                    {task.location && task.location.includes(',') && task.location.split(',').slice(1).join(',').trim() && (
                      <div className="text-[10px] text-gray-500 text-left mt-1 w-[130px] line-clamp-3" title={task.location.split(',').slice(1).join(',').trim()}>
                        🏠 {task.location.split(',').slice(1).join(',').trim()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gündem'e Gönder Modal */}
      {showAgendaModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Gündem'e Gönder</h3>
            <p className="text-sm text-gray-500 mb-1">"{selectedTask.title}"</p>
            <p className="text-xs text-gray-400 mb-4">Hangi öncelik ile eklemek istiyorsunuz?</p>
            
            <div className="space-y-2">
              <button
                onClick={() => handleTransferToAgenda('acil')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">🔴</span>
                <span className="font-medium text-red-700">Acil</span>
              </button>
              
              <button
                onClick={() => handleTransferToAgenda('yuksek')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">🟠</span>
                <span className="font-medium text-orange-700">Yüksek</span>
              </button>
              
              <button
                onClick={() => handleTransferToAgenda('orta')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">🔵</span>
                <span className="font-medium text-blue-700">Orta</span>
              </button>
              
              <button
                onClick={() => handleTransferToAgenda('dusuk')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">⚪</span>
                <span className="font-medium text-gray-700">Düşük</span>
              </button>
            </div>

            <button
              onClick={() => { setShowAgendaModal(false); setSelectedTask(null); }}
              disabled={transferring}
              className="w-full mt-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg font-medium"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
