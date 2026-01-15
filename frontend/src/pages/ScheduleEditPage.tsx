import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Heart, MessageSquare, Calendar, Briefcase, FileText, MapPin, Clock, Save, Users, Search, Check, X } from 'lucide-react';
import { staffApi } from '../services/api';

type TaskType = 'talep' | 'dugun' | 'randevu' | 'gorev' | 'diger' | 'gunluk';

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

export default function ScheduleEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { scheduleItems, updateScheduleItem } = useData();
  const navigate = useNavigate();

  const [type, setType] = useState<TaskType>('gunluk');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<{id: string; name: string; title: string}[]>([]);
  const [assignedToList, setAssignedToList] = useState<string[]>([]);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');

  // Tür bilgileri
  const typeOptions = [
    { value: 'talep', label: 'Talep', icon: MessageSquare, color: 'bg-blue-100 text-blue-700 border-blue-300', activeColor: 'bg-blue-600 text-white' },
    { value: 'dugun', label: 'Düğün', icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-300', activeColor: 'bg-pink-600 text-white' },
    { value: 'randevu', label: 'Randevu', icon: Calendar, color: 'bg-green-100 text-green-700 border-green-300', activeColor: 'bg-green-600 text-white' },
    { value: 'gorev', label: 'Görev', icon: Briefcase, color: 'bg-purple-100 text-purple-700 border-purple-300', activeColor: 'bg-purple-600 text-white' },
    { value: 'gunluk', label: 'Günlük', icon: FileText, color: 'bg-gray-100 text-gray-700 border-gray-300', activeColor: 'bg-gray-600 text-white' },
  ];

  // Görevlileri yükle
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await staffApi.getAll();
        if (data) {
          setStaffList(data.filter((s: any) => s.isActive !== false).map((s: any) => ({
            id: s.id,
            name: s.name,
            title: s.title || s.role
          })));
        }
      } catch (error) {
        console.error('Görevliler yüklenirken hata:', error);
      }
    };
    loadStaff();
  }, []);

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

  // Mevcut veriyi yükle
  useEffect(() => {
    const item = scheduleItems.find(s => String(s.id) === String(id));
    if (item) {
      setType((item.type as TaskType) || 'gunluk');
      setTitle(item.title || '');
      setDescription(item.description || '');
      setLocation(item.location || '');
      
      // Tarih ve saat
      const itemDate = new Date(item.date);
      setSelectedDate(itemDate.toISOString().split('T')[0]);
      
      if (item.time) {
        setSelectedTime(item.time);
      } else {
        const hours = itemDate.getHours().toString().padStart(2, '0');
        const mins = itemDate.getMinutes() < 30 ? '00' : '30';
        setSelectedTime(`${hours}:${mins}`);
      }
      
      // assignedTo array olarak al
      if (Array.isArray(item.assignedTo)) {
        setAssignedToList(item.assignedTo);
      } else if (item.assignedTo) {
        setAssignedToList([item.assignedTo]);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, scheduleItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) {
      alert('Oturum hatası. Lütfen tekrar giriş yapın.');
      return;
    }

    try {
      // Tarih ve saat birleştir
      const [hours, mins] = selectedTime.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, mins, 0, 0);

      await updateScheduleItem(id, {
        title,
        description,
        type,
        date: newDate.toISOString(),
        time: selectedTime,
        location,
        assignedTo: assignedToList.length > 0 ? assignedToList : null,
        assignedToName: assignedToList.length > 0 ? getAssignedNames() : undefined,
        visibleTo: [...assignedToList, user.id],
      });

      alert('Kayıt başarıyla güncellendi!');
      navigate('/program');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Kayıt güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Kayıt bulunamadıysa
  if (!title && !loading) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
          Kayıt bulunamadı veya yüklenemedi.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      <h1 className="text-xl font-bold text-gray-800">Program Düzenle</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tür Seçimi */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-medium text-gray-700 mb-3 block">Kayıt Türü</label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map(opt => {
              const Icon = opt.icon;
              const isActive = type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value as TaskType)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    isActive ? opt.activeColor + ' border-transparent shadow-md' : opt.color
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarih ve Saat */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Tarih ve Saat
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tarih *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Saat *</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                required
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Başlık */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Başlık *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        {/* Açıklama */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Açıklama
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            rows={3}
          />
        </div>

        {/* Konum */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-indigo-500" />
            Konum
          </label>
          <textarea
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Adres bilgisi..."
            rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Görevliler - Çoklu Seçim */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Görevliler (Birden fazla seçilebilir)
          </label>
          <div
            onClick={() => setShowAssigneeModal(true)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer hover:border-indigo-400 transition-colors min-h-[40px]"
          >
            {assignedToList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {assignedToList.map(id => {
                  const staff = staffList.find(s => s.id === id);
                  return staff ? (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      {staff.name}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleAssignee(id); }}
                        className="hover:text-indigo-900"
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

        {/* Kaydet Butonu */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl font-medium transition-colors shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Kaydet
        </button>
      </form>

      {/* Görevli Seçim Modal */}
      {showAssigneeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
              <h3 className="font-semibold text-indigo-800">Görevli Seç</h3>
              <button onClick={() => { setShowAssigneeModal(false); setAssigneeSearchTerm(''); }}>
                <X className="w-6 h-6 text-indigo-600" />
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
                      assignedToList.includes(staff.id) ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{staff.name}</p>
                      {staff.title && <p className="text-sm text-gray-500">{staff.title}</p>}
                    </div>
                    {assignedToList.includes(staff.id) && (
                      <Check className="w-5 h-5 text-indigo-600" />
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
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium"
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
