import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData, allUsers } from '../contexts/DataContext';
import { ArrowLeft, Save, X, Check, Trash2, Users, Tag, MapPin, User, Search } from 'lucide-react';
import { YILDIRIM_MAHALLELERI } from '../constants/mahalleler';
import { AGENDA_TAGS } from '../constants/agendaTags';
import { staffApi } from '../services/api';

export default function AgendaEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { agendas, updateAgenda, deleteAgenda } = useData();
  const navigate = useNavigate();

  const agenda = agendas.find(a => a.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('bekliyor');
  const [priority, setPriority] = useState('orta');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [mahalle, setMahalle] = useState('');
  const [relatedTo, setRelatedTo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Staff listesi
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Staff listesini yükle
  useEffect(() => {
    staffApi.getAll()
      .then(data => setStaffList(data))
      .catch(err => {
        console.error('Staff yüklenemedi:', err);
        setStaffList(allUsers);
      });
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  useEffect(() => {
    if (agenda) {
      setTitle(agenda.title || '');
      setDescription(agenda.description || '');
      setStatus(agenda.status || 'bekliyor');
      setPriority(agenda.priority || 'orta');
      setMahalle(agenda.mahalle || '');
      setRelatedTo(agenda.relatedTo || '');
      setSelectedTags(agenda.tags || []);
      if (agenda.meetingDate) {
        const date = new Date(agenda.meetingDate);
        setMeetingDate(date.toISOString().split('T')[0]);
        setMeetingTime(date.toTimeString().slice(0, 5));
      }
      setSelectedUsers(agenda.visibleTo || []);
    }
  }, [agenda]);

  if (!agenda) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Gündem bulunamadı</p>
        <button onClick={() => navigate('/agenda')} className="mt-4 text-green-600">
          Gündemlere dön
        </button>
      </div>
    );
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;

    let meetingDateTime: Date | undefined;
    if (meetingDate) {
      meetingDateTime = new Date(`${meetingDate}T${meetingTime || '09:00'}`);
    }

    // Seçilen kişinin adını bul
    const relatedUser = staffList.find(u => u.id === relatedTo);

    await updateAgenda(agenda.id, {
      title,
      description,
      status: status as any,
      priority: priority as any,
      meetingDate: meetingDateTime,
      mahalle,
      tags: selectedTags,
      relatedTo: relatedTo || undefined,
      relatedToName: relatedUser?.name || undefined,
      visibleTo: selectedUsers.length > 0 ? selectedUsers : [user.id],
    });

    navigate(`/agenda/${id}`);
  };

  const handleDelete = async () => {
    await deleteAgenda(agenda.id);
    navigate('/agenda');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      baskan: 'Başkan',
      baskan_yrd: 'Başkan Yardımcısı',
      ozel_kalem: 'Özel Kalem',
      mudur: 'Müdür',
      meclis_uyesi: 'Meclis Üyesi',
      personel: 'Personel',
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Gündem Düzenle</h1>
        <button onClick={handleSubmit} className="p-1">
          <Save className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Gündem Başlığı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gündem Başlığı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Gündem başlığını girin..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
            required
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Gündem açıklaması..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
            rows={4}
          />
        </div>

        {/* Kim ile ilgili */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Kim ile ilgili?
          </label>
          <select
            value={relatedTo}
            onChange={(e) => setRelatedTo(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white appearance-none"
          >
            <option value="">Kişi seçin...</option>
            {staffList.map(u => (
              <option key={u.id} value={u.id}>{u.name} - {u.title || getRoleLabel(u.role)}</option>
            ))}
          </select>
        </div>

        {/* Etiketler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Gündem Etiketi
          </label>
          <div className="flex flex-wrap gap-2">
            {AGENDA_TAGS.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedTags.includes(tag.id)
                    ? `${tag.color} ring-2 ring-offset-1 ring-green-400`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {selectedTags.length} etiket seçildi
            </p>
          )}
        </div>

        {/* Mahalle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Mahalle
          </label>
          <select
            value={mahalle}
            onChange={(e) => setMahalle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white appearance-none"
          >
            <option value="">Mahalle Seçin...</option>
            {YILDIRIM_MAHALLELERI.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Durum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white appearance-none"
          >
            <option value="bekliyor">Bekliyor</option>
            <option value="gorusuldu">Görüşüldü</option>
            <option value="ertelendi">Ertelendi</option>
            <option value="iptal">İptal</option>
          </select>
        </div>

        {/* Öncelik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'dusuk', label: 'Düşük', color: 'bg-gray-100 text-gray-700 border-gray-300' },
              { value: 'orta', label: 'Orta', color: 'bg-blue-100 text-blue-700 border-blue-300' },
              { value: 'yuksek', label: 'Yüksek', color: 'bg-orange-100 text-orange-700 border-orange-300' },
              { value: 'acil', label: 'Acil', color: 'bg-red-100 text-red-700 border-red-300' },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                  priority === p.value 
                    ? `${p.color} ring-2 ring-offset-1 ring-green-400` 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toplantı Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Toplantı Tarihi</label>
          <input
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
          />
        </div>

        {/* Toplantı Saati */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Toplantı Saati</label>
          <input
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
          />
        </div>

        {/* Kimler Görebilsin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="w-4 h-4 inline mr-1" />
            Kimler Görebilsin?
          </label>
          <div 
            onClick={() => setShowUserSelector(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex justify-between items-center cursor-pointer hover:bg-gray-50"
          >
            <span className="text-gray-600">
              {selectedUsers.length > 0 ? `${selectedUsers.length} kişi seçili` : 'Seçim yapılmadı'}
            </span>
            <span className="text-green-600 text-sm font-medium">Düzenle</span>
          </div>
          
          {/* Seçili kullanıcılar */}
          {selectedUsers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedUsers.map(userId => {
                const selectedUser = staffList.find(u => u.id === userId);
                if (!selectedUser) return null;
                return (
                  <span
                    key={userId}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                  >
                    {selectedUser.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserSelection(userId);
                      }}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Kaydet Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Değişiklikleri Kaydet
        </button>

        {/* Sil Button */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full bg-red-50 text-red-600 py-4 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Gündemi Sil
        </button>
      </form>

      {/* User Selector Modal */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-green-50">
              <h3 className="font-semibold text-green-800">Görüntüleyecek Kişileri Seç</h3>
              <button onClick={() => { setShowUserSelector(false); setSearchTerm(''); }}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            {/* Arama */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kişi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              {staffList
                .filter(u => 
                  u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.title?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(u => (
                <div
                  key={u.id}
                  onClick={() => toggleUserSelection(u.id)}
                  className={`flex items-center justify-between p-4 border-b cursor-pointer transition-colors ${
                    selectedUsers.includes(u.id) ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.title || getRoleLabel(u.role)}</p>
                  </div>
                  {selectedUsers.includes(u.id) && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => { setShowUserSelector(false); setSearchTerm(''); }}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Tamam ({selectedUsers.length} kişi seçili)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Gündemi Sil</h3>
            <p className="text-gray-600 mb-4">
              Bu gündemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
