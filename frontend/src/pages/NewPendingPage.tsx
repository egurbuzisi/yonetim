import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Heart, MessageSquare, Calendar, Briefcase, FileText, Clock, MapPin, User, Users, Phone, Mail, Home, Building, Car, Truck, AlertCircle, CheckCircle, Star, Gift, Coffee, Plus, Settings, X, Save, Trash2, Search, Check } from 'lucide-react';
import { YILDIRIM_MAHALLELERI } from '../constants/mahalleler';
import { taskTypesApi, staffApi } from '../services/api';

// İkon map
const ICONS: Record<string, any> = {
  MessageSquare, Heart, Calendar, Briefcase, FileText, Phone, Mail, User, Users, Home, Building, Car, Truck, AlertCircle, CheckCircle, Star, Gift, Coffee
};

// Renk seçenekleri
const COLOR_OPTIONS: Record<string, { bg: string; text: string; activeBg: string; border: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', activeBg: 'bg-blue-600', border: 'border-blue-300' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', activeBg: 'bg-pink-600', border: 'border-pink-300' },
  green: { bg: 'bg-green-100', text: 'text-green-700', activeBg: 'bg-green-600', border: 'border-green-300' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', activeBg: 'bg-purple-600', border: 'border-purple-300' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', activeBg: 'bg-orange-600', border: 'border-orange-300' },
  red: { bg: 'bg-red-100', text: 'text-red-700', activeBg: 'bg-red-600', border: 'border-red-300' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', activeBg: 'bg-cyan-600', border: 'border-cyan-300' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', activeBg: 'bg-yellow-600', border: 'border-yellow-300' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', activeBg: 'bg-gray-600', border: 'border-gray-300' },
};

export default function NewPendingPage() {
  const { user } = useAuth();
  const { addPendingTask, addScheduleItem, getFilteredScheduleItems } = useData();
  const navigate = useNavigate();

  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [type, setType] = useState('talep');
  
  // Hızlı tür yönetimi
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('FileText');
  const [newTypeColor, setNewTypeColor] = useState('gray');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [assignedToList, setAssignedToList] = useState<string[]>([]);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');
  const [schedulePeriod, setSchedulePeriod] = useState<'none' | 'custom' | 'yarin' | 'hafta' | 'ay'>('none');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

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

  // API'den türleri ve görevlileri yükle
  useEffect(() => {
    loadTaskTypes();
    staffApi.getAll().then(setStaffList).catch(console.error);
  }, []);

  const loadTaskTypes = async () => {
    try {
      const types = await taskTypesApi.getAll();
      setTaskTypes(types);
    } catch (error) {
      console.error('Türler yüklenirken hata:', error);
    }
  };

  // Görevli seçimini toggle et
  const toggleAssignee = (staffId: string) => {
    setAssignedToList(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  // Filtrelenmiş görevli listesi
  const filteredStaffList = staffList.filter(s =>
    s.name?.toLowerCase().includes(assigneeSearchTerm.toLowerCase()) ||
    s.title?.toLowerCase().includes(assigneeSearchTerm.toLowerCase())
  );

  // Seçili görevlilerin isimlerini al
  const getAssignedNames = () => {
    return assignedToList
      .map(id => staffList.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Hızlı tür ekleme
  const handleAddType = async () => {
    if (!newTypeLabel.trim()) return;
    try {
      await taskTypesApi.create({ label: newTypeLabel, icon: newTypeIcon, color: newTypeColor });
      await loadTaskTypes();
      setNewTypeLabel('');
      setNewTypeIcon('FileText');
      setNewTypeColor('gray');
      setShowTypeModal(false);
    } catch (error) {
      console.error('Tür eklenirken hata:', error);
    }
  };

  // Hızlı tür güncelleme
  const handleUpdateType = async () => {
    if (!editingType) return;
    try {
      await taskTypesApi.update(editingType.id, { 
        label: editingType.label, 
        icon: editingType.icon, 
        color: editingType.color 
      });
      await loadTaskTypes();
      setEditingType(null);
    } catch (error) {
      console.error('Tür güncellenirken hata:', error);
    }
  };

  // Hızlı tür silme
  const handleDeleteType = async (id: string) => {
    if (!confirm('Bu türü silmek istediğinize emin misiniz?')) return;
    try {
      await taskTypesApi.delete(id);
      await loadTaskTypes();
      if (type === id) setType('talep');
    } catch (error) {
      console.error('Tür silinirken hata:', error);
    }
  };

  // Dinamik tür seçenekleri
  const typeOptions = taskTypes.map(t => {
    const colorInfo = COLOR_OPTIONS[t.color] || COLOR_OPTIONS.gray;
    return {
      value: t.id,
      label: t.label,
      icon: ICONS[t.icon] || FileText,
      color: `${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`,
      activeColor: `${colorInfo.activeBg} text-white`
    };
  });

  // Placeholder metinleri
  const getTitlePlaceholder = () => {
    switch (type) {
      case 'talep': return 'Ör: Asfalt talebi';
      case 'dugun': return 'Ör: Ahmet Bey Düğün';
      case 'randevu': return 'Ör: Vatandaş görüşmesi';
      case 'gorev': return 'Ör: Rapor hazırlama';
      default: return 'Başlık giriniz';
    }
  };

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
    
    // Tüm slotlar doluysa son slottan sonrasını ver
    return '21:30';
  };

  // Tarih hesaplama
  const getTargetDate = (period: 'yarin' | 'hafta' | 'ay'): Date => {
    const now = new Date();
    switch (period) {
      case 'yarin':
        // Yarın: Bir sonraki gün
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      case 'hafta':
        // Hafta: Gelecek haftanın Pazartesi'si
        const nextMonday = new Date(now);
        const dayOfWeek = nextMonday.getDay();
        // Pazartesi = 1, Pazar = 0
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
        return nextMonday;
      case 'ay':
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let scheduledDate: Date | undefined;
    let scheduledTime: string | undefined;

    // Düğün ise otomatik olarak düğün tarihine programa ekle
    if (type === 'dugun' && eventDate) {
      scheduledDate = new Date(eventDate);
      scheduledTime = eventTime || '18:00';

      await addScheduleItem({
        title: `💒 ${title}`,
        description,
        type: 'dugun',
        status: 'planlanmis',
        date: scheduledDate,
        time: scheduledTime,
        location: neighborhood + (address ? ', ' + address : ''),
        createdBy: user.id,
        visibleTo: [...assignedToList, user.id],
        assignedTo: assignedToList.length > 0 ? assignedToList : undefined,
        assignedToName: assignedToList.length > 0 ? getAssignedNames() : undefined,
      });
    }
    // Randevu ise de programa ekle
    else if (type === 'randevu' && eventDate) {
      scheduledDate = new Date(eventDate);
      scheduledTime = eventTime || getNextAvailableTime(scheduledDate);

      await addScheduleItem({
        title: `📅 ${title}`,
        description,
        type: 'randevu',
        status: 'planlanmis',
        date: scheduledDate,
        time: scheduledTime,
        location: neighborhood + (address ? ', ' + address : ''),
        createdBy: user.id,
        visibleTo: [...assignedToList, user.id],
        assignedTo: assignedToList.length > 0 ? assignedToList : undefined,
        assignedToName: assignedToList.length > 0 ? getAssignedNames() : undefined,
      });
    }
    // Programa ekle seçildiyse - özel tarih/saat ile
    else if (schedulePeriod === 'custom' && scheduleDate) {
      scheduledDate = new Date(scheduleDate);
      scheduledTime = scheduleTime;

      await addScheduleItem({
        title,
        description,
        type: type || 'gorev',
        status: 'planlanmis',
        date: scheduledDate,
        time: scheduledTime,
        location: neighborhood + (address ? ', ' + address : ''),
        createdBy: user.id,
        visibleTo: [...assignedToList, user.id],
        assignedTo: assignedToList.length > 0 ? assignedToList : undefined,
        assignedToName: assignedToList.length > 0 ? getAssignedNames() : undefined,
      });
    }
    // Hızlı programa ekle seçenekleri
    else if (schedulePeriod !== 'none' && schedulePeriod !== 'custom') {
      scheduledDate = getTargetDate(schedulePeriod);
      scheduledTime = scheduleTime || getNextAvailableTime(scheduledDate);

      await addScheduleItem({
        title,
        description,
        type: type || 'gorev',
        status: 'planlanmis',
        date: scheduledDate,
        time: scheduledTime,
        location: neighborhood + (address ? ', ' + address : ''),
        createdBy: user.id,
        visibleTo: [...assignedToList, user.id],
        assignedTo: assignedToList.length > 0 ? assignedToList : undefined,
        assignedToName: assignedToList.length > 0 ? getAssignedNames() : undefined,
      });
    }

    await addPendingTask({
      title,
      description,
      type,
      status: 'beklemede',
      requesterName,
      requesterPhone,
      neighborhood,
      address,
      location: neighborhood + (address ? ', ' + address : ''),
      eventDate: eventDate || undefined,
      eventTime: eventTime || undefined,
      scheduledDate: scheduledDate?.toISOString(),
      scheduledTime,
      assignedTo: assignedToList.length > 0 ? assignedToList : [user.id],
      assignedToName: assignedToList.length > 0 ? getAssignedNames() : undefined,
      createdAt: new Date(),
      createdBy: user.id,
      visibleTo: [...assignedToList, user.id],
    });

    navigate('/pending');
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-24 px-1 sm:px-0">
      {/* Header - Mobile Sticky */}
      <div className="sticky top-0 bg-gray-50 -mx-1 px-1 py-2 sm:relative sm:bg-transparent sm:py-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 sm:gap-2 text-gray-600 active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Geri</span>
          </button>
          <h1 className="text-base sm:text-xl font-bold text-gray-800">Yeni Bekleyen İş</h1>
          <div className="w-14"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Tür Seçimi */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <label className="text-xs sm:text-sm font-medium text-gray-700">Kayıt Türü</label>
            <div className="flex gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => setShowTypeModal(true)}
                className="p-2 sm:p-1.5 text-orange-600 hover:bg-orange-50 active:bg-orange-100 rounded-lg transition-colors"
                title="Yeni Tür Ekle"
              >
                <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings/task-types')}
                className="p-2 sm:p-1.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                title="Türleri Yönet"
              >
                <Settings className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          {/* Horizontal Scroll on Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 scrollbar-hide">
            {typeOptions.map(opt => {
              const Icon = opt.icon;
              const isActive = type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  onDoubleClick={() => setEditingType(taskTypes.find(t => t.id === opt.value))}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all whitespace-nowrap flex-shrink-0 sm:flex-shrink active:scale-95 ${
                    isActive ? opt.activeColor + ' border-transparent shadow-md' : opt.color
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-2 hidden sm:block">💡 Düzenlemek için türe çift tıklayın</p>
        </div>

        {/* Hızlı Tür Ekleme Modal - Mobile Bottom Sheet */}
        {showTypeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-5 w-full sm:max-w-sm sm:mx-4 max-h-[85vh] overflow-y-auto animate-slide-up sm:animate-none">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base sm:text-lg">Yeni Kayıt Türü</h3>
                <button type="button" onClick={() => setShowTypeModal(false)} className="p-2 -mr-2 text-gray-400 active:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm text-gray-500 mb-1.5 block">Tür Adı</label>
                  <input
                    type="text"
                    value={newTypeLabel}
                    onChange={(e) => setNewTypeLabel(e.target.value)}
                    placeholder="Örn: Şikayet"
                    className="w-full px-3 py-3 sm:py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-500 mb-1.5 block">İkon</label>
                  <select
                    value={newTypeIcon}
                    onChange={(e) => setNewTypeIcon(e.target.value)}
                    className="w-full px-3 py-3 sm:py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {Object.keys(ICONS).map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-500 mb-1.5 block">Renk</label>
                  <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
                    {Object.keys(COLOR_OPTIONS).map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTypeColor(color)}
                        className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full ${COLOR_OPTIONS[color].activeBg} active:scale-90 transition-transform ${
                          newTypeColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddType}
                  className="w-full py-3.5 sm:py-2.5 bg-orange-600 text-white rounded-xl sm:rounded-lg font-medium active:bg-orange-700 transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hızlı Tür Düzenleme Modal - Mobile Bottom Sheet */}
        {editingType && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-5 w-full sm:max-w-sm sm:mx-4 max-h-[85vh] overflow-y-auto animate-slide-up sm:animate-none">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base sm:text-lg">Türü Düzenle</h3>
                <button type="button" onClick={() => setEditingType(null)} className="p-2 -mr-2 text-gray-400 active:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm text-gray-500 mb-1.5 block">Tür Adı</label>
                  <input
                    type="text"
                    value={editingType.label}
                    onChange={(e) => setEditingType({...editingType, label: e.target.value})}
                    className="w-full px-3 py-3 sm:py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-500 mb-1.5 block">İkon</label>
                  <select
                    value={editingType.icon}
                    onChange={(e) => setEditingType({...editingType, icon: e.target.value})}
                    className="w-full px-3 py-3 sm:py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {Object.keys(ICONS).map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-500 mb-1.5 block">Renk</label>
                  <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
                    {Object.keys(COLOR_OPTIONS).map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditingType({...editingType, color})}
                        className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full ${COLOR_OPTIONS[color].activeBg} active:scale-90 transition-transform ${
                          editingType.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteType(editingType.id)}
                    className="px-4 py-3 sm:py-2 text-red-600 bg-red-50 rounded-xl sm:rounded-lg flex items-center justify-center gap-1.5 active:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Sil</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateType}
                    className="flex-1 py-3 sm:py-2 bg-orange-600 text-white rounded-xl sm:rounded-lg font-medium flex items-center justify-center gap-1.5 active:bg-orange-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Kaydet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Başlık */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            <FileText className="w-4 h-4 text-orange-500" />
            Başlık *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={getTitlePlaceholder()}
            className="w-full px-3 sm:px-4 py-3 sm:py-3 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            required
          />
        </div>

        {/* Açıklama */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            <FileText className="w-4 h-4 text-orange-500" />
            Açıklama
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detaylı açıklama yazın..."
            className="w-full px-3 sm:px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            rows={3}
          />
        </div>

        {/* Talep Eden / Kişi Bilgileri */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-800 flex items-center gap-2 text-sm sm:text-base">
            <User className="w-4 h-4 text-orange-500" />
            {type === 'dugun' ? 'Davet Eden Bilgileri' : type === 'randevu' ? 'Randevu Sahibi' : 'Talep Eden Bilgileri'}
          </h3>
          
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ad Soyad *</label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder={type === 'dugun' ? 'Damat veya gelin adı' : 'Kişi adı'}
                className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Telefon</label>
              <input
                type="tel"
                value={requesterPhone}
                onChange={(e) => setRequesterPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tarih/Saat - Düğün için zorunlu, diğerleri için opsiyonel */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-800 flex items-center gap-2 text-sm sm:text-base">
            <Calendar className={`w-4 h-4 ${type === 'dugun' ? 'text-pink-500' : 'text-orange-500'}`} />
            {type === 'dugun' ? 'Düğün Tarihi & Saati *' : 
             type === 'randevu' ? 'Randevu Tarihi & Saati' : 
             'Tarih & Saat (Opsiyonel)'}
          </h3>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tarih {type === 'dugun' ? '*' : ''}
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={`w-full px-2 sm:px-3 py-3 sm:py-2.5 border rounded-lg text-sm outline-none focus:ring-2 ${
                  type === 'dugun' ? 'focus:ring-pink-500' : 'focus:ring-orange-500'
                }`}
                required={type === 'dugun'}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Saat</label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className={`w-full px-2 sm:px-3 py-3 sm:py-2.5 border rounded-lg text-sm outline-none focus:ring-2 ${
                  type === 'dugun' ? 'focus:ring-pink-500' : 'focus:ring-orange-500'
                }`}
              />
            </div>
          </div>
          {type === 'dugun' && (
            <p className="text-[10px] sm:text-xs text-pink-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Düğün tarihi programa otomatik eklenecek
            </p>
          )}
          {type === 'randevu' && eventDate && (
            <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Randevu programa otomatik eklenecek
            </p>
          )}
        </div>

        {/* Konum */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 text-orange-500" />
            {type === 'dugun' ? 'Düğün Yeri' : 'Konum Bilgileri'}
          </label>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mahalle</label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Mahalle seçin...</option>
              {YILDIRIM_MAHALLELERI.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {type === 'dugun' ? 'Salon / Mekan' : 'Adres Detayı'}
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={type === 'dugun' ? 'Ör: Kültür Merkezi Düğün Salonu' : 'Sokak, cadde, bina no, daire no vb.'}
              rows={3}
              className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Görevli Atama - Çoklu Seçim */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            <Users className="w-4 h-4 text-orange-500" />
            Görevli Ata (Birden fazla seçilebilir)
          </label>
          <div
            onClick={() => setShowAssigneeModal(true)}
            className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm bg-white cursor-pointer hover:border-orange-400 transition-colors"
          >
            {assignedToList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {assignedToList.map(id => {
                  const staff = staffList.find(s => s.id === id);
                  return staff ? (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                      {staff.name}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleAssignee(id); }}
                        className="hover:text-orange-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            ) : (
              <span className="text-gray-400">Görevli seçmek için tıklayın...</span>
            )}
          </div>
          {assignedToList.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{assignedToList.length} görevli seçildi</p>
          )}
        </div>

        {/* Programa Ekle - Tüm türler için */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Programa Ekle
            </label>
            
            {/* Hızlı Seçenekler */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setSchedulePeriod('none')}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                  schedulePeriod === 'none'
                    ? 'bg-gray-200 text-gray-700 ring-2 ring-offset-1 ring-gray-400'
                    : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}
              >
                Ekleme
              </button>
              <button
                type="button"
                onClick={() => setSchedulePeriod('custom')}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                  schedulePeriod === 'custom'
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-offset-1 ring-indigo-400'
                    : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}
              >
                Tarih Seç
              </button>
              <button
                type="button"
                onClick={() => setSchedulePeriod('yarin')}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                  schedulePeriod === 'yarin'
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-offset-1 ring-blue-400'
                    : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}
              >
                Yarın
              </button>
              <button
                type="button"
                onClick={() => setSchedulePeriod('hafta')}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                  schedulePeriod === 'hafta'
                    ? 'bg-purple-100 text-purple-700 ring-2 ring-offset-1 ring-purple-400'
                    : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}
              >
                Bu Hafta
              </button>
              <button
                type="button"
                onClick={() => setSchedulePeriod('ay')}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                  schedulePeriod === 'ay'
                    ? 'bg-green-100 text-green-700 ring-2 ring-offset-1 ring-green-400'
                    : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}
              >
                Bu Ay
              </button>
            </div>

            {/* Tarih Seç seçildiyse tarih ve saat girişi */}
            {schedulePeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tarih *</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required={schedulePeriod === 'custom'}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Saat *</label>
                  <select
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Hızlı seçenekler için saat seçimi */}
            {(schedulePeriod === 'yarin' || schedulePeriod === 'hafta' || schedulePeriod === 'ay') && (
              <div className="pt-2 border-t">
                <label className="block text-xs text-gray-500 mb-1">Saat</label>
                <select
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  {schedulePeriod === 'yarin' && '📅 Yarın için programa eklenecek'}
                  {schedulePeriod === 'hafta' && '📅 Gelecek Pazartesi için programa eklenecek'}
                  {schedulePeriod === 'ay' && '📅 Gelecek ayın ilk iş günü için programa eklenecek'}
                </p>
              </div>
            )}
          </div>

        {/* Kaydet Butonu - Fixed on Mobile */}
        <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/80 backdrop-blur-sm border-t sm:relative sm:bottom-auto sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0">
          <button
            type="submit"
            className={`w-full py-3.5 sm:py-4 rounded-xl font-medium transition-colors shadow-lg active:scale-[0.98] ${
              type === 'dugun' ? 'bg-pink-600 active:bg-pink-700 text-white' :
              type === 'randevu' ? 'bg-green-600 active:bg-green-700 text-white' :
              type === 'gorev' ? 'bg-purple-600 active:bg-purple-700 text-white' :
              'bg-orange-600 active:bg-orange-700 text-white'
            }`}
          >
            Kaydet
          </button>
        </div>
      </form>

      {/* Görevli Seçim Modal */}
      {showAssigneeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-orange-50">
              <h3 className="font-semibold text-orange-800">Görevli Seç</h3>
              <button onClick={() => { setShowAssigneeModal(false); setAssigneeSearchTerm(''); }}>
                <X className="w-6 h-6 text-orange-600" />
              </button>
            </div>
            
            {/* Arama */}
            <div className="p-3 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={assigneeSearchTerm}
                  onChange={(e) => setAssigneeSearchTerm(e.target.value)}
                  placeholder="Görevli ara..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            
            {/* Liste */}
            <div className="overflow-y-auto max-h-[50vh]">
              {filteredStaffList.length > 0 ? (
                filteredStaffList.map(staff => (
                  <div
                    key={staff.id}
                    onClick={() => toggleAssignee(staff.id)}
                    className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      assignedToList.includes(staff.id) ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{staff.name}</p>
                      {staff.title && <p className="text-sm text-gray-500">{staff.title}</p>}
                    </div>
                    {assignedToList.includes(staff.id) && (
                      <Check className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">Görevli bulunamadı</p>
              )}
            </div>
            
            {/* Tamam Butonu */}
            <div className="p-4 border-t">
              <button
                onClick={() => { setShowAssigneeModal(false); setAssigneeSearchTerm(''); }}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium"
              >
                Tamam ({assignedToList.length} görevli seçili)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
