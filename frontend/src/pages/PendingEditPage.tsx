import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Heart, MessageSquare, Calendar, Briefcase, FileText, MapPin, User, Users, Save, Search, Check, X } from 'lucide-react';
import { YILDIRIM_MAHALLELERI } from '../constants/mahalleler';
import { staffApi } from '../services/api';

type TaskType = 'talep' | 'dugun' | 'randevu' | 'gorev' | 'diger';

export default function PendingEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { pendingTasks, updatePendingTask } = useData();
  const navigate = useNavigate();

  const [type, setType] = useState<TaskType>('talep');
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
  const [status, setStatus] = useState('beklemede');
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<{id: string; name: string; title: string}[]>([]);

  // Tür bilgileri
  const typeOptions = [
    { value: 'talep', label: 'Talep', icon: MessageSquare, color: 'bg-blue-100 text-blue-700 border-blue-300', activeColor: 'bg-blue-600 text-white' },
    { value: 'dugun', label: 'Düğün Daveti', icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-300', activeColor: 'bg-pink-600 text-white' },
    { value: 'randevu', label: 'Randevu', icon: Calendar, color: 'bg-green-100 text-green-700 border-green-300', activeColor: 'bg-green-600 text-white' },
    { value: 'gorev', label: 'Görev', icon: Briefcase, color: 'bg-purple-100 text-purple-700 border-purple-300', activeColor: 'bg-purple-600 text-white' },
    { value: 'diger', label: 'Diğer', icon: FileText, color: 'bg-gray-100 text-gray-700 border-gray-300', activeColor: 'bg-gray-600 text-white' },
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

  // Mevcut veriyi yükle
  useEffect(() => {
    const task = pendingTasks.find(t => String(t.id) === String(id));
    if (task) {
      setType(task.type || 'talep');
      setTitle(task.title || '');
      setDescription(task.description || '');
      setRequesterName(task.requesterName || '');
      setRequesterPhone(task.requesterPhone || '');
      
      // Location'dan mahalle ve adres çıkar
      if (task.location) {
        const parts = task.location.split(', ');
        setNeighborhood(parts[0] || '');
        setAddress(parts.slice(1).join(', ') || '');
      } else {
        setNeighborhood('');
        setAddress('');
      }
      
      // scheduledDate'den tarih ve saat çıkar
      if (task.scheduledDate) {
        const dateObj = new Date(task.scheduledDate);
        setEventDate(dateObj.toISOString().split('T')[0]);
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        if (hours !== '00' || minutes !== '00') {
          setEventTime(`${hours}:${minutes}`);
        } else {
          setEventTime('');
        }
      } else {
        setEventDate('');
        setEventTime('');
      }
      
      // assignedTo array olarak al
      if (Array.isArray(task.assignedTo)) {
        setAssignedToList(task.assignedTo);
      } else if (task.assignedTo) {
        setAssignedToList([task.assignedTo]);
      }
      setStatus(task.status || 'beklemede');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, pendingTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) {
      alert('Oturum hatası. Lütfen tekrar giriş yapın.');
      return;
    }

    // Seçili görevlilerin isimlerini al
    const getAssignedNames = () => {
      return assignedToList
        .map(id => staffList.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join(', ');
    };

    try {
      // Backend'e gönderilecek veri
      const updateData: any = {
        title,
        description,
        type,
        status,
        requesterName,
        requesterPhone,
        location: neighborhood + (address ? ', ' + address : ''),
        assignedTo: assignedToList.length > 0 ? assignedToList : [],
        assignedToName: assignedToList.length > 0 ? getAssignedNames() : undefined,
        visibleTo: [...assignedToList, user.id],
      };

      // Düğün/Randevu tarihi varsa scheduledDate olarak gönder
      if (eventDate) {
        updateData.scheduledDate = eventDate + (eventTime ? `T${eventTime}:00` : 'T00:00:00');
      }

      await updatePendingTask(id, updateData);

      alert('Kayıt başarıyla güncellendi!');
      navigate('/pending');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Kayıt güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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

      <h1 className="text-xl font-bold text-gray-800">Bekleyen İş Düzenle</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Durum */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-medium text-gray-700 mb-3 block">Durum</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus('beklemede')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                status === 'beklemede' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Beklemede
            </button>
            <button
              type="button"
              onClick={() => setStatus('tamamlandi')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                status === 'tamamlandi' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Tamamlandı
            </button>
            <button
              type="button"
              onClick={() => setStatus('iptal')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                status === 'iptal' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              İptal
            </button>
          </div>
        </div>

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

        {/* Başlık */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-orange-500" />
            Başlık *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            required
          />
        </div>

        {/* Açıklama */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-orange-500" />
            Açıklama
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            rows={3}
          />
        </div>

        {/* Talep Eden Bilgileri */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            Kişi Bilgileri
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ad Soyad</label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Telefon</label>
              <input
                type="tel"
                value={requesterPhone}
                onChange={(e) => setRequesterPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Düğün/Randevu Tarihi */}
        {(type === 'dugun' || type === 'randevu') && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-500" />
              {type === 'dugun' ? 'Düğün Tarihi' : 'Randevu Tarihi'}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tarih</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Saat</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Konum */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 text-orange-500" />
            Konum
          </label>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mahalle</label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Mahalle seçin...</option>
              {YILDIRIM_MAHALLELERI.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Adres Detayı</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Sokak, cadde, bina no, daire no vb..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Görevli Atama - Çoklu Seçim */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Users className="w-4 h-4 text-orange-500" />
            Görevliler (Birden fazla seçilebilir)
          </label>
          <div
            onClick={() => setShowAssigneeModal(true)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer hover:border-orange-400 transition-colors min-h-[40px]"
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

        {/* Kaydet Butonu */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl font-medium transition-colors shadow-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Kaydet
        </button>
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
