import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Calendar, GripVertical, Edit2, Trash2, Undo2, Plus, X } from 'lucide-react';
import type { ScheduleItem } from '../../types';

// Sabit saat dilimleri (08:00-21:30, 30dk aralık)
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30',
];

type ViewType = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth';

const VIEW_OPTIONS: { id: ViewType; label: string }[] = [
  { id: 'today', label: 'Bugün' },
  { id: 'tomorrow', label: 'Yarın' },
  { id: 'thisWeek', label: 'Hafta' },
  { id: 'nextWeek', label: 'Gelecek Hafta' },
  { id: 'thisMonth', label: 'Bu Ay' },
];

export default function ProgramPage() {
  const { user } = useAuth();
  const { getFilteredScheduleItems, updateScheduleItem, deleteScheduleItem, addPendingTask, addScheduleItem } = useData();
  const navigate = useNavigate();
  
  const [view, setView] = useState<ViewType>('today');
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; time: string } | null>(null);
  
  // Hızlı ekleme modalı
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newType, setNewType] = useState('gunluk');

  const items = user ? getFilteredScheduleItems(user.id, user.role) : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Bugün/Yarın için detaylı, Hafta/Ay için kompakt
  const isDetailedView = view === 'today' || view === 'tomorrow';

  const getDateRange = (): Date[] => {
    const dates: Date[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (view) {
      case 'today':
        dates.push(new Date(now));
        break;
      case 'tomorrow':
        const tmrw = new Date(now);
        tmrw.setDate(tmrw.getDate() + 1);
        dates.push(tmrw);
        break;
      case 'thisWeek':
        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() + i);
          dates.push(d);
        }
        break;
      case 'nextWeek':
        const nextMonday = new Date(now);
        const dayOfWeek = nextMonday.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
        for (let i = 0; i < 7; i++) {
          const d = new Date(nextMonday);
          d.setDate(d.getDate() + i);
          dates.push(d);
        }
        break;
      case 'thisMonth':
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        for (let d = new Date(now); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d));
        }
        break;
    }
    return dates;
  };

  const dateRange = getDateRange();

  // Item'ın saatini al (time veya startTime veya date'den)
  const getItemTime = (item: ScheduleItem): string => {
    if (item.time) return item.time;
    if (item.startTime) return item.startTime;
    const itemDate = new Date(item.date);
    const hours = itemDate.getHours().toString().padStart(2, '0');
    const mins = itemDate.getMinutes() < 30 ? '00' : '30';
    return `${hours}:${mins}`;
  };

  // Belirli tarih ve saat için öğeleri getir
  const getItemsForSlot = (date: Date, time: string): ScheduleItem[] => {
    return items.filter(item => {
      const itemDate = new Date(item.date);
      const itemDateOnly = new Date(itemDate);
      itemDateOnly.setHours(0, 0, 0, 0);
      
      const targetDateOnly = new Date(date);
      targetDateOnly.setHours(0, 0, 0, 0);
      
      if (itemDateOnly.getTime() !== targetDateOnly.getTime()) return false;
      
      const itemTime = getItemTime(item);
      return itemTime === time;
    });
  };

  // Tarihe göre tüm öğeleri getir (kompakt görünüm için)
  const getItemsForDate = (date: Date): ScheduleItem[] => {
    return items.filter(item => {
      const itemDate = new Date(item.date);
      const itemDateOnly = new Date(itemDate);
      itemDateOnly.setHours(0, 0, 0, 0);
      
      const targetDateOnly = new Date(date);
      targetDateOnly.setHours(0, 0, 0, 0);
      
      return itemDateOnly.getTime() === targetDateOnly.getTime();
    }).sort((a, b) => {
      const timeA = getItemTime(a);
      const timeB = getItemTime(b);
      return timeA.localeCompare(timeB);
    });
  };

  const formatDate = (date: Date) => {
    if (date.toDateString() === today.toDateString()) return 'Bugün';
    const tmrw = new Date(today);
    tmrw.setDate(tmrw.getDate() + 1);
    if (date.toDateString() === tmrw.toDateString()) return 'Yarın';
    return date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Sürükle-bırak
  const handleDragStart = (e: React.DragEvent, item: ScheduleItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    setDragOverSlot({ date: date.toISOString(), time });
  };

  const handleDrop = async (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newDate = new Date(date);
    const [hours, mins] = time.split(':').map(Number);
    newDate.setHours(hours, mins, 0, 0);

    await updateScheduleItem(draggedItem.id, {
      date: newDate,
      time: time,
    });

    setDraggedItem(null);
    setDragOverSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  // Program'dan Bekleyen'e geri gönder
  const sendToPending = async (item: ScheduleItem) => {
    if (!confirm(`"${item.title}" bekleyen işlere geri gönderilsin mi?`)) return;
    
    try {
      await addPendingTask({
        title: item.title,
        description: item.description || '',
        type: item.type || 'talep',
        status: 'beklemede',
        requesterName: '',
        requesterPhone: '',
        location: item.location || '',
        createdBy: parseInt(user?.id || '1'),
        visibleTo: [user?.id || '1'],
        assignedTo: item.assignedTo ? [item.assignedTo] : [],
      });
      
      await deleteScheduleItem(item.id);
      alert('Bekleyen işlere gönderildi!');
    } catch (error) {
      console.error('Hata:', error);
      alert('Bir hata oluştu.');
    }
  };

  const editItem = (item: ScheduleItem) => {
    navigate(`/program/${item.id}/edit`);
  };

  const deleteItem = async (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      await deleteScheduleItem(id);
    }
  };

  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  // Sonraki uygun saati bul
  const getNextAvailableTimeForDate = (targetDate: Date): string => {
    const sameDayItems = items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.toDateString() === targetDate.toDateString();
    });
    
    if (sameDayItems.length === 0) return '08:00';
    
    const busyTimes = new Set(sameDayItems.map(item => getItemTime(item)));
    
    for (const slot of TIME_SLOTS) {
      if (!busyTimes.has(slot)) {
        return slot;
      }
    }
    
    return '21:30';
  };

  // Hızlı ekleme
  const handleQuickAdd = async () => {
    if (!user || !newTitle.trim() || !newDate) return;
    
    try {
      const scheduleDate = new Date(newDate);
      const [hours, mins] = newTime.split(':').map(Number);
      scheduleDate.setHours(hours, mins, 0, 0);
      
      await addScheduleItem({
        title: newTitle.trim(),
        description: '',
        type: newType,
        status: 'planlanmis',
        date: scheduleDate,
        time: newTime,
        location: '',
        createdBy: user.id,
        visibleTo: [user.id],
      });
      
      setShowAddModal(false);
      setNewTitle('');
      setNewDate('');
      setNewTime('09:00');
      setNewType('gunluk');
    } catch (error) {
      console.error('Ekleme hatası:', error);
      alert('Eklenirken bir hata oluştu.');
    }
  };

  const openAddModal = () => {
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];
    setNewDate(todayStr);
    setNewTime(getNextAvailableTimeForDate(todayDate));
    setShowAddModal(true);
  };

  // Saat slotu arka plan rengi
  const getSlotBgColor = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 10) return 'bg-amber-50';
    if (hour < 12) return 'bg-green-50';
    if (hour < 14) return 'bg-yellow-50';
    if (hour < 17) return 'bg-blue-50';
    return 'bg-purple-50';
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Program
            <span className="text-xs font-normal text-gray-400">({items.length} kayıt)</span>
          </h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ekle
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {VIEW_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setView(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                view === opt.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hızlı Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Programa Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tür</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'gunluk', label: '📋 Günlük', color: 'bg-gray-100 text-gray-700' },
                    { value: 'talep', label: '📝 Talep', color: 'bg-blue-100 text-blue-700' },
                    { value: 'randevu', label: '📅 Randevu', color: 'bg-green-100 text-green-700' },
                    { value: 'dugun', label: '💒 Düğün', color: 'bg-pink-100 text-pink-700' },
                  ].map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setNewType(t.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        newType === t.value ? t.color + ' ring-2 ring-offset-1 ring-indigo-400' : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Başlık *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Etkinlik adı..."
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tarih *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Saat *</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleQuickAdd}
                disabled={!newTitle.trim() || !newDate}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUGÜN / YARIN - Detaylı Saat Slotları */}
      {isDetailedView && dateRange.map((date, dateIdx) => (
        <div key={dateIdx} className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Başlık */}
          <div className={`px-4 py-3 ${isToday(date) ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'}`}>
            <h2 className="font-bold">{formatDate(date)}</h2>
            <p className="text-xs opacity-80">
              {date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          {/* Saat Slotları */}
          <div className="divide-y">
            {TIME_SLOTS.map((time) => {
              const slotItems = getItemsForSlot(date, time);
              const isDropTarget = dragOverSlot?.date === date.toISOString() && dragOverSlot?.time === time;
              
              return (
                <div 
                  key={time}
                  className={`flex ${getSlotBgColor(time)} ${isDropTarget ? 'ring-2 ring-indigo-400 ring-inset' : ''}`}
                  onDragOver={(e) => handleDragOver(e, date, time)}
                  onDrop={(e) => handleDrop(e, date, time)}
                >
                  <div className="w-16 flex-shrink-0 py-2 px-2 text-xs font-bold text-gray-600 border-r bg-white/50">
                    {time}
                  </div>
                  
                  <div className="flex-1 min-h-[44px] p-1">
                    {slotItems.length > 0 && (
                      <div className="space-y-1">
                        {slotItems.map(item => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                            className="group flex items-start gap-3 bg-white rounded-lg p-2 cursor-move hover:shadow-md transition-all border border-gray-100"
                          >
                            <GripVertical className="w-4 h-4 text-gray-300 cursor-grab mt-1 flex-shrink-0" />
                            
                            {/* Sol: Başlık + Açıklama + Mahalle */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-800 text-sm">{item.title}</div>
                              {item.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              {item.location && item.location.split(',')[0] && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  📍 {item.location.split(',')[0].trim()}
                                </p>
                              )}
                            </div>
                            
                            {/* Sağ: Adres + Tür Etiketi */}
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                              {/* Adres Detayı */}
                              {item.location && item.location.includes(',') && item.location.split(',').slice(1).join(',').trim() && (
                                <p className="text-[11px] text-pink-400 max-w-[120px] text-right truncate" title={item.location.split(',').slice(1).join(',').trim()}>
                                  🏠 {item.location.split(',').slice(1).join(',').trim()}
                                </p>
                              )}
                              {/* Tür Etiketi */}
                              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                item.type === 'dugun' ? 'bg-pink-100 text-pink-600' :
                                item.type === 'randevu' ? 'bg-green-100 text-green-600' :
                                item.type === 'talep' ? 'bg-blue-100 text-blue-600' :
                                item.type === 'gorev' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {item.type === 'dugun' ? '💒 Düğün' : 
                                 item.type === 'randevu' ? '📅 Randevu' : 
                                 item.type === 'talep' ? '📝 Talep' : 
                                 item.type === 'gorev' ? '✅ Görev' : 
                                 '📋 Diğer'}
                              </div>
                            </div>
                            
                            {/* Butonlar - Hover */}
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button onClick={() => sendToPending(item)} className="p-1 hover:bg-orange-100 rounded" title="Bekleyen'e Gönder">
                                <Undo2 className="w-3.5 h-3.5 text-orange-500" />
                              </button>
                              <button onClick={() => editItem(item)} className="p-1 hover:bg-blue-100 rounded" title="Düzenle">
                                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              </button>
                              <button onClick={() => deleteItem(item.id)} className="p-1 hover:bg-red-100 rounded" title="Sil">
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* HAFTA / AY - Kompakt Liste (Sürükle-Bırak Destekli) */}
      {!isDetailedView && (
        <div className="space-y-2">
          {dateRange.map((date, dateIdx) => {
            const dayItems = getItemsForDate(date);
            const isDropTarget = dragOverSlot?.date === date.toISOString();
            
            return (
              <div 
                key={dateIdx} 
                className={`bg-white rounded-lg shadow-sm overflow-hidden ${isToday(date) ? 'ring-2 ring-indigo-500' : ''} ${isDropTarget ? 'ring-2 ring-green-400' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  // Gün üzerine gelince ilk boş saati hedef al
                  const nextTime = getNextAvailableTimeForDate(date);
                  setDragOverSlot({ date: date.toISOString(), time: nextTime });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!draggedItem) return;
                  const nextTime = getNextAvailableTimeForDate(date);
                  handleDrop(e, date, nextTime);
                }}
              >
                {/* Gün Başlığı - Kompakt */}
                <div className={`px-3 py-1.5 flex items-center justify-between ${isToday(date) ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{formatDate(date)}</span>
                    <span className="text-xs opacity-70">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
                  </div>
                  {dayItems.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isToday(date) ? 'bg-white/20' : 'bg-indigo-100 text-indigo-700'}`}>
                      {dayItems.length}
                    </span>
                  )}
                </div>
                
                {/* Etkinlikler */}
                {dayItems.length > 0 ? (
                  <div className="p-1.5 space-y-1">
                    {dayItems.map((item, itemIdx) => {
                      const timeStr = getItemTime(item);
                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverSlot({ date: date.toISOString(), time: timeStr });
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!draggedItem || draggedItem.id === item.id) return;
                            // Bırakılan kartın saatine taşı
                            handleDrop(e, date, timeStr);
                          }}
                          className={`group flex items-start gap-2 bg-white rounded-lg p-2 hover:shadow-sm cursor-move border border-gray-100 ${
                            dragOverSlot?.date === date.toISOString() && dragOverSlot?.time === timeStr ? 'ring-2 ring-green-300' : ''
                          }`}
                        >
                          {/* Sürükleme tutacağı + Saat */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <GripVertical className="w-3 h-3 text-gray-300 cursor-grab" />
                            <span className="text-xs font-bold text-gray-400 w-10">{timeStr}</span>
                          </div>
                          
                          {/* Başlık + Açıklama + Mahalle */}
                          <div className="flex-1 min-w-0" onClick={() => editItem(item)}>
                            <div className="font-semibold text-gray-800 text-xs">{item.title}</div>
                            {item.description && (
                              <p className="text-[10px] text-gray-500 line-clamp-1">{item.description}</p>
                            )}
                            {item.location && item.location.split(',')[0] && (
                              <p className="text-[10px] text-red-500 mt-0.5">
                                📍 {item.location.split(',')[0].trim()}
                              </p>
                            )}
                          </div>
                          
                          {/* Sağ: Adres + Tür */}
                          <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                            {item.location && item.location.includes(',') && item.location.split(',').slice(1).join(',').trim() && (
                              <p className="text-[10px] text-pink-400 max-w-[80px] text-right truncate">
                                🏠 {item.location.split(',').slice(1).join(',').trim()}
                              </p>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              item.type === 'dugun' ? 'bg-pink-100 text-pink-600' :
                              item.type === 'randevu' ? 'bg-green-100 text-green-600' :
                              item.type === 'talep' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {item.type === 'dugun' ? '💒 Düğün' : 
                               item.type === 'randevu' ? '📅 Randevu' : 
                               item.type === 'talep' ? '📝 Talep' : 
                               '📋 Diğer'}
                            </span>
                          </div>
                          
                          {/* Butonlar - Hover */}
                          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button 
                              onClick={(e) => { e.stopPropagation(); sendToPending(item); }} 
                              className="p-0.5 hover:bg-orange-100 rounded"
                            >
                              <Undo2 className="w-3 h-3 text-orange-500" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} 
                              className="p-0.5 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div 
                    className={`px-3 py-3 text-[10px] text-gray-400 text-center ${isDropTarget ? 'bg-green-50' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverSlot({ date: date.toISOString(), time: '08:00' });
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!draggedItem) return;
                      handleDrop(e, date, '08:00');
                    }}
                  >
                    {isDropTarget ? '📥 Buraya bırak' : 'Etkinlik yok'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


      {items.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz program bulunmuyor</p>
          <p className="text-xs text-gray-400 mt-2">Bekleyen işlerden programa ekleyebilirsiniz</p>
        </div>
      )}
    </div>
  );
}
